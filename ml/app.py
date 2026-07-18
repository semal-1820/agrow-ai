from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional

from model import generate_forecast

app = FastAPI(title="Agrow AI Forecast API")


class FinancialRecord(BaseModel):
    revenue: float = 0
    expenses: float = 0
    loanEMI: Optional[float] = 0
    assets: Optional[float] = 0
    liabilities: Optional[float] = 0
    month: Optional[str] = None


class ForecastRequest(BaseModel):
    records: List[FinancialRecord] = Field(..., min_items=1)
    enterpriseType: Optional[str] = "default"
    startMonthIndex: Optional[int] = 0


@app.get("/")
def home():
    return {"message": "Forecast API Running 🚀"}


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/forecast")
def forecast(payload: ForecastRequest):
    if len(payload.records) == 0:
        raise HTTPException(status_code=400, detail="At least one financial record is required.")

    revenue_history = [r.revenue for r in payload.records]
    expense_history = [r.expenses for r in payload.records]

    latest = payload.records[-1]

    try:
        result = generate_forecast(
            revenue_history=revenue_history,
            expense_history=expense_history,
            loan_emi=latest.loanEMI or 0,
            assets=latest.assets or 0,
            liabilities=latest.liabilities or 0,
            enterprise_type=payload.enterpriseType or "default",
            start_month_index=payload.startMonthIndex or 0,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    return result
