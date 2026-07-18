const GovernmentScheme = require("../models/GovernmentScheme");
const Enterprise = require("../models/Enterprise");
const {
  calculateSchemeMatch,
} = require("../services/schemeService");

// Get all government schemes
exports.getSchemes = async (req, res) => {
  try {
    const schemes = await GovernmentScheme.find().sort({
      createdAt: -1,
    });

    res.status(200).json(schemes);
  } catch (err) {
    console.error("Get Schemes Error:", err);

    res.status(500).json({
      message: err.message,
    });
  }
};

// Create a government scheme
exports.createScheme = async (req, res) => {
  try {
    const scheme = await GovernmentScheme.create(req.body);

    res.status(201).json(scheme);
  } catch (err) {
    console.error("Create Scheme Error:", err);

    res.status(500).json({
      message: err.message,
    });
  }
};

// Get eligible schemes for an enterprise
exports.getEligibleSchemes = async (req, res) => {
  try {
    const { enterpriseId } = req.params;

    const enterprise = await Enterprise.findById(enterpriseId);

    if (!enterprise) {
      return res.status(404).json({
        message: "Enterprise not found.",
      });
    }

    const schemes = await GovernmentScheme.find();

    const recommendations = schemes
      .map((scheme) => {
        const match = calculateSchemeMatch(
          enterprise,
          scheme
        );

        return {
          schemeId: scheme._id,
          name: scheme.name,
          matchPercentage: match.matchPercentage,
          reasons: match.reasons,
          benefits: scheme.benefits,
          requiredDocuments: scheme.requiredDocuments,
        };
      })
      .filter((scheme) => scheme.matchPercentage > 0)
      .sort(
        (a, b) =>
          b.matchPercentage - a.matchPercentage
      );

    res.status(200).json({
      enterprise: enterpriseId,
      recommendations,
    });
  } catch (err) {
    console.error(
      "Scheme Recommendation Error:",
      err
    );

    res.status(500).json({
      message: err.message,
    });
  }
};