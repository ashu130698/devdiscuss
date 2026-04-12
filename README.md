# DevDiscuss — Developer Q&A Platform with AI Assistant

DevDiscuss is a MERN-stack community platform where developers can ask questions, share knowledge, and get real-time coding assistance from an integrated AI.

## 🚀 Key Features

- **LLM-Powered AI Assistant**: Built with OpenAI's **GPT-4o mini**, providing contextual help for any post.
- **Real-time SSE Streaming**: Experience near-instantaneous AI responses with Server-Sent Events (SSE).
- **Server-side Prompt Engineering**: Context-aware AI responses tailored to the specific question and tags.
- **Advanced API Protection**: Rate limiting on AI endpoints to manage costs and prevent abuse.
- **Production Metrics**: Server-side latency tracking (Target: < 2 seconds) for AI interactions.
- **Full MERN Stack**: MongoDB, Express, React (TypeScript), Node.js.
- **Modern UI**: TailwindCSS with glassmorphism effects and responsive design.

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, TailwindCSS, React Markdown, Axios.
- **Backend**: Node.js, Express, MongoDB (Mongoose), OpenAI SDK.
- **Auth**: JWT-based authentication with secure password hashing.

## 🚦 Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB
- OpenAI API Key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-repo/devdiscuss.git
   ```

2. **Backend Setup**:
   ```bash
   cd backend
   npm install
   ```
   Create a `.env` file:
   ```env
   MONGO_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   OPENAI_API_KEY=your_openai_key
   PORT=4000
   ```
   Start the server:
   ```bash
   npm start
   ```

3. **Frontend Setup**:
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

## 🧠 AI Integration Highlights

### SSE Streaming
We implemented SSE to solve the "waiting" problem. By streaming tokens from GPT-4o mini, we achieve a **Time to First Token (TTFT)** of under 500ms, significantly improving the perceived performance of the assistant.

### Prompt Engineering
Instead of sending raw user queries, we wrap them in a server-side system prompt that includes the post title, body, and tags. This ensures the AI remains professional and provides highly relevant, code-focused advice.

### Cost & Security
The `/ai/help` endpoint is protected by:
1. **JWT Auth**: Only registered users can access AI features.
2. **Rate Limiting**: 10 requests per 15-minute window to prevent API credit exhaustion.
