const OPENROUTER_ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_MODEL = "openai/gpt-4o-mini";
const DEFAULT_TIMEOUT_MS = 30000;
const EXECUTION_RESULT_INSTRUCTIONS = [
  "Return only a JSON object with no Markdown.",
  "Required fields: success (boolean), stdout (string), stderr (string), exitCode (integer or null), runtime (string), nodeVersion (string), framework (string), and artifacts (array).",
  "Each artifact must contain artifactType (stdout, stderr, reproductionScript, or environmentMetadata), name, downloadUrl, contentType, and optional sizeBytes.",
  "Use an empty artifacts array when no downloadable artifact is available.",
].join(" ");
const INTERPRETATION_INSTRUCTIONS = [
  "Return only a concise JSON object with no Markdown.",
  "Required fields: verdict (VERIFIED, PARTIALLY_VERIFIED, or NOT_VERIFIED), confidence (number from 0 to 100), summary (string), testedContext (string), strengths (string array), flaggedLimitations (array of objects with code and description strings), and recommendations (string array).",
  "Base the report only on the supplied screening result, execution metadata, and evidence artifact metadata.",
].join(" ");

class OpenRouterProviderError extends Error {
  constructor(message, code) {
    super(message);
    this.name = "OpenRouterProviderError";
    this.code = code;
  }
}

function getApiKey() {
  const apiKey = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new OpenRouterProviderError(
      "OpenRouter API key is not configured",
      "MISSING_API_KEY",
    );
  }

  return apiKey;
}

function getTimeoutMs() {
  const configuredTimeout = Number(process.env.OPENROUTER_EXECUTION_TIMEOUT_MS);

  return Number.isFinite(configuredTimeout) && configuredTimeout > 0
    ? configuredTimeout
    : DEFAULT_TIMEOUT_MS;
}

function getModel() {
  return process.env.OPENROUTER_EXECUTION_MODEL || DEFAULT_MODEL;
}

function parseProviderContent(content) {
  if (typeof content !== "string") {
    throw new OpenRouterProviderError(
      "OpenRouter returned a response without message content",
      "INVALID_RESPONSE",
    );
  }

  const jsonContent = content
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/\s*```$/, "");

  try {
    return JSON.parse(jsonContent);
  } catch {
    throw new OpenRouterProviderError(
      "OpenRouter returned invalid execution JSON",
      "INVALID_RESPONSE",
    );
  }
}

async function requestStructuredResponse(instructions, input) {
  const apiKey = getApiKey();
  const model = getModel();
  const timeoutMs = getTimeoutMs();
  let response;

  try {
    response = await fetch(OPENROUTER_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content: instructions,
          },
          {
            role: "user",
            content: JSON.stringify(input),
          },
        ],
        response_format: { type: "json_object" },
      }),
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (error) {
    if (error.name === "TimeoutError" || error.name === "AbortError") {
      throw new OpenRouterProviderError(
        `OpenRouter execution request timed out after ${timeoutMs}ms`,
        "TIMEOUT",
      );
    }

    throw new OpenRouterProviderError(
      "OpenRouter execution request failed",
      "REQUEST_FAILED",
    );
  }

  if (!response.ok) {
    throw new OpenRouterProviderError(
      `OpenRouter execution request failed with status ${response.status}`,
      "HTTP_ERROR",
    );
  }

  let payload;

  try {
    payload = await response.json();
  } catch {
    throw new OpenRouterProviderError(
      "OpenRouter returned invalid JSON",
      "INVALID_RESPONSE",
    );
  }

  return {
    result: parseProviderContent(payload?.choices?.[0]?.message?.content),
    providerMetadata: {
      provider: "openrouter",
      model,
      requestId: response.headers.get("x-request-id") || null,
    },
  };
}

function requestExecution(executionContext) {
  return requestStructuredResponse(EXECUTION_RESULT_INSTRUCTIONS, executionContext);
}

function requestInterpretation(interpretationContext) {
  return requestStructuredResponse(
    INTERPRETATION_INSTRUCTIONS,
    interpretationContext,
  );
}

module.exports = { requestExecution, requestInterpretation };
