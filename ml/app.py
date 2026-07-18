from fastapi import FastAPI
from pydantic import BaseModel
from typing import List

app = FastAPI(title="Agrow AI Forecast API")


class FinancialRecord(BaseModel):
    revenue: float
    expenses: float
    profit: float


@app.get("/")
def home():
    return {"message": "Forecast API Running 🚀"}


@app.post("/forecast")
def forecast(records: List[FinancialRecord]):
    if len(records) == 0:
        return {"forecast": []}

    avg_profit = sum(r.profit for r in records) / len(records)

    predictions = []

    current = avg_profit

    for month in range(1, 7):
        current *= 1.03  # Example: 3% monthly growth
        predictions.append({
            "month": month,
            "predicted_profit": round(current, 2)
        })

    return {
        "forecast": predictions
    }