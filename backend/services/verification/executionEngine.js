const Answer = require("../../models/answer");
const Verification = require("../../models/Verification");
const { requestExecution } = require("./openRouterProvider");

const STATUS_EXECUTING = "EXECUTING";
const STATUS_EXECUTION_FAILED = "EXECUTION_FAILED";
const STATUS_INTERPRETING = "INTERPRETING";
const ARTIFACT_TYPES = new Set([
  "stdout",
  "stderr",
  "reproductionScript",
  "environmentMetadata",
]);

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function createExecutionContext(answer) {
  const post = answer.post;

  return {
    question: {
      title: post?.title || "",
      body: post?.body || "",
      tags: post?.tags || [],
    },
    answer: {
      body: answer.body,
    },
  };
}

function normalizeArtifacts(artifacts, completedAt) {
  if (!Array.isArray(artifacts)) {
    throw new Error("Provider artifacts must be an array");
  }

  return artifacts.map((artifact) => {
    if (
      !isPlainObject(artifact) ||
      !ARTIFACT_TYPES.has(artifact.artifactType) ||
      typeof artifact.name !== "string" ||
      typeof artifact.downloadUrl !== "string" ||
      typeof artifact.contentType !== "string" ||
      (artifact.sizeBytes !== undefined &&
        (!Number.isFinite(artifact.sizeBytes) || artifact.sizeBytes < 0))
    ) {
      throw new Error("Provider returned an invalid evidence artifact");
    }

    return {
      artifactType: artifact.artifactType,
      name: artifact.name,
      downloadUrl: artifact.downloadUrl,
      contentType: artifact.contentType,
      ...(artifact.sizeBytes === undefined
        ? {}
        : { sizeBytes: artifact.sizeBytes }),
      createdAt: completedAt,
    };
  });
}

function normalizeExecutionResult(providerResponse, startedAt, completedAt) {
  const result = providerResponse?.result;

  if (
    !isPlainObject(result) ||
    typeof result.success !== "boolean" ||
    typeof result.stdout !== "string" ||
    typeof result.stderr !== "string" ||
    (result.exitCode !== null && !Number.isInteger(result.exitCode)) ||
    typeof result.runtime !== "string" ||
    typeof result.nodeVersion !== "string" ||
    typeof result.framework !== "string" ||
    !Array.isArray(result.artifacts)
  ) {
    throw new Error("Provider returned an invalid execution result");
  }

  return {
    success: result.success,
    stdout: result.stdout,
    stderr: result.stderr,
    exitCode: result.exitCode,
    runtime: result.runtime,
    framework: result.framework,
    artifacts: normalizeArtifacts(result.artifacts || [], completedAt),
    providerMetadata: providerResponse.providerMetadata,
    completedAt,
    execution: {
      runtime: result.runtime,
      nodeVersion: result.nodeVersion,
      framework: result.framework,
      ...(result.exitCode === null ? {} : { exitCode: result.exitCode }),
      startedAt,
      completedAt,
      duration: completedAt.getTime() - startedAt.getTime(),
    },
  };
}

async function saveExecutionResult(verificationId, normalizedResult) {
  const nextStatus = normalizedResult.success
    ? STATUS_INTERPRETING
    : STATUS_EXECUTION_FAILED;

  return Verification.findOneAndUpdate(
    { _id: verificationId, status: STATUS_EXECUTING },
    {
      $set: {
        execution: normalizedResult.execution,
        evidenceArtifacts: normalizedResult.artifacts,
        status: nextStatus,
        statusUpdatedAt: normalizedResult.completedAt,
      },
    },
    { new: true, runValidators: true },
  );
}

async function markExecutionFailed(verificationId, startedAt) {
  const completedAt = new Date();

  return Verification.findOneAndUpdate(
    { _id: verificationId, status: STATUS_EXECUTING },
    {
      $set: {
        execution: {
          startedAt,
          completedAt,
          duration: completedAt.getTime() - startedAt.getTime(),
        },
        status: STATUS_EXECUTION_FAILED,
        statusUpdatedAt: completedAt,
      },
    },
    { new: true, runValidators: true },
  );
}

async function executeVerification(verification) {
  if (!verification || verification.status !== STATUS_EXECUTING) return null;

  const startedAt = new Date();

  try {
    const answer = await Answer.findById(verification.answerId).populate({
      path: "post",
      select: "title body tags",
    });

    if (!answer) {
      throw new Error("Verification answer was not found");
    }

    const providerResponse = await requestExecution(createExecutionContext(answer));
    const completedAt = new Date();
    const normalizedResult = normalizeExecutionResult(
      providerResponse,
      startedAt,
      completedAt,
    );

    return saveExecutionResult(verification._id, normalizedResult);
  } catch (error) {
    console.error("VERIFICATION EXECUTION ERROR:", error);
    return markExecutionFailed(verification._id, startedAt);
  }
}

module.exports = { executeVerification };
