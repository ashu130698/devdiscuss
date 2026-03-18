# DevDiscuss

A full-stack Q&A platform for developers — post questions, write answers, and manage your own content. Built with React, TypeScript, Node.js, Express, and MongoDB.


---

## Features

- Post dev questions with a title and body
- Write answers on any post, threaded below the original question
- Upvote/downvote posts with toggle logic (click again to undo)
- Register, login, and stay logged in with JWT tokens
- Only you can delete your own posts and answers
- Responsive UI with glassmorphism navbar and Tailwind CSS

---

## Tech stack

**Frontend:** React 19 · TypeScript · Vite · React Router v6 · Axios · Tailwind CSS 3

**Backend:** Node.js · Express 5 · MongoDB with Mongoose 9 · JWT · bcrypt · Validator.js

---

## Project structure

```
devdiscuss/
├── backend/
│   ├── controllers/        # Business logic (auth, posts, answers)
│   ├── middleware/          # JWT verification
│   ├── models/             # Mongoose schemas (User, Post, Answer)
│   ├── routes/             # Express route definitions
│   └── server.js           # App entry — DB-first init + graceful shutdown
│
└── frontend/
    └── src/
        ├── components/     # Navbar, ProtectedRoute, PublicRoute
        ├── context/        # Auth state management (React Context + custom hook)
        ├── pages/          # Login, Register, Posts, PostDetails, CreatePost
        └── services/       # Axios instance with auth interceptor
```

---

## Getting started

**Prerequisites:** Node.js 18+, a MongoDB instance (local or [Atlas free tier](https://www.mongodb.com/atlas))

### Backend

```bash
cd backend
npm install
```

Create a `.env` file:

```env
PORT=4000
MONGO_URI=mongodb+srv://<your-connection-string>
JWT_SECRET=pick_something_secret
```

```bash
npm start
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

> If running locally, update the `baseURL` in `frontend/src/services/api.ts` to `http://localhost:4000`.

App runs at **http://localhost:5173**.

---

## API endpoints

### Auth
- `POST /auth/register` — create a new account
- `POST /auth/login` — get a JWT token

### Posts (requires auth)
- `GET /posts` — all posts, newest first
- `GET /posts/:id` — single post
- `POST /posts` — create a post
- `DELETE /posts/:id` — delete your post

### Answers (requires auth)
- `GET /posts/:id/answers` — answers for a post
- `POST /posts/:id/answers` — add an answer
- `DELETE /posts/answers/:id` — delete your answer

### Votes
- `POST /posts/:id/vote` — upvote or downvote a post (requires auth, toggles on re-click)
- `GET /posts/:id/votes` — get vote score and current user's vote
- `GET /posts/votes/bulk?ids=id1,id2` — bulk fetch vote data for multiple posts

---

## Design decisions

**DB-first server startup** — Express doesn't accept requests until MongoDB is connected. If the DB connection fails, the process exits with code 1 so container orchestrators know to restart it.

**Axios interceptors for auth** — A request interceptor automatically attaches the `Authorization: Bearer <token>` header instead of doing it manually on every API call.

**Two layers of route protection** — `ProtectedRoute`/`PublicRoute` on the frontend, JWT middleware + ownership checks on the backend. No one can tamper with someone else's content even via direct API calls.

**Graceful shutdown** — Listens for `SIGINT`/`SIGTERM` to close the MongoDB connection cleanly before exiting.

---

Built by **Ashu**
