import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface AIAssistantProps {
  postTitle: string;
  postBody: string;
  postTags?: string[];
}

/**
 * AI Assistant Component
 * 
 * WHY SSE?
 * 1. Immediate Feedback: Users see the AI "thinking" and typing.
 * 2. Perceived Performance: Even if the full response takes 5 seconds, 
 *    the first word appears in under 500ms.
 * 
 * INTERVIEW TIP: Mentioning "Time to First Token" (TTFT) shows 
 * you understand LLM performance metrics.
 */
const AIAssistant: React.FC<AIAssistantProps> = ({ postTitle, postBody, postTags }) => {
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const getAIHelp = async () => {
    setIsLoading(true);
    setResponse("");
    setError("");

    try {
      const token = localStorage.getItem("token");
      
      // We use standard fetch because Axios doesn't support 
      // ReadableStream for SSE as easily.
      const res = await fetch("http://127.0.0.1:4000/ai/help", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ postTitle, postBody, postTags }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to get AI help");
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      if (!reader) throw new Error("No reader available");

      // Read the stream
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        
        // Keep the last partial line in the buffer
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (trimmedLine.startsWith("data: ")) {
            const data = trimmedLine.slice(6).trim();
            if (data === "[DONE]") break;

            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                setResponse((prev) => prev + parsed.content);
              }
            } catch (e) {
              console.error("Error parsing SSE chunk", e);
            }
          }
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="my-6 p-4 bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 rounded-xl shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 text-white p-1.5 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 8-9.04 9.06a2.82 2.82 0 1 0 3.98 3.98L16 12"/><circle cx="17" cy="7" r="5"/></svg>
          </div>
          <h3 className="font-bold text-indigo-900">Starc AI Assistant</h3>
        </div>
        
        <button
          onClick={getAIHelp}
          disabled={isLoading}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            isLoading 
              ? "bg-gray-200 text-gray-500 cursor-not-allowed" 
              : "bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 shadow-md shadow-indigo-200"
          }`}
        >
          {isLoading ? "Generating..." : response ? "Ask Again" : "Get AI Help"}
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-lg text-sm mb-4">
          {error}
        </div>
      )}

      {response && (
        <div className="prose prose-indigo max-w-none bg-white p-4 rounded-lg border border-indigo-50 min-h-[100px] animate-in fade-in slide-in-from-top-2 duration-500">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {response}
          </ReactMarkdown>
        </div>
      )}
      
      {!response && !isLoading && !error && (
        <p className="text-sm text-indigo-700/60 italic">
          Need a hand? Starc AI Assistant can analyze this post and provide a tailored solution.
        </p>
      )}
    </div>
  );
};

export default AIAssistant;
