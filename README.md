# DevDiscuss

DevDiscuss is a MERN developer discussion platform with AI-assisted answer verification. Developers can register, ask technical questions, submit answers, vote on posts, ask for AI help, and see an automated verification report for each submitted answer.

The project was built for OpenAI Build Week 2026 as a prototype for turning community Q&A into a more trustworthy developer knowledge base.

## Problem

Developer forums are useful, but answers can be hard to trust. A reply may sound correct while missing context, failing to reproduce the issue, or making claims that were never tested. That matters because developers often copy answers directly into production systems, learning paths, interviews, and debugging sessions.

DevDiscuss adds an automated verification workflow after answer submission. The goal is not to replace human judgment, but to make the reliability of an answer more visible by showing what was screened, what was executed or simulated through the provider workflow, and how the result was interpreted.

## Features

- User registration and login
- JWT-based authentication
- Protected post creation
- Public post listing
- Post detail pages
- Answer submission on posts
- Answer listing per post
- Post deletion by the post author
- Answer deletion by the answer author
- Post upvotes and downvotes
- Vote toggling
- Bulk vote lookup for post lists
- Optional vote state for logged-in users
- AI assistant for post-specific help
- Streaming AI responses with Server-Sent Events
- AI endpoint rate limiting
- Automatic verification creation after answer submission
- Idempotent verification creation per answer
- In-memory verification queue
- Verification worker
- Step 0 reproducibility screening
- Execution engine abstraction
- OpenRouter provider integration
- Interpretation stage
- Verification status API
- Verification panel on the answer detail view
- Verification polling every 3 seconds while work is running
- Persisted verification results after page refresh

## AI Workflow

The verification pipeline runs automatically whenever an authenticated user submits an answer.

```text
Answer
  ↓
Verification Created
  ↓
Step 0 Screening
  ↓
Execution
  ↓
Interpretation
  ↓
Completed
```

### Answer

A user submits an answer on a post. The existing answer API saves the answer in MongoDB and then enqueues verification work.

### Verification Created

The queue creates a `Verification` document linked to the answer. The document starts with `PENDING` status and uses an idempotency key so duplicate verification requests for the same answer do not create duplicate runs.

### Step 0 Screening

Step 0 is a deterministic heuristic screen. It detects likely technology stack, reproducibility blockers, risk indicators, limitations, and a screening decision:

- `PROCEED` moves the verification to execution.
- `BLOCK` marks the verification as `SCREENING_FAILED`.

Step 0 does not execute code and does not call an AI model.

### Execution

The worker calls the execution engine. The execution engine loads the answer and post context, calls the provider, normalizes the provider result, persists execution metadata, persists evidence artifact metadata, and moves the verification to `INTERPRETING` when execution succeeds.

### Interpretation

The interpreter reads the Step 0 result, execution metadata, and evidence artifact metadata. It calls the provider for a concise verification report and persists:

- verdict
- confidence
- summary
- tested context
- strengths
- limitations
- recommendations

### Completed

When interpretation succeeds, the verification status becomes `COMPLETED`. If execution or interpretation fails, the status becomes `EXECUTION_FAILED` or `INTERPRETATION_FAILED`.

## Architecture

### Frontend

The frontend is a React and TypeScript application built with Vite and Tailwind CSS. It handles authentication screens, post lists, post creation, post details, answer submission, the AI assistant, voting UI, and the verification panel.

### Backend

The backend is an Express application using MongoDB through Mongoose. It exposes authentication, posts, answers, votes, AI assistant, and verification endpoints.

### Worker

The verification worker orchestrates the verification lifecycle. It claims pending verification jobs atomically, runs Step 0, calls the execution engine, and then calls the interpreter.

### Queue

The queue is a small in-memory module. It creates verification documents, generates idempotency keys, prevents duplicate scheduling in-process, and schedules asynchronous work. It is intentionally isolated so it can be replaced later by a durable queue such as BullMQ.

### Execution Engine

The execution engine owns verification execution orchestration. It loads answer context, calls the provider, validates and normalizes the response, saves execution metadata, saves evidence artifact metadata, and updates status.

### Interpreter

The interpreter converts the screening and execution results into a concise verification report. It validates provider output before persisting it.

### OpenRouter Provider

The OpenRouter provider contains all provider-specific HTTP behavior: endpoint, headers, API key handling, request body shape, timeout handling, response parsing, and provider errors. The rest of the application depends on normalized contracts rather than OpenRouter-specific payloads.

### MongoDB

MongoDB stores users, posts, answers, votes, and verification runs. Mongoose schemas define relationships, validation, timestamps, and indexes.

### JWT Authentication

The backend issues JWTs during login. Protected routes require an `Authorization: Bearer <token>` header. Passwords are hashed with bcrypt before storage.

## Folder Structure

```text
devdiscuss/
├── README.md
├── backend/
│   ├── package.json
│   ├── server.js
│   ├── controllers/
│   │   ├── aiController.js
│   │   ├── answerController.js
│   │   ├── authcontroller.js
│   │   ├── postController.js
│   │   ├── verificationController.js
│   │   └── voteController.js
│   ├── middleware/
│   │   ├── aiRateLimiter.js
│   │   └── authmiddleware.js
│   ├── models/
│   │   ├── Verification.js
│   │   ├── answer.js
│   │   ├── post.js
│   │   ├── user.js
│   │   └── vote.js
│   ├── routes/
│   │   ├── aiRoutes.js
│   │   ├── answerRoutes.js
│   │   ├── auth.js
│   │   ├── postRoutes.js
│   │   ├── verificationRoutes.js
│   │   └── voteRoutes.js
│   └── services/
│       └── verification/
│           ├── executionEngine.js
│           ├── interpreter.js
│           ├── openRouterProvider.js
│           ├── step0.js
│           ├── verificationQueue.js
│           └── worker.js
└── frontend/
    ├── package.json
    ├── vite.config.ts
    ├── tailwind.config.js
    ├── src/
    │   ├── App.tsx
    │   ├── main.tsx
    │   ├── index.css
    │   ├── components/
    │   │   ├── AIAssistant.tsx
    │   │   ├── Navbar.tsx
    │   │   ├── ProtectedRoute.tsx
    │   │   ├── PublicRoute.tsx
    │   │   └── VerificationPanel.tsx
    │   ├── context/
    │   │   ├── authContext.tsx
    │   │   ├── authProvider.tsx
    │   │   └── useAuth.tsx
    │   ├── pages/
    │   │   ├── CreatePost.tsx
    │   │   ├── Login.tsx
    │   │   ├── PostDetails.tsx
    │   │   ├── Posts.tsx
    │   │   └── Register.tsx
    │   └── services/
    │       └── api.ts
    └── public/
        └── vite.svg
```

## Tech Stack

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Axios
- React Markdown
- Server-Sent Events for streamed AI output

### Backend

- Node.js
- Express
- Mongoose
- CORS
- dotenv
- express-rate-limit

### Database

- MongoDB

### AI

- OpenRouter-compatible chat completions
- `openai/gpt-4o-mini` as the default provider model
- OpenAI-compatible SDK for the streaming AI assistant
- Provider abstraction for verification execution and interpretation

### Authentication

- JWT
- bcrypt password hashing

### Deployment

- The frontend code includes support for `VITE_API_URL`.
- The backend includes configurable CORS origins through `CORS_ORIGINS`.
- No deployment manifest is included in this repository.

## API Endpoints

Base backend URL locally: `http://127.0.0.1:4000`

### Health

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/health` | No | Returns `ok` when the backend is running. |

### Authentication

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/auth/register` | No | Create a user account. |
| `POST` | `/auth/login` | No | Login and receive a JWT. |
| `GET` | `/protected` | Yes | Test protected-route access. |

### Posts

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/posts` | No | List posts, newest first. |
| `POST` | `/posts` | Yes | Create a post. |
| `GET` | `/posts/:id` | No | Get one post by ID. |
| `DELETE` | `/posts/:id` | Yes | Delete a post owned by the current user. |

### Answers

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/posts/:id/answers` | No | List answers for a post. |
| `POST` | `/posts/:id/answers` | Yes | Create an answer and enqueue verification. |
| `DELETE` | `/posts/answers/:id` | Yes | Delete an answer owned by the current user. |

### Votes

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/votes/bulk?ids=id1,id2` | Optional | Get vote summaries for multiple posts. |
| `GET` | `/votes/:id` | Optional | Get vote summary for one post. |
| `POST` | `/votes/:id` | Yes | Cast, switch, or toggle a vote. |

### AI Assistant

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/ai/help` | Yes | Stream AI help for a post using SSE. Rate limited to 10 requests per 15 minutes per IP. |

### Verification

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/api/verifications/:answerId` | No | Get the newest verification run for an answer. |

## Running Locally

### Prerequisites

- Node.js 18 or newer
- npm
- MongoDB connection string
- OpenRouter or OpenAI-compatible API key

### Install Dependencies

```bash
cd backend
npm install

cd ../frontend
npm install
```

### Backend Environment

Create `backend/.env`:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
OPENAI_API_KEY=your_openrouter_or_openai_compatible_key
PORT=4000
```

Optional backend variables:

```env
OPENROUTER_API_KEY=your_openrouter_key
OPENROUTER_EXECUTION_MODEL=openai/gpt-4o-mini
OPENROUTER_EXECUTION_TIMEOUT_MS=30000
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

The verification provider checks `OPENROUTER_API_KEY` first and falls back to `OPENAI_API_KEY`.

### Frontend Environment

Create `frontend/.env` if the API is not running at the default local URL:

```env
VITE_API_URL=http://127.0.0.1:4000
```

### Start Backend

```bash
cd backend
npm start
```

The backend starts on `http://127.0.0.1:4000` by default.

### Start Frontend

```bash
cd frontend
npm run dev
```

The frontend starts on Vite's local dev server, usually `http://127.0.0.1:5173`.

### Build Frontend

```bash
cd frontend
npm run build
```

## Screenshots

Add final demo screenshots here before submission.

### Login

![Login screenshot placeholder](docs/screenshots/login.png)

### Posts

![Posts screenshot placeholder](docs/screenshots/posts.png)

### Post Details and Answers

![Post details screenshot placeholder](docs/screenshots/post-details.png)

### Verification Panel

![Verification panel screenshot placeholder](docs/screenshots/verification-panel.png)

### AI Assistant

![AI assistant screenshot placeholder](docs/screenshots/ai-assistant.png)

## Future Improvements

- Docker sandbox execution for real isolated code runs
- Durable queue processing with retries and persistence
- Rich downloadable execution artifacts
- Multi-provider execution support
- Verification history per answer
- Admin visibility into failed verification jobs
- Stronger input validation on public endpoints
- Deployment manifests for production hosting

## AI Usage

### Development-Time AI Usage

Codex and GPT-5.6 were used during development as engineering assistants for repository analysis, schema design, implementation planning, code generation, QA review, and documentation. Human direction kept the architecture fixed and scoped each milestone.

### Runtime AI Usage

At runtime, DevDiscuss uses OpenRouter-compatible chat completion calls in two places:

- The AI assistant streams post-specific developer guidance to authenticated users.
- The verification provider returns normalized structured results for execution and interpretation stages.

Step 0 screening is deterministic and does not use AI.

## License

MIT
