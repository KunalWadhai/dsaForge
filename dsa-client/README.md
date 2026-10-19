# DSA Forge — Next.js UI

A polished dark, silver-accented chat UI for a Retrieval-Augmented Generation (RAG) DSA tutor. Built with Next.js App Router, React, TypeScript, and Lucide icons.

## Included

- Responsive chat workspace with conversation history, prompt starters, message composer, typing state, answer actions, source chips, and demo response.
- Login and registration screens.
- Centralized API client in `lib/api.ts` for auth, session refresh, and chat endpoints.
- CSS design system with dark graphite surfaces, silver gradients, subtle borders, and responsive layouts.
- `.env.example` and integration notes.

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

The current chat response is deliberately a **demo** so the UI works before the Node.js API integration. Authentication forms call the example endpoints and will show an integration error until the backend is running.

## Backend integration map

Set `NEXT_PUBLIC_API_BASE_URL` in `.env.local` to your Node.js API URL, for example:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/api/v1
```

The frontend expects these example routes; adapt `lib/api.ts` if your existing backend contract differs.

| Method | Route | Purpose |
|---|---|---|
| `POST` | `/auth/register` | Create account |
| `POST` | `/auth/login` | Create session |
| `GET` | `/auth/me` | Current user/session |
| `POST` | `/auth/refresh` | Rotate/refresh session |
| `POST` | `/auth/logout` | Revoke session |
| `GET` | `/conversations` | List conversation history |
| `POST` | `/conversations` | Create conversation |
| `POST` | `/conversations/:id/messages` | Send question and retrieve answer + sources |

Example response for `POST /conversations/:id/messages`:

```json
{
  "id": "message_123",
  "answer": "Binary search keeps a search-space invariant...",
  "sources": [
    { "title": "DSA Fundamentals · Chapter 04", "score": 0.92 }
  ]
}
```

### Session security recommendations

- Prefer a Backend-for-Frontend (BFF) route layer in Next.js if you need to keep access tokens out of browser JavaScript. Store the access token server-side/in a secure server session where possible.
- Set refresh/session cookies from the backend using `HttpOnly`, `Secure` in production, and an appropriate `SameSite` policy. Never put refresh tokens in `localStorage` or `sessionStorage`.
- Use short-lived access tokens, refresh-token rotation, revocation on logout, and CSRF protection for cookie-authenticated state-changing requests.
- Enable CORS for the actual frontend origin only. Do not use `*` with credentials.
- Keep model-provider and Pinecone credentials only on the Node.js backend.
- Add rate limits, request validation, input-size limits, and per-user conversation ownership checks server-side.

## Connecting real RAG responses

In `components/ChatApp.tsx`, locate `sendMessage`. Replace the demo delay and `makeDemoAnswer(text)` with `chatApi.sendMessage(activeThread, text)` from `lib/api.ts`. Then map the returned `answer` and `sources` into the assistant message. Also load conversations with `chatApi.listConversations()` after authentication and wire `newChat()` to `chatApi.createConversation()`.

The current `activeThread` IDs are demo IDs, so do not call the real endpoint until you replace them with IDs returned by the backend.

## Production hardening checklist

- [ ] Decide whether the frontend calls the backend directly or through Next.js Route Handlers (BFF).
- [ ] Align request/response DTOs and error shape with the Node.js API.
- [ ] Implement session bootstrap (`/auth/me`) and loading/unauthenticated states.
- [ ] Add CSRF protections if using cookies cross-site.
- [ ] Add conversation pagination, retry, cancel/abort, and streaming if supported.
- [ ] Render Markdown safely (e.g. `react-markdown` with raw HTML disabled) for model answers and code blocks.
- [ ] Display retrieved citations with source metadata and scores from the backend.
- [ ] Add tests for auth flows, API errors, and chat states.
- [ ] Add analytics/telemetry without logging sensitive prompts or tokens.

## Notes

- This is a frontend starter, not a finished auth backend. The API client is a contract template and the visible chat currently runs with demo answers.
- Google Fonts are loaded from CSS; remove the `@import` if you need a fully offline/self-hosted font setup.
