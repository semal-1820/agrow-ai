const FinancialRecord = require("../models/FinancialRecord");
const ForecastResult = require("../models/ForecastResult");
const Enterprise = require("../models/Enterprise");
const { generateForecast } = require("../services/forecastService");

exports.forecastCashFlow = async (req, res) => {
  try {
    const { enterpriseId } = req.params;

    // Get all financial records for the enterprise
    const records = await FinancialRecord.find({
      enterprise: enterpriseId,
    }).sort({ month: 1, createdAt: 1 });

    if (records.length === 0) {
      return res.status(404).json({
        message: "No financial records found for this enterprise.",
      });
    }

    const enterprise = await Enterprise.findById(enterpriseId);

    // Prepare data for the ML service. Previously this dropped loanEMI,
    // assets and liabilities (sent "profit" instead, which the model
    // doesn't use), which meant debt ratio / cash-flow explanations were
    // always computed on zeros. Fixed to pass the real fields.
    const payload = records.map((record) => ({
      revenue: record.revenue || 0,
      expenses: record.expenses || 0,
      loanEMI: record.loanEMI || 0,
      assets: record.assets || 0,
      liabilities: record.liabilities || 0,
      month: record.month || null,
    }));

    const forecast = await generateForecast(payload, {
      enterpriseType: enterprise?.type || "default",
      startMonthIndex: records.length % 12,
    });

    // NOTE: previously this saved `{ enterprise, forecastData: forecast,
    // generatedAt }`. ForecastResult's schema has no `forecastData` or
    // `generatedAt` field, so Mongoose (strict mode, the default) silently
    // dropped both on save — every stored forecast was empty. Fixed by
    // saving the fields the schema actually defines.
    const savedForecast = await ForecastResult.create({
      enterprise: enterpriseId,
      revenueProjection: forecast.revenueProjection || [],
      expenseProjection: forecast.expenseProjection || [],
      profitProjection: forecast.profitProjection || [],
      cashFlowForecast: forecast.cashFlowForecast || [],
      confidence: forecast.confidence || 0,
      growthPercentage: forecast.growthPercentage || 0,
      trend: forecast.trend || "Stable",
      explanation: forecast.explanation || [],
      isFallback: !!forecast.isFallback,
      forecastDate: forecast.forecastDate ? new Date(forecast.forecastDate) : new Date(),
      enterpriseType: enterprise?.type || "default",
    });

    res.status(200).json(savedForecast);
  } catch (err) {
    console.error("Forecast Error:", err);
    res.status(500).json({
      message: err.message,
    });
  }
};

// ==========================================
// MODULE 5 - FORECAST ACCURACY TRACKING
// ==========================================
//
// Data-model reality check: FinancialRecord.month is a free-text string
// entered by the user (no guaranteed calendar format), and forecasts are
// generated relative to "months ahead" rather than named calendar months.
// So exact date-matching between a forecast and a later actual record isn't
// reliable. What we CAN do honestly: take the most recent forecast, and
// compare its projected values position-by-position against the actual
// FinancialRecord entries that were added AFTER that forecast was
// generated, in the order they were added. This is an approximation and is
// labeled as such in the response rather than presented as exact.

const buildComparison = async (enterpriseId) => {
  const forecast = await ForecastResult.findOne({
    enterprise: enterpriseId,
  }).sort({ createdAt: -1 });

  if (!forecast) {
    return null;
  }

  const actualRecords = await FinancialRecord.find({
    enterprise: enterpriseId,
    createdAt: { $gt: forecast.createdAt },
  }).sort({ createdAt: 1 });

  const comparisons = [];
  const count = Math.min(actualRecords.length, forecast.revenueProjection.length);

  for (let i = 0; i < count; i += 1) {
    const predicted = forecast.revenueProjection[i] || 0;
    const actual = actualRecords[i].revenue || 0;
    const difference = Number((actual - predicted).toFixed(2));

    let accuracyPercent;
    if (actual === 0 && predicted === 0) {
      accuracyPercent = 100;
    } else if (actual === 0) {
      accuracyPercent = 0;
    } else {
      accuracyPercent = Math.max(
        0,
        Math.round((1 - Math.abs(difference) / Math.abs(actual)) * 100)
      );
    }

    comparisons.push({
      monthIndex: i + 1,
      month: actualRecords[i].month || `Month ${i + 1}`,
      predictedRevenue: predicted,
      actualRevenue: actual,
      difference,
      accuracyPercent,
    });
  }

  const overallAccuracy = comparisons.length
    ? Number(
        (
          comparisons.reduce((sum, c) => sum + c.accuracyPercent, 0) / comparisons.length
        ).toFixed(2)
      )
    : null;

  return { forecast, comparisons, overallAccuracy };
};

exports.getForecastComparison = async (req, res) => {
  try {
    const { enterpriseId } = req.params;

    const result = await buildComparison(enterpriseId);

    if (!result) {
      return res.status(404).json({
        message: "No forecast found for this enterprise yet.",
      });
    }

    if (result.comparisons.length === 0) {
      return res.status(200).json({
        enterprise: enterpriseId,
        forecastId: result.forecast._id,
        message:
          "No actual financial records have been recorded since the last forecast, so there is nothing to compare yet.",
        comparisons: [],
      });
    }

    res.status(200).json({
      enterprise: enterpriseId,
      forecastId: result.forecast._id,
      forecastDate: result.forecast.forecastDate,
      note: "Comparison is approximate: it matches actual records added after the forecast, in order, against the projected months. It is not a calendar-exact match.",
      comparisons: result.comparisons,
      overallAccuracy: result.overallAccuracy,
    });
  } catch (err) {
    console.error("Forecast Comparison Error:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.getForecastAccuracy = async (req, res) => {
  try {
    const { enterpriseId } = req.params;

    const result = await buildComparison(enterpriseId);

    if (!result) {
      return res.status(404).json({
        message: "No forecast found for this enterprise yet.",
      });
    }

    // Persist the latest accuracy snapshot on the forecast document.
    result.forecast.accuracyLog = result.comparisons.map((c) => ({
      monthIndex: c.monthIndex,
      predictedRevenue: c.predictedRevenue,
      actualRevenue: c.actualRevenue,
      difference: c.difference,
      accuracyPercent: c.accuracyPercent,
    }));
    result.forecast.overallAccuracy = result.overallAccuracy;
    await result.forecast.save();

    res.status(200).json({
      enterprise: enterpriseId,
      forecastId: result.forecast._id,
      overallAccuracy: result.overallAccuracy,
      pointsCompared: result.comparisons.length,
      confidenceAtForecastTime: result.forecast.confidence,
    });
  } catch (err) {
    console.error("Forecast Accuracy Error:", err);
    res.status(500).json({ message: err.message });
  }
};
