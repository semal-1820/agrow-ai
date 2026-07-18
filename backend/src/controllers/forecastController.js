const FinancialRecord = require("../models/FinancialRecord");
const ForecastResult = require("../models/ForecastResult");
const { generateForecast } = require("../services/forecastService");

exports.forecastCashFlow = async (req, res) => {
  try {
    const { enterpriseId } = req.params;

    // Get all financial records for the enterprise
    const records = await FinancialRecord.find({
      enterprise: enterpriseId,
    }).sort({ month: 1 });

    if (records.length === 0) {
      return res.status(404).json({
        message: "No financial records found for this enterprise.",
      });
    }

    // Prepare data for FastAPI
    const payload = records.map((record) => ({
      revenue: record.revenue,
      expenses: record.expenses,
      profit: record.revenue - record.expenses,
    }));

    // Call ML service
    const forecast = await generateForecast(payload);

    // Save forecast in MongoDB
    const savedForecast = await ForecastResult.create({
      enterprise: enterpriseId,
      forecastData: forecast,
      generatedAt: new Date(),
    });

    res.status(200).json(savedForecast);
  } catch (err) {
    console.error("Forecast Error:", err);
    res.status(500).json({
      message: err.message,
    });
  }
};