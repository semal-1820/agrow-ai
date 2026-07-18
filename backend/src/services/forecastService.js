const axios = require("axios");

const PYTHON_API = process.env.ML_SERVICE_URL || "http://127.0.0.1:8000";

const REQUEST_TIMEOUT_MS = 8000;
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 500;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const mlClient = axios.create({
  baseURL: PYTHON_API,
  timeout: REQUEST_TIMEOUT_MS,
});

/**
 * Local fallback forecast, used only if the Python ML service is
 * unreachable/times out after retries. Keeps the feature usable end-to-end
 * (with an honest, lower confidence score) instead of hard-failing.
 */
const fallbackForecast = (records) => {
  const revenues = records.map((r) => r.revenue || 0);
  const expenses = records.map((r) => r.expenses || 0);

  const avg = (arr) =>
    arr.length ? arr.reduce((sum, v) => sum + v, 0) / arr.length : 0;

  const avgRevenue = avg(revenues);
  const avgExpense = avg(expenses);

  const revenueProjection = [];
  const expenseProjection = [];
  const profitProjection = [];
  const cashFlowForecast = [];

  const lastEMI = records[records.length - 1]?.loanEMI || 0;

  for (let i = 1; i <= 6; i += 1) {
    const revenue = Math.max(0, avgRevenue * (1 + 0.01 * i));
    const expense = Math.max(0, avgExpense * (1 + 0.005 * i));

    revenueProjection.push(Number(revenue.toFixed(2)));
    expenseProjection.push(Number(expense.toFixed(2)));
    profitProjection.push(Number((revenue - expense).toFixed(2)));
    cashFlowForecast.push(Number((revenue - expense - lastEMI).toFixed(2)));
  }

  const growthPercentage =
    revenueProjection[0] > 0
      ? Number(
          (
            ((revenueProjection[5] - revenueProjection[0]) /
              revenueProjection[0]) *
            100
          ).toFixed(2)
        )
      : 0;

  return {
    revenueProjection,
    expenseProjection,
    profitProjection,
    cashFlowForecast,
    growthPercentage,
    confidence: 0.35,
    trend: growthPercentage > 5 ? "Increasing" : growthPercentage < -5 ? "Decreasing" : "Stable",
    explanation: [
      "Forecast generated using a local fallback model because the AI forecast service was unavailable.",
      "Treat this projection as indicative only; try generating the forecast again shortly for a full model-based result.",
    ],
    forecastDate: new Date().toISOString(),
    isFallback: true,
  };
};

/**
 * Calls the FastAPI forecast microservice with retry + timeout handling.
 * Falls back to a local estimate if the service cannot be reached at all.
 *
 * @param {Array} records - financial records: { revenue, expenses, loanEMI, assets, liabilities, month }
 * @param {Object} meta - { enterpriseType, startMonthIndex }
 */
exports.generateForecast = async (records, meta = {}) => {
  if (!Array.isArray(records) || records.length === 0) {
    throw new Error("No financial records available to generate a forecast.");
  }

  const payload = {
    records: records.map((r) => ({
      revenue: r.revenue || 0,
      expenses: r.expenses || 0,
      loanEMI: r.loanEMI || 0,
      assets: r.assets || 0,
      liabilities: r.liabilities || 0,
      month: r.month || null,
    })),
    enterpriseType: meta.enterpriseType || "default",
    startMonthIndex: meta.startMonthIndex || 0,
  };

  let lastError = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
    try {
      const response = await mlClient.post("/forecast", payload);
      return { ...response.data, isFallback: false };
    } catch (err) {
      lastError = err;

      const isLastAttempt = attempt === MAX_RETRIES;
      const isTimeout = err.code === "ECONNABORTED";
      const isConnRefused = err.code === "ECONNREFUSED";

      console.error(
        `Forecast ML call failed (attempt ${attempt + 1}/${MAX_RETRIES + 1}):`,
        err.response?.status,
        err.response?.data || err.message
      );

      // 4xx from the ML service means our payload is bad — no point retrying.
      if (err.response && err.response.status >= 400 && err.response.status < 500) {
        throw new Error(
          err.response?.data?.detail || err.response?.data?.message || "Invalid forecast request."
        );
      }

      if (!isLastAttempt && (isTimeout || isConnRefused || !err.response)) {
        await sleep(RETRY_DELAY_MS * (attempt + 1));
        continue;
      }
    }
  }

  console.error(
    "AI Forecast service unavailable after retries, using local fallback forecast.",
    lastError?.message
  );

  return fallbackForecast(records);
};
