const path = require("path");

const Report = require("../models/Report");
const Enterprise = require("../models/Enterprise");
const FinancialRecord = require("../models/FinancialRecord");
const ForecastResult = require("../models/ForecastResult");
const RiskAssessment = require("../models/RiskAssessment");

const {
  generatePDF,
} = require("../services/reportService");

exports.generateReport = async (req, res) => {
  try {
    const { enterpriseId, type } = req.body;

    const validTypes = [
      "Financial",
      "Forecast",
      "Risk",
    ];

    if (!validTypes.includes(type)) {
      return res.status(400).json({
        message:
          "Invalid report type. Use Financial, Forecast, or Risk.",
      });
    }

    const enterprise =
      await Enterprise.findById(enterpriseId);

    if (!enterprise) {
      return res.status(404).json({
        message: "Enterprise not found.",
      });
    }

    const reportData = {
      type,
      enterprise,
    };

    if (type === "Financial") {
      reportData.financialRecords =
        await FinancialRecord.find({
          enterprise: enterpriseId,
        }).sort({ month: 1 });
    }

    if (type === "Forecast") {
      reportData.forecast =
        await ForecastResult.findOne({
          enterprise: enterpriseId,
        }).sort({ createdAt: -1 });

      if (!reportData.forecast) {
        return res.status(404).json({
          message:
            "No forecast found. Generate a forecast first.",
        });
      }
    }

    if (type === "Risk") {
      reportData.risk =
        await RiskAssessment.findOne({
          enterprise: enterpriseId,
        }).sort({ createdAt: -1 });

      if (!reportData.risk) {
        return res.status(404).json({
          message:
            "No risk assessment found. Generate a risk assessment first.",
        });
      }
    }

    const generated =
      await generatePDF(reportData);

    const fileUrl = `/uploads/reports/${generated.fileName}`;

    const report = await Report.create({
      enterprise: enterpriseId,
      type,
      fileUrl,
    });

    res.status(201).json(report);
  } catch (err) {
    console.error("Report Generation Error:", err);

    res.status(500).json({
      message: err.message,
    });
  }
};

exports.getReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .populate(
        "enterprise",
        "name type village district state"
      )
      .sort({ createdAt: -1 });

    res.status(200).json(reports);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

exports.getReport = async (req, res) => {
  try {
    const report = await Report.findById(
      req.params.id
    ).populate("enterprise");

    if (!report) {
      return res.status(404).json({
        message: "Report not found.",
      });
    }

    res.status(200).json(report);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

exports.downloadReport = async (req, res) => {
  try {
    const report = await Report.findById(
      req.params.id
    );

    if (!report) {
      return res.status(404).json({
        message: "Report not found.",
      });
    }

    const fileName = path.basename(
      report.fileUrl
    );

    const filePath = path.join(
      __dirname,
      "../../uploads/reports",
      fileName
    );

    res.download(filePath);
  } catch (err) {
    console.error("Report Download Error:", err);

    res.status(500).json({
      message: err.message,
    });
  }
};