# DSA Forge Backend

Express + Node.js API for the DSA Forge Next.js UI. Uses MongoDB for users, refresh sessions, conversations and messages; Gemini for query rewriting and grounded answer generation; Pinecone for vector retrieval.

## Architecture

```text
Next.js UI (localhost:3000)
  └── Express API (localhost:4000/api/v1)
      ├── Auth module
      │   ├── register/login/me/refresh/logout
      │   ├── bcrypt password hashes
      │   ├── short-lived signed access token
      │   └── HttpOnly refresh cookie + server-side session hash
      ├── Chat module
      │   ├── user-owned conversation CRUD
      │   ├── query transformation (Gemini)
      │   ├── embedding (gemini-embedding-001)
      │   ├── top-K Pinecone retrieval
      │   └── grounded answer + source metadata (Gemini)
      └── Ingestion module (CLI)
          ├── PDFLoader
          ├── recursive text splitting
          ├── Gemini embeddings
          └── batched Pinecone upserts
```

## Requirements

- Node.js 20+
- MongoDB (local or hosted)
- Gemini API key
- Pinecone index whose vector dimension and metric match `gemini-embedding-001` embeddings
- The PDF used for indexing

## Setup

```bash
npm install
cp .env.example .env
```

Fill in `.env`, then start MongoDB and the API:

```bash
npm run dev
```

Health check: `GET http://localhost:4000/health`.

Put your source PDF at `files/DSA-revision-guide.pdf`, or set `PDF_PATH` to an existing file. Run ingestion manually:

```bash
npm run index:pdf
```

Ingestion is a CLI command deliberately; don't expose arbitrary document ingestion as an unauthenticated API. Re-running this command adds new vectors unless your ingestion pipeline uses stable IDs and deletes/upserts prior document versions. For a production ingestion workflow, add document IDs, stable chunk IDs, a document registry, and re-index/delete semantics.

## API contract (matches intended UI contract)

Base URL: `http://localhost:4000/api/v1`

### Auth

- `POST /auth/register` body `{ "name": "Kunal", "email": "you@example.com", "password": "at-least-8-chars" }`
- `POST /auth/login` body `{ "email": "you@example.com", "password": "..." }`
- `GET /auth/me` requires `Authorization: Bearer <accessToken>`
- `POST /auth/refresh` uses the `dsa_refresh` HttpOnly cookie; rotates refresh token
- `POST /auth/logout` revokes refresh session and clears cookie

Register/login/refresh response:

```json
{
  "success": true,
  "data": {
    "user": { "id": "user-id", "name": "Kunal", "email": "you@example.com" },
    "accessToken": "short-lived-access-token"
  }
}
```

### Chat

All chat endpoints require `Authorization: Bearer <accessToken>`.

- `GET /conversations` returns `data: [{ id, title, updatedAt }]`
- `POST /conversations` body `{ "title": "Optional title" }`; returns `{ id, title }`
- `GET /conversations/:conversationId` returns conversation and messages
- `POST /conversations/:conversationId/messages` body `{ "message": "Explain binary search invariants" }`
- `DELETE /conversations/:conversationId` deletes a conversation belonging to the signed-in user

Message response:

```json
{
  "success": true,
  "data": {
    "id": "message-id",
    "answer": "A grounded explanation...",
    "sources": [{ "title": "DSA-revision-guide.pdf", "score": 0.83, "page": 12 }],
    "conversationId": "conversation-id",
    "title": "Explain binary search invariants"
  }
}
```

Errors use `{ "success": false, "message": "..." }`.

## Connecting the existing Next.js UI

In the UI project `.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/api/v1
```

**Important:** the existing frontend API helper should be updated to unwrap `response.data.data`, because this backend consistently returns `{ success, data }`. The `sendMessage` handler should call `chatApi.createConversation()` first to get a real conversation ID, then `chatApi.sendMessage(id, text)`. Store the access token in memory and attach `Authorization: Bearer ...` to protected requests; do not persist it in localStorage. For a stronger production architecture, put a Next.js Route Handler/BFF in front of this API so browser code never handles the access token directly.

The UI currently uses demo thread IDs and demo responses; replace those with server conversation IDs and returned `answer`/`sources`.

## Security notes

- Refresh tokens are only set in an HttpOnly cookie and stored hashed in MongoDB.
- Access token is returned in JSON. Keep it in memory or use a BFF; never put access/refresh tokens in localStorage.
- Production must use HTTPS and `COOKIE_SECURE=true`. Choose `COOKIE_SAME_SITE` based on frontend/API domain topology; cross-site cookies need `SameSite=None; Secure` and CSRF defenses.
- Cookie path is restricted to `/api/v1/auth`; CORS is restricted to `FRONTEND_ORIGIN` and credentials.
- Add CSRF protection if your deployment uses cross-site cookie authentication.
- Apply per-account login throttling, email verification, password reset, audit logging and monitoring before public launch.
- Use a managed MongoDB deployment, secrets manager, TLS, backups and least-privilege credentials.
- Verify the Pinecone index's vector dimension/model configuration. Keep Gemini and Pinecone keys exclusively in backend environment variables.
- The example stores conversation history as an embedded array. For very long conversations, move messages into a separate collection and paginate.
- Current RAG answer endpoint is synchronous. For long answers, add streaming/SSE or a job-based response.
