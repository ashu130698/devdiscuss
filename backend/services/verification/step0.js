const STACK_DETECTORS = [
  { name: "Node.js", pattern: /\b(node\.js|nodejs|npm|yarn|pnpm|package\.json)\b/i },
  { name: "React", pattern: /\breact\b/i },
  { name: "Next.js", pattern: /\bnext\.js\b|\bnextjs\b/i },
  { name: "Express", pattern: /\bexpress\b/i },
  { name: "MongoDB", pattern: /\bmongodb\b/i },
  { name: "Mongoose", pattern: /\bmongoose\b/i },
  { name: "TypeScript", pattern: /\btypescript\b|\btsconfig\.json\b/i },
  { name: "JavaScript", pattern: /\bjavascript\b|\b\.js\b/i },
  { name: "Python", pattern: /\bpython\b|\bpip\b|\brequirements\.txt\b/i },
  { name: "Django", pattern: /\bdjango\b/i },
  { name: "Flask", pattern: /\bflask\b/i },
  { name: "FastAPI", pattern: /\bfastapi\b/i },
  { name: "Java", pattern: /\bjava\b|\bmaven\b|\bgradle\b/i },
  { name: "Spring", pattern: /\bspring(?: boot)?\b/i },
  { name: "Go", pattern: /\bgolang\b|\bgo\.mod\b/i },
  { name: "Rust", pattern: /\brust\b|\bcargo\.toml\b/i },
  { name: "Docker", pattern: /\bdocker\b|\bdockerfile\b/i },
  { name: "PostgreSQL", pattern: /\bpostgres(?:ql)?\b/i },
  { name: "MySQL", pattern: /\bmysql\b/i },
];

const EXECUTABLE_EXAMPLE_PATTERN =
  /```[\s\S]*?```|\b(package\.json|dockerfile|docker compose|npm (?:run|install)|yarn (?:run|install)|pnpm (?:run|install)|node\s+\S+|python\s+\S+|pip install|console\.|import\s+|require\(|function\s+\w+|const\s+\w+|let\s+\w+|class\s+\w+|SELECT\s+.+\s+FROM)\b/i;

const ERROR_OUTPUT_PATTERN =
  /\b(error|exception|stack trace|traceback|failed|failure|exit code)\b/i;

const VERSION_PATTERN =
  /\b(v?\d+(?:\.\d+){1,3}|version|package-lock\.json|yarn\.lock|pnpm-lock\.yaml|requirements\.txt)\b/i;

const OPERATING_SYSTEM_PATTERN = /\b(windows|macos|mac os|linux|ubuntu|debian|alpine)\b/i;

const SCREENSHOT_PATTERN = /\b(screenshot|screen shot|image attached|see image)\b|!\[[^\]]*\]\([^)]*\)/i;

const EXTERNAL_DEPENDENCY_PATTERN =
  /\b(private repo(?:sitory)?|internal (?:service|api|system)|production (?:system|database|environment)|customer data|cannot share|requires? (?:a )?(?:private|third-party) account)\b/i;

const SECRET_PATTERN =
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|\bAKIA[0-9A-Z]{16}\b|authorization\s*:\s*bearer\s+\S+|\bpassword\s*[:=]\s*[^\s]+/i;

function createIndicator(code, description) {
  return { code, description };
}

function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeTags(tags) {
  if (!Array.isArray(tags)) return "";

  return tags
    .filter((tag) => typeof tag === "string")
    .map((tag) => tag.trim())
    .filter(Boolean)
    .join(" ");
}

function normalizeCompletedAt(completedAt) {
  const value = completedAt instanceof Date ? completedAt : new Date(completedAt);

  if (Number.isNaN(value.getTime())) {
    throw new Error("completedAt must be a valid date");
  }

  return new Date(value.getTime());
}

function detectStack(text) {
  return STACK_DETECTORS.filter(({ pattern }) => pattern.test(text)).map(
    ({ name }) => name,
  );
}

/**
 * Performs deterministic, side-effect-free reproducibility screening.
 *
 * The caller owns completedAt so identical inputs always produce identical
 * results. This input/output boundary can later be retained when a model-based
 * screening engine replaces the heuristics.
 */
function screenStep0({ title = "", body = "", tags = [], completedAt } = {}) {
  const normalizedTitle = normalizeText(title);
  const normalizedBody = normalizeText(body);
  const sourceText = [normalizedTitle, normalizedBody, normalizeTags(tags)]
    .filter(Boolean)
    .join("\n");
  const completedAtValue = normalizeCompletedAt(completedAt);
  const detectedStack = detectStack(sourceText);
  const riskIndicators = [];
  const flaggedLimitations = [];
  const blockingReasons = [];

  const hasEnoughDescription = sourceText.length >= 40;
  const hasExecutableExample = EXECUTABLE_EXAMPLE_PATTERN.test(normalizedBody);
  const hasScreenshotOnlyReport =
    SCREENSHOT_PATTERN.test(sourceText) && !hasExecutableExample;
  const hasExternalDependency = EXTERNAL_DEPENDENCY_PATTERN.test(sourceText);
  const hasSensitiveMaterial = SECRET_PATTERN.test(sourceText);

  if (!hasEnoughDescription) {
    riskIndicators.push(
      createIndicator(
        "INSUFFICIENT_PROBLEM_DESCRIPTION",
        "The report is too short to identify a reproducible execution path.",
      ),
    );
    blockingReasons.push("the problem description is insufficient");
  }

  if (!hasExecutableExample) {
    riskIndicators.push(
      createIndicator(
        "MISSING_EXECUTABLE_EXAMPLE",
        "No code, configuration, command, or reproducible example was found.",
      ),
    );
    blockingReasons.push("no executable example was provided");
  }

  if (detectedStack.length === 0) {
    riskIndicators.push(
      createIndicator(
        "MISSING_RUNTIME_CONTEXT",
        "No likely technology stack or runtime could be detected.",
      ),
    );
    blockingReasons.push("the runtime context is unknown");
  }

  if (hasScreenshotOnlyReport) {
    riskIndicators.push(
      createIndicator(
        "SCREENSHOT_ONLY_REPORT",
        "The report relies on a screenshot or image without an executable example.",
      ),
    );
    blockingReasons.push("the report is screenshot-only");
  }

  if (hasExternalDependency) {
    riskIndicators.push(
      createIndicator(
        "UNAVAILABLE_EXTERNAL_DEPENDENCY",
        "Reproduction depends on private, internal, production, or third-party access.",
      ),
    );
    blockingReasons.push("required external access is unavailable");
  }

  if (hasSensitiveMaterial) {
    riskIndicators.push(
      createIndicator(
        "SENSITIVE_MATERIAL_PRESENT",
        "The report appears to contain credentials or private key material.",
      ),
    );
    blockingReasons.push("sensitive material must not be executed");
  }

  if (!ERROR_OUTPUT_PATTERN.test(sourceText)) {
    flaggedLimitations.push(
      createIndicator(
        "MISSING_ERROR_OUTPUT",
        "No error output or failure signal was included with the report.",
      ),
    );
  }

  if (!VERSION_PATTERN.test(sourceText)) {
    flaggedLimitations.push(
      createIndicator(
        "MISSING_VERSION_INFORMATION",
        "Dependency or runtime version information was not provided.",
      ),
    );
  }

  if (!OPERATING_SYSTEM_PATTERN.test(sourceText)) {
    flaggedLimitations.push(
      createIndicator(
        "MISSING_OPERATING_SYSTEM_CONTEXT",
        "The operating system or base environment was not specified.",
      ),
    );
  }

  const isReproducible = blockingReasons.length === 0;
  const screeningDecision = isReproducible ? "PROCEED" : "BLOCK";
  const reasoning = isReproducible
    ? `Screening can proceed: an executable example and the detected stack (${detectedStack.join(
        ", ",
      )}) provide a deterministic execution starting point.`
    : `Screening is blocked because ${blockingReasons.join(", ")}.`;

  return {
    isReproducible,
    screeningDecision,
    detectedStack,
    riskIndicators,
    flaggedLimitations,
    reasoning,
    completedAt: completedAtValue,
  };
}

module.exports = screenStep0;
