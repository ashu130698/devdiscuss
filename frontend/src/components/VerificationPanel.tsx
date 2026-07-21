import { useEffect, useState } from "react";
import API from "../services/api";

const POLL_INTERVAL_MS = 3000;
const RUNNING_STATUSES = new Set([
  "PENDING",
  "SCREENING",
  "EXECUTING",
  "INTERPRETING",
]);

type Limitation = {
  code: string;
  description: string;
};

type Verification = {
  status: string;
  step0?: {
    screeningDecision: string;
    reasoning: string;
  };
  execution?: {
    runtime?: string;
    nodeVersion?: string;
    framework?: string;
    exitCode?: number;
    duration?: number;
  };
  evidenceArtifacts?: unknown[];
  interpretation?: {
    verdict: string;
    confidence: number;
    summary: string;
    strengths: string[];
    flaggedLimitations: Limitation[];
    recommendations: string[];
  };
};

type VerificationPanelProps = {
  answerId: string;
};

function formatDuration(duration?: number) {
  if (duration === undefined) return "Pending";
  return `${duration}ms`;
}

function ListSection({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  return (
    <div>
      <p className="font-medium text-gray-800">{title}</p>
      {items.length > 0 ? (
        <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-gray-600">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : (
        <p className="mt-1 text-sm text-gray-500">None reported.</p>
      )}
    </div>
  );
}

function VerificationPanel({ answerId }: VerificationPanelProps) {
  const [verification, setVerification] = useState<Verification | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isActive = true;
    let timeoutId: number | undefined;

    const loadVerification = async () => {
      try {
        const response = await API.get<Verification>(
          `/api/verifications/${answerId}`,
        );

        if (!isActive) return;

        setVerification(response.data);
        setError("");

        if (RUNNING_STATUSES.has(response.data.status)) {
          timeoutId = window.setTimeout(loadVerification, POLL_INTERVAL_MS);
        }
      } catch {
        if (isActive) {
          setError("Verification is not available yet.");
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void loadVerification();

    return () => {
      isActive = false;
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [answerId]);

  if (isLoading) {
    return (
      <section
        className="mt-4 rounded border border-indigo-100 bg-indigo-50 p-3 text-sm text-indigo-800"
        aria-live="polite"
      >
        Loading verification status…
      </section>
    );
  }

  if (error || !verification) {
    return (
      <section className="mt-4 rounded border border-gray-200 bg-gray-50 p-3 text-sm text-gray-500">
        {error || "Verification is not available yet."}
      </section>
    );
  }

  const isRunning = RUNNING_STATUSES.has(verification.status);
  const interpretation = verification.interpretation;
  const limitations = interpretation?.flaggedLimitations || [];

  return (
    <section className="mt-4 rounded border border-indigo-100 bg-indigo-50 p-4">
      <div className="flex items-center justify-between gap-3">
        <h4 className="font-semibold text-indigo-950">Verification</h4>
        <span className="rounded bg-white px-2 py-1 text-xs font-semibold text-indigo-800">
          {verification.status}
        </span>
      </div>

      {isRunning && (
        <p className="mt-2 text-sm text-indigo-700" aria-live="polite">
          Verification is running. This panel updates every 3 seconds.
        </p>
      )}

      <div className="mt-4 space-y-3 text-sm">
        <div>
          <p className="font-medium text-gray-800">Screening</p>
          <p className="text-gray-600">
            {verification.step0
              ? `${verification.step0.screeningDecision}: ${verification.step0.reasoning}`
              : "Pending"}
          </p>
        </div>

        <div>
          <p className="font-medium text-gray-800">Execution</p>
          <p className="text-gray-600">
            {verification.execution
              ? `${verification.execution.runtime || "Unknown runtime"} · ${verification.execution.nodeVersion || "Unknown Node version"} · ${verification.execution.framework || "Unknown framework"} · exit ${verification.execution.exitCode ?? "pending"} · ${formatDuration(verification.execution.duration)}`
              : "Pending"}
          </p>
          {verification.evidenceArtifacts && (
            <p className="text-gray-500">
              Evidence artifacts: {verification.evidenceArtifacts.length}
            </p>
          )}
        </div>

        <div>
          <p className="font-medium text-gray-800">Interpretation</p>
          <p className="text-gray-600">
            {interpretation ? "Completed" : "Pending"}
          </p>
        </div>

        <div>
          <p className="font-medium text-gray-800">Verdict</p>
          <p className="text-gray-600">{interpretation?.verdict || "Pending"}</p>
        </div>

        <div>
          <p className="font-medium text-gray-800">Confidence</p>
          <p className="text-gray-600">
            {interpretation ? `${interpretation.confidence}%` : "Pending"}
          </p>
        </div>

        <div>
          <p className="font-medium text-gray-800">Summary</p>
          <p className="text-gray-600">
            {interpretation?.summary || "Pending"}
          </p>
        </div>

        <ListSection title="Strengths" items={interpretation?.strengths || []} />
        <ListSection
          title="Limitations"
          items={limitations.map((limitation) => limitation.description)}
        />
        <ListSection
          title="Recommendations"
          items={interpretation?.recommendations || []}
        />
      </div>
    </section>
  );
}

export default VerificationPanel;
