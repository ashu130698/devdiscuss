const crypto = require("crypto");
const Verification = require("../../models/Verification");
const { processVerificationJob } = require("./worker");

const VERIFICATION_TYPE = "REPRODUCIBILITY";
const scheduledVerificationIds = new Set();

function createIdempotencyKey(answerId) {
  return crypto
    .createHash("sha256")
    .update(`verification:${VERIFICATION_TYPE}:${answerId.toString()}`)
    .digest("hex");
}

function isDuplicateKeyError(error) {
  return error && error.code === 11000;
}

function scheduleVerification(verificationId) {
  const jobId = verificationId.toString();

  if (scheduledVerificationIds.has(jobId)) return;

  scheduledVerificationIds.add(jobId);

  setImmediate(async () => {
    try {
      await processVerificationJob(verificationId);
    } catch (error) {
      console.error("VERIFICATION QUEUE ERROR:", error);
    } finally {
      scheduledVerificationIds.delete(jobId);
    }
  });
}

async function enqueueAnswerVerification(answerId) {
  const idempotencyKey = createIdempotencyKey(answerId);

  try {
    const verification = await Verification.create({
      answerId,
      verificationType: VERIFICATION_TYPE,
      idempotencyKey,
      status: "PENDING",
    });

    scheduleVerification(verification._id);
    return verification;
  } catch (error) {
    if (!isDuplicateKeyError(error)) throw error;

    return Verification.findOne({
      answerId,
      verificationType: VERIFICATION_TYPE,
      idempotencyKey,
    });
  }
}

module.exports = { enqueueAnswerVerification };
