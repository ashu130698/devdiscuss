const mongoose = require("mongoose");
const Verification = require("../models/Verification");

exports.getVerificationByAnswer = async (req, res) => {
  const { answerId } = req.params;

  if (!mongoose.isValidObjectId(answerId)) {
    return res.status(400).json({ error: "Invalid answer id" });
  }

  try {
    const verification = await Verification.findOne({ answerId })
      .sort({ createdAt: -1 })
      .select(
        "status step0 execution evidenceArtifacts interpretation statusUpdatedAt createdAt updatedAt",
      );

    if (!verification) {
      return res.status(404).json({ error: "Verification not found" });
    }

    return res.json({
      status: verification.status,
      step0: verification.step0,
      execution: verification.execution,
      evidenceArtifacts: verification.evidenceArtifacts,
      interpretation: verification.interpretation,
      timestamps: {
        createdAt: verification.createdAt,
        updatedAt: verification.updatedAt,
        statusUpdatedAt: verification.statusUpdatedAt,
      },
    });
  } catch (error) {
    console.error("GET VERIFICATION ERROR:", error);
    return res.status(500).json({ error: "Failed to fetch verification" });
  }
};
