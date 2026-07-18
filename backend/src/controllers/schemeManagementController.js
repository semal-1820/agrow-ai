const SchemeApplication = require("../models/SchemeApplication");

// Get all scheme applications
exports.getApplications = async (req, res) => {
  try {
    const applications = await SchemeApplication.find()
      .populate("applicant", "name email")
      .populate("enterprise", "name type village district state")
      .populate("scheme", "name benefits")
      .populate("reviewedBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(applications);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// Approve or reject an application
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["Approved", "Rejected"].includes(status)) {
      return res.status(400).json({
        message: "Status must be Approved or Rejected",
      });
    }

    const application = await SchemeApplication.findById(id);

    if (!application) {
      return res.status(404).json({
        message: "Scheme application not found",
      });
    }

    application.status = status;
    application.reviewedBy = req.user.id;
    application.reviewedAt = new Date();

    await application.save();

    const updatedApplication = await SchemeApplication.findById(
      application._id
    )
      .populate("applicant", "name email")
      .populate("enterprise", "name type village district state")
      .populate("scheme", "name benefits")
      .populate("reviewedBy", "name email");

    res.status(200).json(updatedApplication);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// Get scheme performance
exports.getSchemePerformance = async (req, res) => {
  try {
    const performance = await SchemeApplication.aggregate([
      {
        $group: {
          _id: "$scheme",

          applications: {
            $sum: 1,
          },

          approved: {
            $sum: {
              $cond: [
                { $eq: ["$status", "Approved"] },
                1,
                0,
              ],
            },
          },

          rejected: {
            $sum: {
              $cond: [
                { $eq: ["$status", "Rejected"] },
                1,
                0,
              ],
            },
          },

          pending: {
            $sum: {
              $cond: [
                { $eq: ["$status", "Pending"] },
                1,
                0,
              ],
            },
          },

          disbursed: {
            $sum: "$disbursedAmount",
          },
        },
      },

      {
        $lookup: {
          from: "governmentschemes",
          localField: "_id",
          foreignField: "_id",
          as: "scheme",
        },
      },

      {
        $unwind: {
          path: "$scheme",
          preserveNullAndEmptyArrays: true,
        },
      },

      {
        $project: {
          _id: 0,
          schemeId: "$_id",

          name: {
            $ifNull: [
              "$scheme.name",
              "Unknown Scheme",
            ],
          },

          applications: 1,
          approved: 1,
          rejected: 1,
          pending: 1,
          disbursed: 1,
        },
      },

      {
        $sort: {
          applications: -1,
        },
      },
    ]);

    res.status(200).json(performance);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// Get beneficiaries
exports.getBeneficiaries = async (req, res) => {
  try {
    const beneficiaries = await SchemeApplication.find({
      status: "Approved",
      disbursedAmount: {
        $gt: 0,
      },
    })
      .populate("applicant", "name email")
      .populate("enterprise", "name")
      .populate("scheme", "name")
      .sort({ disbursedOn: -1 });

    res.status(200).json(beneficiaries);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// Record scheme disbursement
exports.disburseApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;

    const application = await SchemeApplication.findById(id);

    if (!application) {
      return res.status(404).json({
        message: "Scheme application not found",
      });
    }

    if (application.status !== "Approved") {
      return res.status(400).json({
        message:
          "Only approved applications can receive disbursement",
      });
    }

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({
        message:
          "A valid disbursement amount is required",
      });
    }

    application.disbursedAmount = Number(amount);
    application.disbursedOn = new Date();

    await application.save();

    res.status(200).json(application);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};