# DSA Forge — Documentation Index

> **For AI coding agents**: Start with [`AGENTS.md`](./AGENTS.md). It contains all coding standards, project structure, security rules, and patterns you need before touching any code.

---

## Documents

| File | What it covers | Read when you're… |
|------|---------------|-------------------|
| [`AGENTS.md`](./AGENTS.md) | Coding standards, patterns, critical files, security rules, git workflow | **Starting any task** |
| [`PRD.md`](./PRD.md) | Product requirements, user stories, feature scope | Adding/changing features |
| [`ARCHITECTURE.md`](./ARCHITECTURE.md) | System design, RAG pipeline, tech stack, data flow | Changing system structure |
| [`DESIGN.md`](./DESIGN.md) | UI/UX system, components, color tokens, responsive rules | Touching the frontend |
| [`DATABASE.md`](./DATABASE.md) | MongoDB schemas, Pinecone setup, indexes, query patterns | Working with data |
| [`API.md`](./API.md) | All REST endpoints, auth flow, request/response shapes | Building or consuming APIs |
| [`IMPLEMENTATION.md`](./IMPLEMENTATION.md) | Local setup, env vars, testing, production deploy checklist | Setting up or deploying |
| [`FRONTEND_FIX.md`](./FRONTEND_FIX.md) | Conversation ID bug history and fix explanation | Debugging chat flow issues |
| [`PRODUCTION_TEST_RESULTS.md`](./PRODUCTION_TEST_RESULTS.md) | Latest test run results and readiness status | Verifying system health |

---

## Project Layout (quick reference)

```
dsaforge-rag-app/
├── README.md               ← project overview & quick-start
├── docs/                   ← all documentation (you are here)
│   ├── index.md
│   ├── AGENTS.md
│   ├── PRD.md
│   ├── DESIGN.md
│   ├── ARCHITECTURE.md
│   ├── DATABASE.md
│   ├── API.md
│   ├── IMPLEMENTATION.md
│   ├── FRONTEND_FIX.md
│   └── PRODUCTION_TEST_RESULTS.md
├── dsa-server/             ← Express.js backend
│   └── src/modules/
│       ├── auth/           ← JWT auth
│       └── chat/           ← RAG pipeline + conversations
└── dsa-client/             ← Next.js 14 frontend
    ├── app/
    ├── components/
    └── lib/api.ts          ← Axios client + token refresh
```

---

## Stack at a glance

| Layer | Technology |
|-------|-----------|
| Backend | Node 20, Express 4, Mongoose |
| Auth | JWT (access 15 min · refresh 7 days, HttpOnly cookie) |
| LLM | NVIDIA API — `openai/gpt-oss-20b` |
| Embeddings | Google Gemini `gemini-embedding-001` (3072 dim) |
| Vector DB | Pinecone (cosine, serverless) |
| Primary DB | MongoDB Atlas |
| Frontend | Next.js 14 App Router, TypeScript, Tailwind CSS |
