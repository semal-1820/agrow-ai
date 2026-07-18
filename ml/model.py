"""
Agrow AI - Forecast Engine
--------------------------
Genuine statistical forecasting for revenue, expenses, profit and cash flow.

Approach:
- Linear Regression (scikit-learn) is used as the primary predictor when there
  is enough history (>= 3 points) to fit a trend line.
- A weighted Moving Average is used as a fallback / smoothing signal when
  history is short or the regression fit is unstable.
- The two signals are blended so the forecast is never purely a straight-line
  extrapolation, which keeps predictions more realistic for small, seasonal
  rural enterprises.
- A confidence score (0-1) is derived from data completeness, revenue
  variance, and the regression R^2 score.
- A short, human-readable explanation is generated from the same signals used
  to build the forecast, so the number is never a black box.
"""

from datetime import datetime
from typing import List, Dict, Any

import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.metrics import r2_score

FORECAST_MONTHS = 6

# Simple seasonal multipliers for common Indian rural/agri enterprise types.
# Values > 1 mean a seasonally strong month, < 1 a seasonally weak month.
SEASONALITY_PROFILES: Dict[str, List[float]] = {
    "agriculture": [0.9, 0.9, 1.0, 1.1, 1.2, 1.1, 0.9, 0.8, 0.9, 1.1, 1.3, 1.2],
    "dairy": [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0],
    "handicrafts": [0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 1.0, 1.1, 1.2, 1.3, 1.4, 1.2],
    "retail": [0.9, 0.9, 0.9, 0.9, 1.0, 1.0, 1.0, 1.0, 1.0, 1.1, 1.3, 1.3],
    "default": [1.0] * 12,
}


def _clean_series(values: List[float]) -> np.ndarray:
    """Coerce a list of numbers into a clean numpy array (no NaN/None)."""
    arr = np.array([float(v) if v is not None else 0.0 for v in values], dtype=float)
    return arr


def _linear_regression_forecast(series: np.ndarray, steps: int):
    """Fit a linear trend line and project `steps` points forward.

    Returns (predictions, r2, slope) or (None, 0.0, 0.0) if it can't be fit.
    """
    n = len(series)

    if n < 3:
        return None, 0.0, 0.0

    x = np.arange(n).reshape(-1, 1)
    y = series

    model = LinearRegression()
    model.fit(x, y)

    fitted = model.predict(x)

    try:
        r2 = float(r2_score(y, fitted))
    except ValueError:
        r2 = 0.0

    r2 = max(0.0, min(1.0, r2))

    future_x = np.arange(n, n + steps).reshape(-1, 1)
    predictions = model.predict(future_x)

    # Predictions shouldn't go negative for revenue/expenses.
    predictions = np.clip(predictions, a_min=0, a_max=None)

    return predictions, r2, float(model.coef_[0])


def _moving_average_forecast(series: np.ndarray, steps: int, window: int = 3):
    """Weighted moving average projection (more weight on recent months)."""
    n = len(series)

    if n == 0:
        return np.zeros(steps)

    w = min(window, n)
    recent = series[-w:]

    weights = np.arange(1, w + 1)
    weighted_avg = float(np.dot(recent, weights) / weights.sum())

    return np.full(steps, weighted_avg)


def _apply_seasonality(predictions: np.ndarray, enterprise_type: str, start_month_index: int):
    profile = SEASONALITY_PROFILES.get(
        (enterprise_type or "default").strip().lower(), SEASONALITY_PROFILES["default"]
    )

    adjusted = []
    for i, value in enumerate(predictions):
        month_idx = (start_month_index + i) % 12
        adjusted.append(value * profile[month_idx])

    return np.array(adjusted)


def _confidence_score(series: np.ndarray, r2: float, min_points_required: int = 6) -> float:
    """Blend data completeness, stability (inverse variance) and fit quality."""
    n = len(series)

    completeness = min(1.0, n / min_points_required)

    mean = float(np.mean(series)) if n > 0 else 0.0
    std = float(np.std(series)) if n > 0 else 0.0

    if mean > 0:
        cv = std / mean
        stability = max(0.0, 1.0 - min(cv, 1.5) / 1.5)
    else:
        stability = 0.3

    fit_quality = r2 if n >= 3 else 0.4

    confidence = (completeness * 0.35) + (stability * 0.35) + (fit_quality * 0.30)

    return round(max(0.05, min(0.98, confidence)), 2)


def _trend_label(growth_pct: float) -> str:
    if growth_pct > 5:
        return "Increasing"
    if growth_pct < -5:
        return "Decreasing"
    return "Stable"


def _build_explanation(
    growth_pct: float,
    trend: str,
    debt_ratio: float,
    cash_flow_positive: bool,
    seasonality_applied: bool,
    confidence: float,
) -> List[str]:
    reasons = []

    if trend == "Increasing":
        reasons.append(f"Revenue trend is increasing (~{growth_pct}% projected growth).")
    elif trend == "Decreasing":
        reasons.append(f"Revenue trend is declining (~{growth_pct}% projected change).")
    else:
        reasons.append("Revenue has been broadly stable over recent months.")

    if debt_ratio <= 0.4:
        reasons.append("Low debt-to-asset ratio supports a stable outlook.")
    elif debt_ratio > 0.7:
        reasons.append("High debt-to-asset ratio adds pressure to future cash flow.")

    if cash_flow_positive:
        reasons.append("Historical cash flow after expenses and EMI has stayed positive.")
    else:
        reasons.append("Historical cash flow after expenses and EMI has been tight or negative.")

    if seasonality_applied:
        reasons.append("Projection adjusted for seasonal demand patterns of this enterprise type.")

    reasons.append(f"Overall forecast confidence is {int(confidence * 100)}% based on data history and stability.")

    return reasons


def generate_forecast(
    revenue_history: List[float],
    expense_history: List[float],
    loan_emi: float = 0.0,
    assets: float = 0.0,
    liabilities: float = 0.0,
    enterprise_type: str = "default",
    start_month_index: int = 0,
) -> Dict[str, Any]:
    """Main entry point used by the FastAPI route."""

    revenue_series = _clean_series(revenue_history)
    expense_series = _clean_series(expense_history)

    if len(revenue_series) == 0:
        raise ValueError("At least one financial record is required to generate a forecast.")

    # --- Revenue projection ---
    reg_pred, r2, slope = _linear_regression_forecast(revenue_series, FORECAST_MONTHS)
    ma_pred = _moving_average_forecast(revenue_series, FORECAST_MONTHS)

    if reg_pred is not None:
        reg_weight = min(0.7, 0.3 + 0.05 * len(revenue_series))
        revenue_projection = (reg_weight * reg_pred) + ((1 - reg_weight) * ma_pred)
    else:
        revenue_projection = ma_pred

    seasonality_applied = (enterprise_type or "default").strip().lower() in SEASONALITY_PROFILES
    revenue_projection = _apply_seasonality(revenue_projection, enterprise_type, start_month_index)
    revenue_projection = np.clip(revenue_projection, a_min=0, a_max=None)

    # --- Expense projection ---
    if len(expense_series) > 0:
        exp_reg_pred, exp_r2, _ = _linear_regression_forecast(expense_series, FORECAST_MONTHS)
        exp_ma_pred = _moving_average_forecast(expense_series, FORECAST_MONTHS)

        if exp_reg_pred is not None:
            exp_weight = min(0.6, 0.3 + 0.05 * len(expense_series))
            expense_projection = (exp_weight * exp_reg_pred) + ((1 - exp_weight) * exp_ma_pred)
        else:
            expense_projection = exp_ma_pred

        expense_projection = np.clip(expense_projection, a_min=0, a_max=None)
    else:
        expense_projection = np.zeros(FORECAST_MONTHS)

    # --- Profit & cash flow projection ---
    monthly_emi = float(loan_emi or 0.0)
    profit_projection = revenue_projection - expense_projection
    cash_flow_projection = profit_projection - monthly_emi

    # --- Growth percentage (first vs last projected revenue month) ---
    if revenue_projection[0] > 0:
        growth_pct = round(
            ((revenue_projection[-1] - revenue_projection[0]) / revenue_projection[0]) * 100, 2
        )
    else:
        growth_pct = 0.0

    trend = _trend_label(growth_pct)

    # --- Confidence ---
    confidence = _confidence_score(revenue_series, r2)

    # --- Explanation ---
    debt_ratio = (liabilities / assets) if assets and assets > 0 else (1.0 if liabilities else 0.0)

    historical_cash_flow = (
        revenue_series - expense_series[: len(revenue_series)] if len(expense_series) else revenue_series
    )
    cash_flow_positive = bool(np.mean(historical_cash_flow) - monthly_emi >= 0) if len(historical_cash_flow) else True

    explanation = _build_explanation(
        growth_pct, trend, debt_ratio, cash_flow_positive, seasonality_applied, confidence
    )

    forecast_date = datetime.utcnow().isoformat()

    return {
        "revenueProjection": [round(float(v), 2) for v in revenue_projection],
        "expenseProjection": [round(float(v), 2) for v in expense_projection],
        "profitProjection": [round(float(v), 2) for v in profit_projection],
        "cashFlowForecast": [round(float(v), 2) for v in cash_flow_projection],
        "growthPercentage": growth_pct,
        "confidence": confidence,
        "trend": trend,
        "explanation": explanation,
        "forecastDate": forecast_date,
    }
