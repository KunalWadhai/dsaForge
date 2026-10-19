# Architecture Document: DSA Forge

## Technology Stack

### Frontend
**Framework**: Next.js 14 (React 18)
**Reasoning**:
- Server-side rendering for better SEO and initial load
- Built-in routing and API routes
- TypeScript support out of the box
- Great developer experience
- Industry standard for React applications

**Language**: TypeScript
**Styling**: CSS Modules + Global CSS
**State Management**: React hooks (useState, useContext)
**HTTP Client**: Native Fetch API
**Markdown Rendering**: react-markdown + remark-gfm
**Icons**: lucide-react

### Backend
**Framework**: Express.js (Node.js 20+)
**Reasoning**:
- Lightweight and flexible
- Large ecosystem
- Easy to understand and maintain
- Perfect for RESTful APIs
- Good TypeScript support

**Language**: JavaScript (ES Modules)
**Validation**: Zod schemas
**Authentication**: JWT (jsonwebtoken) + bcryptjs
**Rate Limiting**: express-rate-limit
**Security**: helmet, cors, cookie-parser

### Databases

**Primary Database**: MongoDB (Atlas)
**Reasoning**:
- Flexible schema for conversations
- Good performance for document storage
- Easy to scale
- Free tier available
- Embedded messages in conversations

**Vector Database**: Pinecone
**Reasoning**:
- Purpose-built for vector similarity search
- Managed service (no infrastructure)
- Fast semantic search
- Free tier sufficient for MVP
- Good LangChain integration

### AI/ML Services

**LLM**: NVIDIA OpenAI API (openai/gpt-oss-20b)
**Reasoning**:
- Cost-effective compared to GPT-4
- Good performance for DSA questions
- OpenAI-compatible API
- Reliable uptime

**Embeddings**: Google Gemini (gemini-embedding-001)
**Reasoning**:
- High-quality embeddings
- 3072 dimensions for semantic richness
- Free tier available
- LangChain integration

**Orchestration**: LangChain
**Reasoning**:
- Simplifies RAG pipeline
- Text splitting and chunking
- Vector store abstractions
- Good documentation

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT (Browser)                      │
│  ┌─────────────────────────────────────────────────┐   │
│  │     Next.js App (React Components)              │   │
│  │  - Pages (/, /chat, /login, /register)          │   │
│  │  - Components (ChatApp, MarkdownMessage)        │   │
│  │  - API Client (lib/api.ts)                      │   │
│  │  - Auth Context (useAuth hook)                  │   │
│  └─────────────────────────────────────────────────┘   │
└────────────────────┬────────────────────────────────────┘
                     │ HTTPS (REST)
                     │ Authorization: Bearer <token>
                     ▼
┌─────────────────────────────────────────────────────────┐
│              EXPRESS API SERVER (Node.js)                │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Routes                                          │   │
│  │  /api/v1/auth/*      - Authentication           │   │
│  │  /api/v1/conversations/*  - Chat                │   │
│  │  /api/v1/ingestion/*  - Knowledge base          │   │
│  └─────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Middleware                                      │   │
│  │  - CORS, Helmet, Rate Limiting                  │   │
│  │  - JWT Verification (requireAuth)               │   │
│  │  - Error Handler                                │   │
│  └─────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Services                                        │   │
│  │  - auth.service.js                              │   │
│  │  - chat.service.js                              │   │
│  │  - rag.service.js (RAG orchestration)           │   │
│  └─────────────────────────────────────────────────┘   │
└──────┬────────────────┬────────────────┬───────────────┘
       │                │                │
       ▼                ▼                ▼
  ┌─────────┐    ┌──────────┐    ┌──────────────┐
  │ MongoDB │    │ Pinecone │    │ NVIDIA/Gemini│
  │ Atlas   │    │  Vector  │    │     APIs     │
  │         │    │   DB     │    │              │
  └─────────┘    └──────────┘    └──────────────┘
   Users             Embeddings      LLM & Embeddings
   Conversations     Semantic Search Answer Generation
   Sessions
```

## Data Flow

### User Authentication Flow
```
1. User submits login (email, password)
   ↓
2. Express validates credentials against MongoDB
   ↓
3. Generate JWT access token (15min) + refresh token (7 days)
   ↓
4. Return access token in JSON, set refresh token in HttpOnly cookie
   ↓
5. Client stores access token in memory (module variable)
   ↓
6. Client includes access token in Authorization header
   ↓
7. Server middleware verifies token on each protected request
```

### RAG Question-Answer Flow
```
1. User types question in chat input
   ↓
2. Frontend sends POST to /api/v1/conversations/:id/messages
   ↓
3. Backend chat.controller validates request
   ↓
4. chat.service retrieves conversation history
   ↓
5. rag.service.answerDsaQuestion called
   ├─ a. Transform query using NVIDIA LLM (make it concise)
   ├─ b. Generate embedding using Gemini API
   ├─ c. Query Pinecone for top 8 similar chunks
   ├─ d. Build context from retrieved documents
   ├─ e. Format messages with history + context
   ├─ f. Call NVIDIA LLM for answer generation
   └─ g. Parse sources from metadata
   ↓
6. Save user message + assistant response to MongoDB
   ↓
7. Return { answer, sources } to frontend
   ↓
8. Frontend renders markdown answer + source chips
```

### Token Refresh Flow
```
1. Client makes API request with expired access token
   ↓
2. Server returns 401 Unauthorized
   ↓
3. Client detects 401, attempts refresh
   ↓
4. POST /api/v1/auth/refresh with refresh token cookie
   ↓
5. Server validates refresh token from cookie + DB
   ↓
6. Generate new access token + rotate refresh token
   ↓
7. Return new access token
   ↓
8. Client stores new token, retries original request
```

## Folder Structure

### Backend (dsa-server)
```
dsa-server/
├── src/
│   ├── config/
│   │   ├── db.js              # MongoDB connection
│   │   └── env.js             # Environment validation (Zod)
│   ├── middleware/
│   │   └── auth.js            # JWT verification (requireAuth)
│   ├── models/
│   │   ├── User.js            # User schema
│   │   ├── Conversation.js    # Conversation + messages schema
│   │   └── Session.js         # Refresh token sessions
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.routes.js
│   │   │   ├── auth.controller.js
│   │   │   └── auth.service.js
│   │   ├── chat/
│   │   │   ├── chat.routes.js
│   │   │   ├── chat.controller.js
│   │   │   ├── chat.service.js
│   │   │   └── rag.service.js       # RAG orchestration
│   │   └── ingestion/
│   │       ├── ingestion.routes.js
│   │       ├── ingestion.controller.js
│   │       └── indexDocument.js     # PDF ingestion script
│   ├── utils/
│   │   ├── asyncHandler.js    # Async error wrapper
│   │   ├── httpError.js       # Error class
│   │   └── tokens.js          # JWT sign/verify
│   ├── app.js                 # Express app setup
│   └── server.js              # Server entry point
├── files/
│   └── DSA-revision-guide.pdf # Knowledge base source
├── .env                       # Environment variables
├── package.json
└── README.md
```

### Frontend (dsa-client)
```
dsa-client/
├── app/
│   ├── page.tsx               # Landing/chat page
│   ├── login/
│   │   └── page.tsx           # Login page
│   ├── register/
│   │   └── page.tsx           # Register page
│   ├── layout.tsx             # Root layout
│   └── globals.css            # Global styles + markdown CSS
├── components/
│   ├── ChatApp.tsx            # Main chat interface
│   └── MarkdownMessage.tsx    # Markdown renderer
├── lib/
│   ├── api.ts                 # API client functions
│   └── useAuth.ts             # Auth context/hook
├── public/
│   └── assets/                # Images, icons
├── .env.local                 # Environment variables
├── next.config.js
├── package.json
├── tsconfig.json
└── README.md
```

## Database Interaction

### Connection
- Single MongoDB connection pool created on server start
- Connection string from environment variable
- Automatic reconnection on failure
- Graceful shutdown on SIGTERM/SIGINT

### Models (Mongoose ODM)
- Schema validation for type safety
- Indexes on frequently queried fields
- Virtuals for computed properties
- Middleware for hashing passwords

### Query Patterns
- Find by ID: `Conversation.findById(id)`
- Filter by user: `Conversation.find({ userId })`
- Sort by date: `.sort({ updatedAt: -1 })`
- Embedded messages: stored in conversation.messages array

### Transactions
- Not used in MVP (simple create/update operations)
- Future: Use for multi-document updates

## Authentication & Authorization

### Authentication Strategy
**JWT Access + Refresh Tokens**

**Access Token**:
- Lifetime: 15 minutes
- Storage: Client memory (JavaScript variable)
- Transport: Authorization header (`Bearer <token>`)
- Payload: `{ sub: userId, email }`
- Lost on page refresh (intentional)

**Refresh Token**:
- Lifetime: 7 days
- Storage: HttpOnly, Secure, SameSite cookie
- Transport: Automatic (browser sends with requests)
- Purpose: Obtain new access tokens
- Rotated on each use

### Authorization Model
**Resource Ownership**: Users can only access their own:
- Conversations
- Messages
- Profile data

**Enforcement**:
```javascript
// Server-side check
const conversation = await Conversation.findById(id);
if (conversation.userId.toString() !== req.user.id) {
  throw new HttpError(403, "Forbidden");
}
```

### Session Management
- Refresh tokens stored in `sessions` collection
- Linked to user and device (user agent)
- Invalidated on logout
- Expired sessions cleaned up periodically

### Security Measures
- Passwords: bcrypt with 10 rounds
- Tokens: HS256 algorithm, 32+ character secrets
- Rate limiting: 120 req/min global, 20 req/min chat
- Input validation: Zod schemas
- CORS: Specific origin only
- Headers: Helmet middleware

## API Architecture

### REST API Principles
- Resource-oriented URLs
- HTTP methods: GET, POST, DELETE
- JSON request/response
- Consistent error format

### Base URL
```
Development: http://localhost:4000/api/v1
Production:  https://api.dsaforge.com/api/v1
```

### Authentication
- Protected routes require `Authorization: Bearer <token>`
- Public routes: `/auth/login`, `/auth/register`, `/health`

### Response Format
```json
{
  "success": true | false,
  "data": { ... },        // On success
  "message": "...",       // On error
  "details": { ... }      // Optional error details
}
```

### Error Handling
- 400: Bad Request (validation errors)
- 401: Unauthorized (missing/invalid token)
- 403: Forbidden (insufficient permissions)
- 404: Not Found
- 429: Too Many Requests (rate limited)
- 500: Internal Server Error
- 503: Service Unavailable (external API down)

## External Services

### NVIDIA OpenAI API
**Purpose**: LLM for answer generation
**Configuration**:
- `NVIDIA_API_KEY`: API key
- `NVIDIA_BASE_URL`: https://integrate.api.nvidia.com/v1
- `NVIDIA_CHAT_MODEL`: openai/gpt-oss-20b

**Usage**:
```javascript
const openai = new OpenAI({
  apiKey: env.NVIDIA_API_KEY,
  baseURL: env.NVIDIA_BASE_URL,
});

const completion = await openai.chat.completions.create({
  model: env.NVIDIA_CHAT_MODEL,
  messages: [...],
  temperature: 0.25,
  max_tokens: 4096,
});
```

**Error Handling**:
- Timeout: 30 seconds
- Retry: None (fail fast)
- Fallback: Return error message to user

### Google Gemini Embeddings
**Purpose**: Generate vector embeddings for semantic search
**Configuration**:
- `GEMINI_API_KEY`: API key
- `GEMINI_EMBEDDING_MODEL`: gemini-embedding-001

**Usage**:
```javascript
const embeddings = new GoogleGenerativeAIEmbeddings({
  apiKey: env.GEMINI_API_KEY,
  model: env.GEMINI_EMBEDDING_MODEL,
});

const vector = await embeddings.embedQuery(text);
// Returns array of 3072 floats
```

**Error Handling**:
- Cannot proceed without embeddings
- Return 503 if API unavailable

### Pinecone Vector DB
**Purpose**: Store and search document embeddings
**Configuration**:
- `PINECONE_API_KEY`: API key
- `PINECONE_INDEX_NAME`: Index name
- `PINECONE_NAMESPACE`: Optional namespace

**Usage**:
```javascript
const pinecone = new Pinecone({ apiKey: env.PINECONE_API_KEY });
const index = pinecone.Index(env.PINECONE_INDEX_NAME);

const result = await index.query({
  topK: 8,
  vector: embeddedQuery,
  includeMetadata: true,
});
```

**Error Handling**:
- Return "no relevant information" if query fails
- Log error but don't expose details

## Environment Configuration

### Backend (.env)
```bash
# Server
NODE_ENV=development|production
PORT=4000
API_PREFIX=/api/v1
FRONTEND_ORIGIN=http://localhost:3000

# Database
MONGODB_URI=mongodb+srv://...

# JWT
JWT_ACCESS_SECRET=<32+ char random string>
JWT_REFRESH_SECRET=<32+ char random string>
ACCESS_TOKEN_TTL=15m
REFRESH_TOKEN_TTL_DAYS=7

# Cookies
COOKIE_SECURE=false|true
COOKIE_SAME_SITE=lax|strict
COOKIE_DOMAIN=

# NVIDIA OpenAI
NVIDIA_API_KEY=nvapi-...
NVIDIA_BASE_URL=https://integrate.api.nvidia.com/v1
NVIDIA_CHAT_MODEL=openai/gpt-oss-20b

# Gemini
GEMINI_API_KEY=AIza...
GEMINI_EMBEDDING_MODEL=gemini-embedding-001

# Pinecone
PINECONE_API_KEY=...
PINECONE_INDEX_NAME=...
PINECONE_NAMESPACE=

# RAG Settings
RETRIEVAL_TOP_K=8
MAX_MESSAGE_LENGTH=8000

# PDF Ingestion
PDF_PATH=./files/DSA-revision-guide.pdf
CHUNK_SIZE=1000
CHUNK_OVERLAP=150
```

### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/api/v1
NEXT_PUBLIC_APP_NAME=DSA Forge
```

## Error Handling Strategy

### Backend Error Handling
1. **Async Error Wrapper**: All async controllers wrapped
2. **Custom Error Class**: HttpError with status codes
3. **Global Error Handler**: Express middleware
4. **Validation Errors**: Zod parse errors → 400
5. **Auth Errors**: JWT errors → 401
6. **Not Found**: 404 for missing resources
7. **Server Errors**: 500 for unexpected errors

### Frontend Error Handling
1. **Try/Catch**: All API calls wrapped
2. **Toast Notifications**: User-friendly error messages
3. **Error Boundaries**: Catch React rendering errors
4. **Retry Logic**: Automatic refresh on 401
5. **Offline Detection**: Network error handling

### Logging
- Development: Console logs
- Production: Consider services like LogRocket, Sentry
- Never log: Passwords, tokens, API keys
- Log: Error messages, stack traces, user ID (not PII)

## Security Boundaries

### Client-Server Trust Boundary
- **Never trust client input**: Validate server-side
- **Never expose secrets**: API keys stay on server
- **Never skip auth checks**: Verify tokens on every request
- **Never trust client authorization**: Check permissions server-side

### Data Protection
- Passwords: Hashed with bcrypt (never plain text)
- Tokens: Signed with HS256, verified on use
- Sessions: Stored server-side, not client-side
- Cookies: HttpOnly (JavaScript inaccessible)

### Input Validation
- Zod schemas for all user input
- Length limits on text fields
- Email format validation
- Password strength requirements (future)

### Rate Limiting
- Global: 120 requests/min
- Chat: 20 requests/min
- Auth: 5 login attempts/min per IP (future)

## Testing Strategy

### Backend Testing
- **Unit Tests**: Service functions (auth, RAG logic)
- **Integration Tests**: API endpoints
- **Manual Testing**: Test scripts (test-integration.js)

### Frontend Testing
- **Unit Tests**: Utility functions, hooks
- **Component Tests**: React components (future)
- **E2E Tests**: User flows (future)
- **Manual Testing**: Browser testing

### Test Coverage Goals
- Critical paths: 80%+ coverage
- Edge cases: Known edge cases tested
- Security: Auth and authorization flows

## Deployment Approach

### Backend Deployment
**Recommended**: Railway, Render, or AWS Elastic Beanstalk

**Requirements**:
- Node.js 20+ runtime
- Environment variables configured
- MongoDB connection available
- HTTPS enabled

**Build Command**: `npm install`
**Start Command**: `npm start`

**Health Check**: `GET /health`

### Frontend Deployment
**Recommended**: Vercel (optimized for Next.js)

**Requirements**:
- Node.js 20+ runtime
- Environment variables configured
- API_BASE_URL points to backend

**Build Command**: `npm run build`
**Start Command**: `npm start`

### Database Deployment
**MongoDB**: Already on Atlas (managed)
**Pinecone**: Already managed service

### Deployment Checklist
- [ ] Set NODE_ENV=production
- [ ] Configure CORS for production domain
- [ ] Set COOKIE_SECURE=true
- [ ] Set strong JWT secrets (32+ chars)
- [ ] Configure production MongoDB URI
- [ ] Verify environment variables
- [ ] Test health endpoint
- [ ] Run database migrations (if any)
- [ ] Test critical user flows
- [ ] Set up error monitoring

## Scalability Considerations

### MVP (Current Architecture)
- **Expected Load**: 100 concurrent users
- **Database**: MongoDB free tier (500MB)
- **Vector DB**: Pinecone free tier (100k vectors)
- **API**: Single instance sufficient

### Future Scaling (Post-MVP)
- **Horizontal Scaling**: Add more backend instances
- **Caching**: Redis for session caching
- **CDN**: CloudFlare for static assets
- **Database**: Upgrade MongoDB tier
- **Queue**: Bull for background jobs (PDF ingestion)
- **Load Balancer**: Nginx or AWS ALB

### Bottlenecks to Monitor
1. LLM API rate limits (NVIDIA)
2. Embedding API rate limits (Gemini)
3. Pinecone query limits
4. MongoDB connection pool
5. Network bandwidth

## Monitoring & Observability

### Application Monitoring
- Health check endpoint: `/health`
- Error logging: Console (dev), service (prod)
- Performance: Response times logged

### Database Monitoring
- MongoDB Atlas built-in monitoring
- Connection pool size
- Query performance

### External Service Monitoring
- API success/failure rates
- Response times
- Quota usage

### Alerts (Future)
- Server down
- High error rate (>5%)
- External API failures
- Database connection issues

## Security Checklist

### Before Launch
- [ ] All secrets in environment variables
- [ ] HTTPS enabled
- [ ] CORS configured for production
- [ ] Rate limiting active
- [ ] Helmet middleware enabled
- [ ] Input validation on all endpoints
- [ ] Auth tokens expire properly
- [ ] Passwords hashed with bcrypt
- [ ] HttpOnly cookies for refresh tokens
- [ ] No sensitive data in logs
- [ ] No console.log in production
- [ ] Dependencies audited (npm audit)
- [ ] SQL injection: N/A (MongoDB + Mongoose)
- [ ] XSS: React escapes by default
- [ ] CSRF: SameSite cookies

## Technical Debt & Future Work

### Known Technical Debt
1. **No streaming responses**: LLM responses arrive all at once
2. **No conversation search**: Can't search within conversations
3. **Limited test coverage**: Only manual tests currently
4. **No database indexes**: May need optimization later
5. **No caching**: Every request hits LLM APIs

### Future Architecture Improvements
1. **Streaming**: Server-Sent Events for LLM responses
2. **Caching**: Redis for frequent queries
3. **Search**: Elasticsearch for conversation search
4. **Background Jobs**: Queue system for PDF ingestion
5. **Multi-tenancy**: Support teams/organizations
6. **Analytics**: Track usage patterns
7. **Admin Panel**: Manage users and content
