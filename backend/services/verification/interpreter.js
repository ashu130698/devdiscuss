const Verification = require("../../models/Verification");
const { requestInterpretation } = require("./openRouterProvider");

const STATUS_INTERPRETING = "INTERPRETING";
const STATUS_COMPLETED = "COMPLETED";
const STATUS_INTERPRETATION_FAILED = "INTERPRETATION_FAILED";
const VERDICTS = new Set([
  "VERIFIED",
  "PARTIALLY_VERIFIED",
  "NOT_VERIFIED",
]);

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function normalizeLimitations(limitations) {
  if (!Array.isArray(limitations)) {
    throw new Error("Interpretation limitations must be an array");
  }

  return limitations.map((limitation) => {
    if (
      !isPlainObject(limitation) ||
      typeof limitation.code !== "string" ||
      typeof limitation.description !== "string"
    ) {
      throw new Error("Interpretation returned an invalid limitation");
    }

    return {
      code: limitation.code,
      description: limitation.description,
    };
  });
}

function normalizeStringList(value, fieldName) {
  if (!Array.isArray(value) || value.some((entry) => typeof entry !== "string")) {
    throw new Error(`Interpretation ${fieldName} must be a string array`);
  }

  return value;
}

function createInterpretationContext(verification) {
  return {
    step0: verification.step0,
    execution: verification.execution,
    evidenceArtifacts: verification.evidenceArtifacts,
  };
}

function normalizeInterpretation(providerResponse, completedAt) {
  const result = providerResponse?.result;

  if (
    !isPlainObject(result) ||
    !VERDICTS.has(result.verdict) ||
    !Number.isFinite(result.confidence) ||
    result.confidence < 0 ||
    result.confidence > 100 ||
    typeof result.summary !== "string" ||
    typeof result.testedContext !== "string"
  ) {
    throw new Error("Provider returned an invalid interpretation result");
  }

  return {
    verdict: result.verdict,
    confidence: result.confidence,
    summary: result.summary,
    testedContext: result.testedContext,
    strengths: normalizeStringList(result.strengths, "strengths"),
    flaggedLimitations: normalizeLimitations(result.flaggedLimitations),
    recommendations: normalizeStringList(
      result.recommendations,
      "recommendations",
    ),
    completedAt,
  };
}

async function saveInterpretation(verificationId, interpretation) {
  return Verification.findOneAndUpdate(
    { _id: verificationId, status: STATUS_INTERPRETING },
    {
      $set: {
        interpretation,
        status: STATUS_COMPLETED,
        statusUpdatedAt: interpretation.completedAt,
      },
    },
    { new: true, runValidators: true },
  );
}

async function markInterpretationFailed(verificationId) {
  const completedAt = new Date();

  return Verification.findOneAndUpdate(
    { _id: verificationId, status: STATUS_INTERPRETING },
    {
      $set: {
        status: STATUS_INTERPRETATION_FAILED,
        statusUpdatedAt: completedAt,
      },
    },
    { new: true, runValidators: true },
  );
}

async function interpretVerification(verification) {
  if (!verification || verification.status !== STATUS_INTERPRETING) {
    return null;
  }

  try {
    const providerResponse = await requestInterpretation(
      createInterpretationContext(verification),
    );
    const interpretation = normalizeInterpretation(providerResponse, new Date());

    return saveInterpretation(verification._id, interpretation);
  } catch (error) {
    console.error("VERIFICATION INTERPRETATION ERROR:", error);
    return markInterpretationFailed(verification._id);
  }
}

module.exports = { interpretVerification };
