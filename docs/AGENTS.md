# AGENTS.md - AI Coding Agent Guidelines

**Last Updated**: 2026-10-19  
**Version**: 1.0  
**Purpose**: Guidelines for AI agents working on DSA Forge codebase

---

## Overview

This document provides comprehensive context and rules for AI coding agents (like Kiro, Cursor, GitHub Copilot, etc.) working on the DSA Forge RAG project. Following these guidelines ensures consistency, maintainability, and production-quality code.

---

## 1. Project Context

### 1.1 What is DSA Forge?

DSA Forge is an intelligent Data Structures & Algorithms learning platform that uses Retrieval-Augmented Generation (RAG) to provide contextual, accurate answers to DSA questions.

**Core Value Proposition**:
- Students get instant, context-aware explanations of DSA concepts
- Answers are grounded in curated knowledge base (not hallucinated)
- Conversations maintain context across multiple questions
- Progressive learning path from beginner to advanced

### 1.2 Technology Stack

**Backend (dsa-server)**:
- Runtime: Node.js 20+
- Framework: Express.js 4.x
- Database: MongoDB Atlas (Mongoose ODM)
- Vector DB: Pinecone (3072-dim embeddings)
- LLM: NVIDIA OpenAI API (openai/gpt-oss-20b)
- Embeddings: Google Gemini (gemini-embedding-001)
- Auth: JWT (access + refresh tokens)

**Frontend (dsa-client)**:
- Framework: Next.js 14 (App Router)
- Language: TypeScript
- UI Library: React 18
- Styling: Tailwind CSS
- HTTP Client: Axios
- Markdown: react-markdown + remark-gfm

**DevOps**:
- Version Control: Git
- Package Manager: npm
- Environment: .env files
- Deployment: (TBD - Docker/AWS)

---

## 2. Codebase Structure

### 2.1 Backend Structure

```
dsa-server/
├── src/
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.controller.js    # Auth endpoints
│   │   │   ├── auth.service.js       # Auth business logic
│   │   │   ├── user.model.js         # User schema
│   │   │   └── jwt.util.js           # JWT helpers
│   │   │
│   │   └── chat/
│   │       ├── chat.controller.js    # Chat endpoints
│   │       ├── chat.service.js       # Chat orchestration
│   │       ├── rag.service.js        # RAG pipeline
│   │       ├── conversation.model.js # Conversation schema
│   │       ├── llm.service.js        # NVIDIA LLM client
│   │       ├── embedding.service.js  # Gemini embeddings
│   │       └── vector.service.js     # Pinecone client
│   │
│   ├── middleware/
│   │   ├── auth.middleware.js        # JWT verification
│   │   ├── error.middleware.js       # Global error handler
│   │   └── validation.middleware.js  # Request validation
│   │
│   ├── utils/
│   │   ├── logger.js                 # Winston logger
│   │   ├── async-handler.js          # Promise wrapper
│   │   └── validators.js             # Input validators
│   │
│   ├── config/
│   │   ├── database.js               # MongoDB connection
│   │   ├── pinecone.js               # Pinecone setup
│   │   └── constants.js              # App constants
│   │
│   ├── app.js                        # Express app setup
│   └── server.js                     # Server entry point
│
├── tests/
│   ├── integration/                  # API integration tests
│   └── unit/                         # Unit tests
│
├── scripts/
│   ├── seed-vectors.js               # Populate Pinecone
│   └── test-nvidia-integration.js    # LLM integration test
│
├── files/
│   └── DSA-revision-guide.pdf        # Knowledge base source
│
├── .env                              # Environment variables
├── .env.example                      # Template
├── package.json
└── README.md
```

### 2.2 Frontend Structure

```
dsa-client/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx              # Login page
│   │   └── register/
│   │       └── page.tsx              # Register page
│   │
│   ├── (dashboard)/
│   │   ├── chat/
│   │   │   └── page.tsx              # Main chat interface
│   │   ├── conversations/
│   │   │   └── page.tsx              # Conversation list
│   │   └── profile/
│   │       └── page.tsx              # User profile
│   │
│   ├── layout.tsx                    # Root layout
│   └── page.tsx                      # Home/landing page
│
├── components/
│   ├── ChatApp.tsx                   # Main chat component
│   ├── ConversationList.tsx          # Conversation sidebar
│   ├── MessageList.tsx               # Message display
│   ├── MessageInput.tsx              # Message input
│   ├── MarkdownMessage.tsx           # Markdown renderer
│   ├── AuthForm.tsx                  # Login/Register forms
│   └── Layout/
│       ├── Header.tsx
│       ├── Sidebar.tsx
│       └── Footer.tsx
│
├── lib/
│   ├── api.ts                        # API client (Axios)
│   ├── auth.ts                       # Auth utilities
│   ├── types.ts                      # TypeScript types
│   └── utils.ts                      # Helper functions
│
├── hooks/
│   ├── useAuth.ts                    # Auth hook
│   ├── useChat.ts                    # Chat hook
│   └── useConversations.ts           # Conversations hook
│
├── styles/
│   └── globals.css                   # Global styles + Tailwind
│
├── public/
│   ├── images/
│   └── icons/
│
├── .env.local                        # Frontend env vars
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

---

## 3. Critical Files - DO NOT MODIFY WITHOUT UNDERSTANDING

### 3.1 Backend Core Files

**`src/modules/chat/rag.service.js`**:
- Contains RAG pipeline orchestration
- Handles query → embedding → vector search → LLM → response flow
- Critical for system accuracy
- **Rule**: Test thoroughly after any changes

**`src/modules/auth/jwt.util.js`**:
- JWT token generation and verification
- Security-critical
- **Rule**: Never log tokens, never expose secrets

**`src/config/database.js`**:
- MongoDB connection management
- Connection pooling configuration
- **Rule**: Never commit connection strings

### 3.2 Frontend Core Files

**`lib/api.ts`**:
- Axios instance with interceptors
- Auto token refresh logic
- **Rule**: Maintain token refresh flow exactly as implemented

**`components/ChatApp.tsx`**:
- Main chat interface
- State management for messages
- **Rule**: Keep conversation ID handling as-is (fixed undefined bug)

**`components/MarkdownMessage.tsx`**:
- Markdown rendering with security
- Custom styling for code/tables
- **Rule**: Never use dangerouslySetInnerHTML

---

## 4. Coding Standards

### 4.1 JavaScript/Node.js (Backend)

**Style**:
- Use ES6+ syntax (const, let, arrow functions)
- 2-space indentation
- Single quotes for strings
- Semicolons required
- CamelCase for variables, PascalCase for classes

**Async/Await**:
```javascript
// ✅ Good
const fetchUser = async (userId) => {
  try {
    const user = await User.findById(userId);
    return user;
  } catch (error) {
    logger.error('Error fetching user:', error);
    throw error;
  }
};

// ❌ Bad - No error handling
const fetchUser = async (userId) => {
  const user = await User.findById(userId);
  return user;
};
```

**Error Handling**:
- Use try-catch in async functions
- Throw descriptive errors
- Log errors with context
- Return consistent error format

**Mongoose Models**:
```javascript
// ✅ Good - Clear schema with validation
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  }
}, { timestamps: true });

// ❌ Bad - No validation
const userSchema = new mongoose.Schema({
  username: String
});
```

### 4.2 TypeScript/React (Frontend)

**Style**:
- TypeScript strict mode enabled
- Functional components only
- Hooks for state management
- Destructure props
- Export components as named exports

**Component Structure**:
```typescript
// ✅ Good
interface MessageProps {
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

export const Message: React.FC<MessageProps> = ({ content, role, timestamp }) => {
  return (
    <div className={`message ${role}`}>
      <p>{content}</p>
      <span>{timestamp.toLocaleTimeString()}</span>
    </div>
  );
};

// ❌ Bad - No types, default export
export default function Message(props) {
  return <div>{props.content}</div>;
}
```

**API Calls**:
```typescript
// ✅ Good - Proper error handling
const sendMessage = async (conversationId: string, message: string) => {
  try {
    const response = await api.post(`/conversations/${conversationId}/messages`, {
      message
    });
    return response.data.data; // Unwrap response
  } catch (error) {
    console.error('Failed to send message:', error);
    throw error;
  }
};

// ❌ Bad - No error handling, wrong response access
const sendMessage = async (conversationId: string, message: string) => {
  const response = await api.post(`/conversations/${conversationId}/messages`, { message });
  return response; // Missing .data.data
};
```

### 4.3 Common Patterns

**Controller Pattern** (Backend):
```javascript
// Controller handles HTTP, calls service for logic
const createConversation = async (req, res, next) => {
  try {
    const { message, context } = req.body;
    const userId = req.user.id;
    
    const conversation = await chatService.createConversation(userId, message, context);
    
    res.status(201).json({
      success: true,
      message: 'Conversation created',
      data: { conversation }
    });
  } catch (error) {
    next(error); // Pass to error middleware
  }
};
```

**Service Pattern** (Backend):
```javascript
// Service contains business logic
const createConversation = async (userId, message, context) => {
  // Validate
  if (!message || message.trim().length === 0) {
    throw new Error('Message cannot be empty');
  }
  
  // Create conversation
  const conversation = await Conversation.create({
    userId,
    title: extractTitle(message),
    context,
    messages: [{ role: 'user', content: message }]
  });
  
  // Update user stats
  await User.findByIdAndUpdate(userId, {
    $inc: { 'stats.totalConversations': 1 }
  });
  
  return conversation;
};
```

**Custom Hook Pattern** (Frontend):
```typescript
// Encapsulate logic in custom hooks
export const useChat = (conversationId: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  
  const sendMessage = async (content: string) => {
    setLoading(true);
    try {
      const response = await chatApi.sendMessage(conversationId, content);
      setMessages(prev => [...prev, response.userMessage, response.assistantMessage]);
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return { messages, sendMessage, loading };
};
```

---

## 5. Security Rules

### 5.1 Never Expose Secrets

**Environment Variables**:
- All secrets in `.env` files
- Never commit `.env` to Git
- Use `.env.example` as template
- Validate env vars on startup

```javascript
// ✅ Good - Validate on startup
const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET', 'NVIDIA_API_KEY'];
requiredEnvVars.forEach(key => {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
});

// ❌ Bad - Hardcoded secret
const JWT_SECRET = 'my-secret-key-123';
```

### 5.2 Input Validation

**Always Validate User Input**:
```javascript
// ✅ Good
const validateMessage = (message) => {
  if (typeof message !== 'string') {
    throw new Error('Message must be a string');
  }
  if (message.length > 10000) {
    throw new Error('Message too long (max 10,000 characters)');
  }
  if (message.trim().length === 0) {
    throw new Error('Message cannot be empty');
  }
  return message.trim();
};

// ❌ Bad - No validation
const message = req.body.message;
await Conversation.create({ message });
```

**Sanitize HTML**:
```typescript
// ✅ Good - Use react-markdown (automatic sanitization)
import ReactMarkdown from 'react-markdown';
<ReactMarkdown>{content}</ReactMarkdown>

// ❌ Bad - XSS vulnerability
<div dangerouslySetInnerHTML={{ __html: content }} />
```

### 5.3 Authentication

**Verify User Ownership**:
```javascript
// ✅ Good - Check ownership
const conversation = await Conversation.findById(conversationId);
if (!conversation) {
  throw new Error('Conversation not found');
}
if (conversation.userId.toString() !== req.user.id) {
  throw new Error('Unauthorized');
}

// ❌ Bad - No ownership check
const conversation = await Conversation.findById(conversationId);
```

**Token Handling**:
- Access token: Memory only (frontend)
- Refresh token: HttpOnly cookie only
- Never send refresh token in JSON response body
- Never store tokens in localStorage

---

## 6. Testing Requirements

### 6.1 Backend Tests

**Unit Tests** (Jest):
```javascript
// Test services in isolation
describe('ChatService', () => {
  describe('createConversation', () => {
    it('should create conversation with valid input', async () => {
      const userId = 'user123';
      const message = 'Explain binary search';
      const context = { topic: 'Searching' };
      
      const conversation = await chatService.createConversation(userId, message, context);
      
      expect(conversation).toBeDefined();
      expect(conversation.userId).toBe(userId);
      expect(conversation.messages).toHaveLength(1);
    });
    
    it('should throw error for empty message', async () => {
      await expect(
        chatService.createConversation('user123', '', {})
      ).rejects.toThrow('Message cannot be empty');
    });
  });
});
```

**Integration Tests**:
```javascript
// Test API endpoints
describe('POST /api/v1/conversations', () => {
  it('should create conversation with auth', async () => {
    const response = await request(app)
      .post('/api/v1/conversations')
      .set('Authorization', `Bearer ${validToken}`)
      .send({
        message: 'Explain merge sort',
        context: { topic: 'Sorting' }
      });
    
    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.conversation).toBeDefined();
  });
  
  it('should return 401 without auth', async () => {
    const response = await request(app)
      .post('/api/v1/conversations')
      .send({ message: 'Test' });
    
    expect(response.status).toBe(401);
  });
});
```

### 6.2 Frontend Tests

**Component Tests** (React Testing Library):
```typescript
describe('MessageInput', () => {
  it('should call onSend with message', async () => {
    const mockOnSend = jest.fn();
    render(<MessageInput onSend={mockOnSend} />);
    
    const input = screen.getByPlaceholderText('Type your message...');
    const button = screen.getByRole('button', { name: /send/i });
    
    await userEvent.type(input, 'Hello');
    await userEvent.click(button);
    
    expect(mockOnSend).toHaveBeenCalledWith('Hello');
  });
});
```

### 6.3 Test Coverage Requirements

- **Minimum Coverage**: 80%
- **Critical Paths**: 100% (auth, RAG pipeline, token refresh)
- **Run Tests**: `npm test` (backend), `npm test` (frontend)
- **CI/CD**: Tests must pass before merge

---

## 7. RAG Pipeline - Critical Understanding

### 7.1 RAG Flow

```
User Query
    ↓
1. Generate Query Embedding (Gemini)
    ↓
2. Vector Search (Pinecone, top-5)
    ↓
3. Build Prompt (context + query)
    ↓
4. LLM Generation (NVIDIA)
    ↓
5. Store Response + Metadata
    ↓
Return to User
```

### 7.2 Key Functions

**`rag.service.js`**:
```javascript
// Main RAG orchestration
const generateResponse = async (conversationId, userMessage) => {
  // 1. Generate embedding
  const embedding = await embeddingService.generateEmbedding(userMessage);
  
  // 2. Search vectors
  const relevantDocs = await vectorService.searchSimilar(embedding, {
    topK: 5,
    filter: { /* context filters */ }
  });
  
  // 3. Build prompt
  const context = relevantDocs.map(doc => doc.metadata.content).join('\n\n');
  const prompt = buildPrompt(context, userMessage);
  
  // 4. Call LLM
  const llmResponse = await llmService.generateCompletion(prompt);
  
  // 5. Store message with metadata
  const assistantMessage = {
    role: 'assistant',
    content: llmResponse.content,
    metadata: {
      retrievedDocs: relevantDocs.map(doc => ({
        docId: doc.id,
        title: doc.metadata.title,
        similarity: doc.score
      })),
      tokensUsed: llmResponse.usage.total_tokens,
      responseTime: Date.now() - startTime
    }
  };
  
  await Conversation.findByIdAndUpdate(conversationId, {
    $push: { messages: assistantMessage }
  });
  
  return assistantMessage;
};
```

### 7.3 Rules for RAG Modifications

1. **Never Skip Vector Search**: Always retrieve context (ensures grounded responses)
2. **Always Store Metadata**: Track which docs were used (for debugging/analytics)
3. **Handle LLM Failures Gracefully**: Retry once, then return helpful error
4. **Validate Embeddings**: Check dimension (3072) before Pinecone query
5. **Cache Embeddings**: Same query = same embedding (1hr TTL)

---

## 8. Database Operations

### 8.1 Mongoose Best Practices

**Use Lean Queries** (when no methods needed):
```javascript
// ✅ Good - 30% faster
const conversations = await Conversation.find({ userId }).lean();

// ❌ Bad - Returns full Mongoose documents
const conversations = await Conversation.find({ userId });
```

**Atomic Updates**:
```javascript
// ✅ Good - Atomic, race-condition safe
await Conversation.findByIdAndUpdate(id, {
  $push: { messages: newMessage },
  $inc: { 'stats.messageCount': 1 }
});

// ❌ Bad - Race condition possible
const conv = await Conversation.findById(id);
conv.messages.push(newMessage);
conv.stats.messageCount++;
await conv.save();
```

**Populate Sparingly**:
```javascript
// ✅ Good - Only needed fields
const conversation = await Conversation.findById(id)
  .populate('userId', 'username profile.avatar');

// ❌ Bad - Entire user document
const conversation = await Conversation.findById(id).populate('userId');
```

### 8.2 Pinecone Best Practices

**Batch Operations**:
```javascript
// ✅ Good - Batch upsert
const vectors = embeddings.map((emb, i) => ({
  id: `doc-${i}`,
  values: emb,
  metadata: docs[i]
}));
await index.upsert(vectors); // Single request

// ❌ Bad - Individual upserts
for (const [i, emb] of embeddings.entries()) {
  await index.upsert([{
    id: `doc-${i}`,
    values: emb,
    metadata: docs[i]
  }]); // N requests
}
```

**Metadata Size**:
- Keep metadata under 40KB per vector
- Only store searchable/filterable fields
- Store full content in MongoDB if needed

---

## 9. Frontend Best Practices

### 9.1 State Management

**Use React Hooks**:
```typescript
// ✅ Good - Clean state management
const [messages, setMessages] = useState<Message[]>([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

// ❌ Bad - External state library for simple state
import { createStore } from 'redux';
// ... complex boilerplate for simple state
```

**Avoid Prop Drilling**:
```typescript
// ✅ Good - Context for deep props
const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  // ... auth logic
  return <AuthContext.Provider value={{ user, setUser }}>{children}</AuthContext.Provider>;
};

// ❌ Bad - Prop drilling 5 levels deep
<App user={user}>
  <Dashboard user={user}>
    <Sidebar user={user}>
      <Profile user={user} />
    </Sidebar>
  </Dashboard>
</App>
```

### 9.2 Performance

**Memoization**:
```typescript
// ✅ Good - Memoize expensive computations
const sortedMessages = useMemo(
  () => messages.sort((a, b) => a.timestamp - b.timestamp),
  [messages]
);

// ❌ Bad - Recompute on every render
const sortedMessages = messages.sort((a, b) => a.timestamp - b.timestamp);
```

**Lazy Loading**:
```typescript
// ✅ Good - Code splitting
const ChatApp = lazy(() => import('./components/ChatApp'));

// ❌ Bad - Bundle everything
import ChatApp from './components/ChatApp';
```

---

## 10. Common Issues & Solutions

### 10.1 "Conversation ID Undefined" Bug (FIXED)

**Problem**: Frontend sent `POST /conversations/undefined/messages`

**Root Cause**: Response unwrapping error
```typescript
// ❌ Wrong
const conversation = await api.post('/conversations', data);
setConversationId(conversation.id); // conversation.id is undefined

// ✅ Fixed
const response = await api.post('/conversations', data);
setConversationId(response.data.data.conversation.id); // Correct path
```

**Rule**: Always unwrap API responses as `response.data.data`

### 10.2 Refresh Token Loop (FIXED)

**Problem**: Refresh token API called on every request

**Root Cause**: Axios interceptor logic error

**Solution**: Check `_retry` flag to prevent infinite loops
```typescript
// ✅ Fixed
if (error.response?.status === 401 && !originalRequest._retry) {
  originalRequest._retry = true;
  // ... refresh logic
}
```

### 10.3 LLM Not Responding (FIXED)

**Problem**: No response from NVIDIA LLM

**Root Cause**: Switched from Gemini to NVIDIA, updated API call

**Solution**: Use correct API format
```javascript
// ✅ Fixed - NVIDIA OpenAI format
const completion = await openai.chat.completions.create({
  model: "openai/gpt-oss-20b",
  messages: [{ role: "user", content: query }],
  temperature: 1,
  max_tokens: 4096
});
const response = completion.choices[0]?.message?.content;
```

---

## 11. Git Workflow

### 11.1 Branch Strategy

```
main          (production-ready code)
  ↓
develop       (integration branch)
  ↓
feature/*     (new features)
bugfix/*      (bug fixes)
hotfix/*      (urgent production fixes)
```

### 11.2 Commit Messages

**Format**: `<type>(<scope>): <subject>`

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `refactor`: Code refactoring
- `test`: Add tests
- `chore`: Maintenance

**Examples**:
```bash
feat(chat): add markdown rendering for messages
fix(auth): resolve refresh token infinite loop
docs(api): update authentication endpoints
refactor(rag): optimize vector search caching
test(chat): add integration tests for message sending
```

### 11.3 Pull Request Checklist

Before submitting PR:
- [ ] Code follows style guide
- [ ] All tests pass (`npm test`)
- [ ] New features have tests
- [ ] Documentation updated (if needed)
- [ ] No console.log statements
- [ ] No hardcoded secrets
- [ ] Descriptive PR title and description

---

## 12. Performance Guidelines

### 12.1 Backend Performance

**Optimize Database Queries**:
- Use indexes (see DATABASE.md)
- Project only needed fields
- Paginate large result sets
- Use aggregation pipeline for analytics

**Cache Strategically**:
- User profiles (15 min TTL)
- Query embeddings (1 hour TTL)
- Vector search results (5 min TTL)

**Monitor Response Times**:
- Target: <500ms for API responses
- RAG pipeline: <3s for LLM responses
- Database queries: <100ms

### 12.2 Frontend Performance

**Optimize Rendering**:
- Use React.memo for expensive components
- Virtualize long lists (react-window)
- Debounce input handlers (300ms)

**Reduce Bundle Size**:
- Code splitting with dynamic imports
- Tree shaking (Tailwind purge)
- Image optimization (Next.js Image)

**Network Optimization**:
- Prefetch conversations list
- Optimistic UI updates
- Request deduplication

---

## 13. Deployment Checklist

### 13.1 Pre-Deployment

- [ ] All tests passing
- [ ] Environment variables set
- [ ] Database indexes created
- [ ] CORS configured for production domain
- [ ] Rate limiting enabled
- [ ] Logging configured
- [ ] Error tracking setup (Sentry/similar)

### 13.2 Post-Deployment

- [ ] Health check endpoint responding
- [ ] Auth flow working (login/register/refresh)
- [ ] Chat functionality working
- [ ] Vector search returning results
- [ ] LLM generating responses
- [ ] Frontend connecting to backend
- [ ] Monitor logs for errors

---

## 14. Troubleshooting Guide

### 14.1 Backend Issues

**MongoDB Connection Failed**:
```bash
# Check connection string
echo $MONGO_URI

# Test connection
mongosh "mongodb+srv://..."

# Check network access (MongoDB Atlas IP whitelist)
```

**Pinecone Query Failed**:
```bash
# Verify API key
echo $PINECONE_API_KEY

# Test connection
curl -X GET "https://controller.pinecone.io/databases" \
  -H "Api-Key: $PINECONE_API_KEY"
```

**LLM Not Responding**:
```bash
# Run test script
node scripts/test-nvidia-integration.js

# Check API key
echo $NVIDIA_API_KEY

# Verify model availability
curl -X GET "https://integrate.api.nvidia.com/v1/models" \
  -H "Authorization: Bearer $NVIDIA_API_KEY"
```

### 14.2 Frontend Issues

**Cannot Connect to Backend**:
```bash
# Check environment variable
cat dsa-client/.env.local
# Should have: NEXT_PUBLIC_API_URL=http://localhost:4000

# Test backend health
curl http://localhost:4000/api/v1/health
```

**Token Refresh Not Working**:
- Check browser console for 401 errors
- Verify cookies in DevTools (refreshToken should be present)
- Check interceptor logic in `lib/api.ts`

**Markdown Not Rendering**:
- Verify react-markdown installed
- Check CSS imports in MarkdownMessage.tsx
- Test with simple markdown (e.g., `**bold**`)

---

## 15. Code Review Checklist

When reviewing code, check:

**Functionality**:
- [ ] Code works as intended
- [ ] Edge cases handled
- [ ] Error handling present
- [ ] No regressions

**Security**:
- [ ] No hardcoded secrets
- [ ] Input validation present
- [ ] Auth checks correct
- [ ] No SQL/NoSQL injection risks

**Performance**:
- [ ] No N+1 queries
- [ ] Appropriate indexes used
- [ ] Large lists paginated
- [ ] No unnecessary computations

**Code Quality**:
- [ ] Follows style guide
- [ ] DRY (Don't Repeat Yourself)
- [ ] Clear variable/function names
- [ ] Comments for complex logic
- [ ] No dead code

**Testing**:
- [ ] Tests included
- [ ] Tests cover edge cases
- [ ] All tests pass

---

## 16. Documentation Requirements

### When to Update Documentation

**Update PRD.md** when:
- Adding new features
- Changing user flows
- Modifying requirements

**Update DESIGN.md** when:
- Changing UI components
- Updating design system
- Modifying user experience

**Update ARCHITECTURE.md** when:
- Adding new services
- Changing tech stack
- Modifying system design

**Update DATABASE.md** when:
- Adding new collections/schemas
- Creating indexes
- Changing data models

**Update API.md** when:
- Adding/modifying endpoints
- Changing request/response formats
- Updating authentication flow

**Update AGENTS.md** (this file) when:
- Changing coding standards
- Adding new patterns
- Updating project structure

---

## 17. Quick Reference Commands

### Backend

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Lint code
npm run lint

# Seed vector database
node scripts/seed-vectors.js

# Test NVIDIA integration
node scripts/test-nvidia-integration.js
```

### Frontend

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run production build
npm start

# Run tests
npm test

# Lint code
npm run lint

# Type check
npm run type-check
```

---

## 18. Contact & Resources

### Documentation Files
- `PRD.md` - Product requirements
- `DESIGN.md` - Design system and UI
- `ARCHITECTURE.md` - System architecture
- `DATABASE.md` - Database schemas
- `API.md` - API endpoints
- `AGENTS.md` - This file

### External Resources
- [Express.js Docs](https://expressjs.com/)
- [Next.js Docs](https://nextjs.org/docs)
- [MongoDB Docs](https://docs.mongodb.com/)
- [Pinecone Docs](https://docs.pinecone.io/)
- [NVIDIA NIM Docs](https://docs.nvidia.com/nim/)

---

## Document Control

**Author**: Tech Lead  
**Reviewers**: All Developers, AI Agents  
**Next Review**: 2026-11-19

**Version History**:
- 2026-10-19 v1.0: Initial agent guidelines
- Future: Update as patterns evolve

---

## Summary for AI Agents

**Before you start coding**:
1. Read PRD.md (understand what you're building)
2. Read ARCHITECTURE.md (understand how it works)
3. Read this file (understand coding standards)

**When coding**:
- Follow style guide (Section 4)
- Follow security rules (Section 5)
- Write tests (Section 6)
- Handle errors properly
- Document complex logic

**Before committing**:
- Run tests (`npm test`)
- Check no secrets committed
- Write clear commit message
- Update documentation if needed

**Remember**:
- Quality > Speed
- Security first
- Test everything
- Document decisions
- Ask for help when unclear

---

**Welcome to DSA Forge development! 🚀**
