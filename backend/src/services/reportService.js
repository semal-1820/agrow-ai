const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

exports.generatePDF = (reportData) => {
  return new Promise((resolve, reject) => {
    try {
      const reportsDirectory = path.join(
        __dirname,
        "../../uploads/reports"
      );

      if (!fs.existsSync(reportsDirectory)) {
        fs.mkdirSync(reportsDirectory, {
          recursive: true,
        });
      }

      const fileName = `report-${Date.now()}.pdf`;

      const filePath = path.join(
        reportsDirectory,
        fileName
      );

      const doc = new PDFDocument({
        margin: 50,
      });

      const stream = fs.createWriteStream(filePath);

      doc.pipe(stream);

      doc.fontSize(24).text("Agrow AI", {
        align: "center",
      });

      doc.moveDown();

      doc.fontSize(18).text(
        `${reportData.type} Report`,
        {
          align: "center",
        }
      );

      doc.moveDown(2);

      doc.fontSize(12);

      doc.text(
        `Enterprise: ${reportData.enterprise.name || "N/A"}`
      );

      doc.text(
        `Enterprise Type: ${reportData.enterprise.type || "N/A"}`
      );

      doc.text(
        `Village: ${reportData.enterprise.village || "N/A"}`
      );

      doc.text(
        `District: ${reportData.enterprise.district || "N/A"}`
      );

      doc.text(
        `State: ${reportData.enterprise.state || "N/A"}`
      );

      doc.text(
        `Generated: ${new Date().toLocaleString()}`
      );

      doc.moveDown(2);

      if (
        reportData.type === "Financial" &&
        reportData.financialRecords
      ) {
        doc.fontSize(16).text("Financial Records");

        doc.moveDown();

        reportData.financialRecords.forEach(
          (record) => {
            doc.fontSize(11).text(
              `Month: ${record.month || "N/A"}`
            );

            doc.text(
              `Revenue: ${record.revenue || 0}`
            );

            doc.text(
              `Expenses: ${record.expenses || 0}`
            );

            doc.text(
              `Loan EMI: ${record.loanEMI || 0}`
            );

            doc.text(
              `Assets: ${record.assets || 0}`
            );

            doc.text(
              `Liabilities: ${record.liabilities || 0}`
            );

            doc.moveDown();
          }
        );
      }

     if (
        reportData.type === "Forecast" &&
        reportData.forecast
        ) {
        doc.fontSize(16).text("6-Month Financial Forecast");

        doc.moveDown();

        doc.fontSize(13).text("Cash Flow Forecast");

        reportData.forecast.cashFlowForecast.forEach(
            (value, index) => {
            doc.fontSize(11).text(
                `Month ${index + 1}: ${value}`
            );
            }
        );

        doc.moveDown();

        doc.fontSize(13).text("Revenue Projection");

        reportData.forecast.revenueProjection.forEach(
            (value, index) => {
            doc.fontSize(11).text(
                `Month ${index + 1}: ${value}`
            );
            }
        );

        doc.moveDown();

        doc.fontSize(13).text("Expense Projection");

        reportData.forecast.expenseProjection.forEach(
            (value, index) => {
            doc.fontSize(11).text(
                `Month ${index + 1}: ${value}`
            );
            }
        );

        doc.moveDown();

        doc.fontSize(11).text(
            `Confidence Score: ${Math.round(
            (reportData.forecast.confidence || 0) * 100
            )}%`
        );
        }
      if (
        reportData.type === "Risk" &&
        reportData.risk
      ) {
        doc.fontSize(16).text("Risk Assessment");

        doc.moveDown();

        doc.fontSize(11).text(
          `Risk Score: ${reportData.risk.score}`
        );

        doc.text(
          `Risk Level: ${reportData.risk.level}`
        );

        doc.moveDown();

        doc.text("Risk Factors:");

        reportData.risk.factors.forEach(
          (factor) => {
            doc.text(`- ${factor}`);
          }
        );

        doc.moveDown();

        doc.text("Suggested Actions:");

        reportData.risk.suggestions.forEach(
          (suggestion) => {
            doc.text(`- ${suggestion}`);
          }
        );
      }

      doc.end();

      stream.on("finish", () => {
        resolve({
          fileName,
          filePath,
        });
      });

      stream.on("error", reject);
    } catch (error) {
      reject(error);
    }
  });
};