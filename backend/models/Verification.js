const mongoose = require("mongoose");

const VERIFICATION_STATUSES = Object.freeze([
  "PENDING",
  "SCREENING",
  "SCREENING_FAILED",
  "EXECUTING",
  "EXECUTION_FAILED",
  "INTERPRETING",
  "VERIFIED",
  "FAILED",
]);

const VERIFICATION_TYPES = Object.freeze(["REPRODUCIBILITY"]);

const STATUS_TRANSITIONS = Object.freeze({
  PENDING: ["SCREENING"],
  SCREENING: ["SCREENING_FAILED", "EXECUTING"],
  SCREENING_FAILED: [],
  EXECUTING: ["EXECUTION_FAILED", "INTERPRETING"],
  EXECUTION_FAILED: [],
  INTERPRETING: ["VERIFIED", "FAILED"],
  VERIFIED: [],
  FAILED: [],
});

const riskIndicatorSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
  },
  { _id: false },
);

const limitationSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
  },
  { _id: false },
);

const step0Schema = new mongoose.Schema(
  {
    isReproducible: { type: Boolean, required: true },
    screeningDecision: {
      type: String,
      enum: ["PROCEED", "BLOCK"],
      required: true,
    },
    detectedStack: { type: [String], default: [] },
    riskIndicators: { type: [riskIndicatorSchema], default: [] },
    flaggedLimitations: { type: [limitationSchema], default: [] },
    reasoning: { type: String, required: true, trim: true },
    completedAt: { type: Date, required: true },
  },
  { _id: false },
);

const executionSchema = new mongoose.Schema(
  {
    runtime: String,
    nodeVersion: String,
    framework: String,
    exitCode: Number,
    startedAt: Date,
    completedAt: Date,
    duration: { type: Number, min: 0 },
  },
  { _id: false },
);

const evidenceArtifactSchema = new mongoose.Schema(
  {
    artifactType: {
      type: String,
      enum: ["stdout", "stderr", "reproductionScript", "environmentMetadata"],
      required: true,
    },
    name: { type: String, required: true, trim: true },
    downloadUrl: { type: String, required: true, trim: true },
    contentType: { type: String, required: true, trim: true },
    sizeBytes: { type: Number, min: 0 },
    createdAt: { type: Date, required: true },
  },
  { _id: false },
);

const interpretationSchema = new mongoose.Schema(
  {
    verdict: {
      type: String,
      enum: ["SUPPORTED", "UNSUPPORTED", "INCONCLUSIVE"],
      required: true,
    },
    summary: { type: String, required: true, trim: true },
    testedContext: { type: String, required: true, trim: true },
    flaggedLimitations: { type: [limitationSchema], default: [] },
    completedAt: { type: Date, required: true },
  },
  { _id: false },
);

const verificationSchema = new mongoose.Schema(
  {
    answerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Answer",
      required: true,
      immutable: true,
    },
    verificationType: {
      type: String,
      enum: VERIFICATION_TYPES,
      required: true,
      immutable: true,
    },
    idempotencyKey: {
      type: String,
      required: true,
      trim: true,
      immutable: true,
    },
    status: {
      type: String,
      enum: VERIFICATION_STATUSES,
      required: true,
      default: "PENDING",
    },
    statusUpdatedAt: { type: Date, required: true, default: Date.now },
    step0: step0Schema,
    execution: executionSchema,
    evidenceArtifacts: { type: [evidenceArtifactSchema], default: [] },
    interpretation: interpretationSchema,
  },
  { timestamps: true, optimisticConcurrency: true },
);

// Supports fetching an answer's newest verification run.
verificationSchema.index({ answerId: 1, createdAt: -1 });

// Prevents the same verification request from creating more than one run.
verificationSchema.index(
  { answerId: 1, verificationType: 1, idempotencyKey: 1 },
  { unique: true, name: "unique_verification_request" },
);

// Supports status-based retrieval without scanning completed runs.
verificationSchema.index({ status: 1, statusUpdatedAt: 1 });

/**
 * Atomically changes status only when the run is still in its expected state.
 * A null result means another update changed the state first.
 */
verificationSchema.statics.transitionStatus = function ({
  verificationId,
  expectedStatus,
  nextStatus,
}) {
  const expectedStatuses = Array.isArray(expectedStatus)
    ? expectedStatus
    : [expectedStatus];

  if (!VERIFICATION_STATUSES.includes(nextStatus)) {
    throw new Error(`Unknown verification status: ${nextStatus}`);
  }

  if (
    expectedStatuses.some(
      (status) =>
        !VERIFICATION_STATUSES.includes(status) ||
        !STATUS_TRANSITIONS[status].includes(nextStatus),
    )
  ) {
    throw new Error("Invalid verification status transition");
  }

  return this.findOneAndUpdate(
    { _id: verificationId, status: { $in: expectedStatuses } },
    { $set: { status: nextStatus, statusUpdatedAt: new Date() } },
    { new: true, runValidators: true },
  );
};

const Verification = mongoose.model("Verification", verificationSchema);

Verification.VERIFICATION_STATUSES = VERIFICATION_STATUSES;
Verification.VERIFICATION_TYPES = VERIFICATION_TYPES;
Verification.STATUS_TRANSITIONS = STATUS_TRANSITIONS;

module.exports = Verification;
