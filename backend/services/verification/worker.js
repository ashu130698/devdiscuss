const Verification = require("../../models/Verification");
const { executeVerification } = require("./executionEngine");
const { interpretVerification } = require("./interpreter");
const screenStep0 = require("./step0");

const STATUS_PENDING = "PENDING";
const STATUS_SCREENING = "SCREENING";
const STATUS_EXECUTING = "EXECUTING";
const STATUS_SCREENING_FAILED = "SCREENING_FAILED";

function getProblemContext(verification) {
  const answer = verification.answerId;
  const post = answer && answer.post;

  return {
    title: post?.title || "",
    body: post?.body || "",
    tags: post?.tags || [],
  };
}

async function saveScreeningResult(verificationId, step0) {
  const nextStatus =
    step0.screeningDecision === "PROCEED"
      ? STATUS_EXECUTING
      : STATUS_SCREENING_FAILED;

  return Verification.findOneAndUpdate(
    { _id: verificationId, status: STATUS_SCREENING },
    {
      $set: {
        step0,
        status: nextStatus,
        statusUpdatedAt: new Date(),
      },
    },
    { new: true, runValidators: true },
  );
}

async function processVerificationJob(verificationId) {
  const screeningVerification = await Verification.transitionStatus({
    verificationId,
    expectedStatus: STATUS_PENDING,
    nextStatus: STATUS_SCREENING,
  });

  // The job was already processed, claimed by another worker, or no longer exists.
  if (!screeningVerification) return null;

  try {
    const verification = await Verification.findById(verificationId).populate({
      path: "answerId",
      populate: {
        path: "post",
        select: "title body tags",
      },
    });

    if (!verification) return null;

    const step0 = screenStep0({
      ...getProblemContext(verification),
      completedAt: new Date(),
    });

    const updatedVerification = await saveScreeningResult(verificationId, step0);

    if (updatedVerification?.status === STATUS_EXECUTING) {
      const executionVerification = await executeVerification(updatedVerification);

      if (executionVerification?.status === "INTERPRETING") {
        return interpretVerification(executionVerification);
      }

      return executionVerification;
    }

    return updatedVerification;
  } catch (error) {
    console.error("STEP 0 VERIFICATION ERROR:", error);

    await Verification.transitionStatus({
      verificationId,
      expectedStatus: STATUS_SCREENING,
      nextStatus: STATUS_SCREENING_FAILED,
    });

    return null;
  }
}

module.exports = { processVerificationJob };
