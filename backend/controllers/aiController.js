/**
 * AI Assistant Controller
 * 
 * CORE FEATURES:
 * 1. OpenRouter Integration (GPT-4o mini)
 * 2. SSE Streaming (Real-time responses)
 * 3. Server-side Prompt Engineering
 * 4. Latency Metric (Under 2 seconds target)
 */

let openai;

/**
 * getOpenAIClient() - Lazy initialization of OpenAI-compatible client
 */
const getOpenAIClient = () => {
  if (!openai) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not defined in environment variables");
    }
    const { OpenAI } = require("openai");
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: "https://openrouter.ai/api/v1",
    });
  }
  return openai;
};

exports.getAIHelp = async (req, res) => {
  const { postTitle, postBody, postTags } = req.body;
  const startTime = Date.now();

  try {
    const client = getOpenAIClient();

    // 1. Server-side Prompt Engineering (IMPROVED)
    // We give the AI a clear persona and explicit instructions to SOLVE 
    // the problem instead of asking for more details.
    const systemPrompt = `
      You are "Starc AI Assistant", an elite software engineer at DevDiscuss.
      Your goal is to provide immediate, actionable, and correct solutions to technical questions.

      STRICT RULES:
      1. Do NOT ask for "more details" or "how can I help". 
      2. Analyze the provided Context (Title, Body, Tags) and solve it directly.
      3. Always include clean, well-commented code blocks where applicable.
      4. Use Markdown for formatting.
      5. If the question is vague, provide the most likely solution or a high-quality best practice.
      6. Be concise but thorough.

      CONTEXT FOR THIS REQUEST:
      Title: ${postTitle}
      Description: ${postBody}
      Technologies: ${postTags?.join(", ") || "General Programming"}
    `;

    // 2. SSE (Server-Sent Events) Setup
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    // 3. OpenRouter Streaming Call (Requesting GPT-4o mini)
    const stream = await client.chat.completions.create({
      model: "openai/gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { 
          role: "user", 
          content: "Please analyze the post context above and provide a definitive solution or expert guidance." 
        }
      ],
      stream: true,
    });

    // 4. Send chunks as they arrive
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || "";
      if (content) {
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }

    // 5. Calculate Latency Metric
    const latency = Date.now() - startTime;
    console.log(`⏱️ AI Latency: ${latency}ms (Provider: OpenRouter / Model: GPT-4o mini)`);

    res.write("data: [DONE]\n\n");
    res.end();

  } catch (error) {
    console.error("❌ AI Controller Error:", error.message);
    
    if (!res.headersSent) {
      return res.status(500).json({ error: error.message || "Failed to communicate with Starc AI" });
    }
    
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    res.end();
  }
};
