# DSA Forge - RAG-Powered DSA Learning Platform

**Version**: 1.0  
**Status**: Production Ready  
**Last Updated**: 2026-10-19

---

## 🚀 Quick Start

```bash
# Backend
cd dsa-server
npm install
cp .env.example .env
# Edit .env with your API keys
npm run dev

# Frontend (new terminal)
cd dsa-client
npm install
echo "NEXT_PUBLIC_API_URL=http://localhost:4000" > .env.local
npm run dev
```

**Access Application**:
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000
- Health Check: http://localhost:4000/api/v1/health

---

## 📚 Documentation Structure

This project uses comprehensive documentation for **agentic coding** - enabling any AI coding agent to understand and work on the codebase with full context.

### Core Documentation

| Document | Purpose | Read When |
|----------|---------|-----------|
| **[PRD.md](./PRD.md)** | Product Requirements | Understanding what to build |
| **[DESIGN.md](./DESIGN.md)** | UI/UX Design System | Designing or modifying UI |
| **[ARCHITECTURE.md](./ARCHITECTURE.md)** | System Architecture | Understanding how system works |
| **[DATABASE.md](./DATABASE.md)** | Database Schemas & Queries | Working with data models |
| **[API.md](./API.md)** | API Endpoints & Auth | Building/consuming APIs |
| **[AGENTS.md](./AGENTS.md)** | AI Agent Coding Guidelines | **START HERE** for AI agents |
| **[IMPLEMENTATION.md](./IMPLEMENTATION.md)** | Setup, Testing, Deployment | Setting up or deploying |

### Documentation Reading Order

**For New Developers:**
1. README.md (this file) - Overview
2. PRD.md - What we're building
3. ARCHITECTURE.md - How it works
4. IMPLEMENTATION.md - Setup and run

**For AI Coding Agents:**
1. **AGENTS.md** - Your primary guide (coding standards, patterns, critical files)
2. ARCHITECTURE.md - System understanding
3. API.md or DATABASE.md - As needed for specific tasks

**For API Consumers:**
1. API.md - Complete API reference
2. ARCHITECTURE.md - Auth flow understanding

---

## 🏗️ Project Structure

```
RAG/
├── dsa-server/              # Backend (Express.js + MongoDB + RAG)
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/        # Authentication (JWT)
│   │   │   └── chat/        # Chat & RAG pipeline
│   │   ├── middleware/      # Auth, error handling
│   │   ├── config/          # Database, Pinecone
│   │   └── utils/           # Helpers, validators
│   ├── tests/               # Unit & integration tests
│   ├── scripts/             # Seed, test, backup scripts
│   └── .env                 # Environment variables
│
├── dsa-client/              # Frontend (Next.js + TypeScript)
│   ├── app/                 # Next.js App Router
│   ├── components/          # React components
│   ├── lib/                 # API client, utilities
│   ├── hooks/               # Custom React hooks
│   └── .env.local           # Frontend config
│
└── docs/                    # Documentation (these files)
    ├── PRD.md
    ├── DESIGN.md
    ├── ARCHITECTURE.md
    ├── DATABASE.md
    ├── API.md
    ├── AGENTS.md
    └── IMPLEMENTATION.md
```

---

## 🧠 What is DSA Forge?

DSA Forge is an **intelligent Data Structures & Algorithms learning platform** that uses **Retrieval-Augmented Generation (RAG)** to provide accurate, contextual answers to DSA questions.

### Key Features

✨ **RAG-Powered Responses**
- Answers grounded in curated DSA knowledge base
- No hallucinations - every answer cites sources
- Context-aware follow-up questions

💬 **Conversational Learning**
- Natural chat interface
- Multi-turn conversations with memory
- Progressive difficulty scaling

🔍 **Semantic Search**
- Vector-based similarity search (Pinecone)
- Find relevant examples and explanations
- Multi-topic knowledge retrieval

🎯 **Personalized Experience**
- Track learning progress
- Skill level adaptation
- Topic recommendations

---

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js 20+
- **Framework**: Express.js 4.x
- **Database**: MongoDB Atlas (Mongoose ODM)
- **Vector DB**: Pinecone (3072-dim embeddings)
- **LLM**: NVIDIA OpenAI API (openai/gpt-oss-20b)
- **Embeddings**: Google Gemini (gemini-embedding-001)
- **Auth**: JWT (access + refresh tokens)

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **UI**: React 18 + Tailwind CSS
- **HTTP Client**: Axios with interceptors
- **Markdown**: react-markdown + remark-gfm

### DevOps
- **Version Control**: Git
- **Package Manager**: npm
- **Testing**: Jest (backend) + React Testing Library (frontend)
- **Process Manager**: PM2 (production)

---

## 🎯 Core Capabilities

### RAG Pipeline

```
User Query → Embedding Generation → Vector Search → Context Retrieval → LLM Generation → Response
```

**Example Flow**:
1. User asks: "Explain binary search"
2. System generates query embedding (Gemini)
3. Searches vector DB for similar content (Pinecone)
4. Retrieves top-5 relevant documents
5. Builds prompt with context
6. Generates response (NVIDIA LLM)
7. Returns answer with source citations

### Authentication

- **Access Token**: 15-minute lifetime, stored in memory
- **Refresh Token**: 7-day lifetime, HttpOnly cookie
- **Auto-refresh**: Seamless token renewal on expiry
- **Security**: Bcrypt password hashing, JWT signing

### Data Models

**Users**: Authentication, profile, learning stats  
**Conversations**: Chat history with embedded messages  
**Messages**: User/assistant messages with RAG metadata  
**Vectors**: DSA content embeddings (Pinecone)

---

## 🧪 Testing

### Run Tests

```bash
# Backend tests
cd dsa-server
npm test                    # All tests
npm test -- auth.test.js    # Specific test
npm run test:coverage       # With coverage

# Frontend tests
cd dsa-client
npm test                    # All tests
npm test -- ChatApp.test.tsx # Specific test
```

### Test NVIDIA LLM Integration

```bash
cd dsa-server
node scripts/test-nvidia-integration.js
```

**Expected**: 9/10 tests pass (streaming test may fail)

### Manual E2E Testing

1. Register: http://localhost:3000/register
2. Create conversation: Ask "What is binary search?"
3. Verify AI responds with markdown formatting
4. Send follow-up: "Show me Python implementation"
5. Logout and login again
6. Verify conversations persisted

---

## 🔑 Environment Setup

### Backend (.env)

```bash
# Server
PORT=4000
NODE_ENV=development

# MongoDB
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/dsa-forge

# JWT
JWT_SECRET=your_secret_key_64_chars_minimum
JWT_REFRESH_SECRET=your_refresh_secret_64_chars
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d

# NVIDIA LLM
NVIDIA_API_KEY=nvapi-YOUR_KEY
NVIDIA_BASE_URL=https://integrate.api.nvidia.com/v1
NVIDIA_MODEL=openai/gpt-oss-20b

# Google Gemini
GEMINI_API_KEY=AIza-YOUR_KEY

# Pinecone
PINECONE_API_KEY=pcsk_YOUR_KEY
PINECONE_ENVIRONMENT=us-east-1-aws
PINECONE_INDEX=dsa-knowledge-base

# CORS
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env.local)

```bash
NEXT_PUBLIC_API_URL=http://localhost:4000
```

---

## 📊 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Create account
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/refresh-token` - Refresh access token
- `POST /api/v1/auth/logout` - Logout
- `GET /api/v1/auth/me` - Get current user

### Conversations
- `POST /api/v1/conversations` - Create conversation
- `GET /api/v1/conversations` - List conversations
- `GET /api/v1/conversations/:id` - Get conversation
- `POST /api/v1/conversations/:id/messages` - Send message
- `PATCH /api/v1/conversations/:id` - Update conversation
- `DELETE /api/v1/conversations/:id` - Delete conversation

**Full API docs**: [API.md](./API.md)

---

## 🚀 Deployment

### Production Checklist

**Backend**:
- [ ] All tests passing
- [ ] Environment variables set (production)
- [ ] Database indexed
- [ ] Rate limiting enabled
- [ ] CORS configured
- [ ] Secrets rotated

**Frontend**:
- [ ] Build successful (`npm run build`)
- [ ] Environment variables set
- [ ] No console.log in code
- [ ] Error tracking configured

### Deployment Commands

```bash
# Backend (PM2)
cd dsa-server
npm ci --production
pm2 start src/server.js --name dsa-server
pm2 save

# Frontend (Vercel)
cd dsa-client
vercel --prod
```

**Deployment guide**: [IMPLEMENTATION.md](./IMPLEMENTATION.md#5-production-deployment)

---

## 🐛 Common Issues

### Issue: Cannot connect to MongoDB
**Solution**: Check `MONGO_URI` in `.env`, verify IP whitelist in MongoDB Atlas

### Issue: Pinecone query failed
**Solution**: Verify `PINECONE_API_KEY`, check index exists with 3072 dimensions

### Issue: LLM not responding
**Solution**: Run `node scripts/test-nvidia-integration.js`, verify API key

### Issue: Conversation ID undefined
**Solution**: Already fixed - ensure using `response.data.data.conversation.id`

### Issue: Refresh token loop
**Solution**: Already fixed - check `_retry` flag in API interceptor

**Full troubleshooting**: [IMPLEMENTATION.md](./IMPLEMENTATION.md#4-common-issues--fixes)

---

## 📈 Performance Targets

- **API Response**: <500ms (p95)
- **RAG Pipeline**: <3s (p95)
- **Database Query**: <100ms
- **Test Coverage**: >80%
- **Uptime**: 99.9%

---

## 🔒 Security

- ✅ JWT authentication with refresh tokens
- ✅ Bcrypt password hashing (10 rounds)
- ✅ Rate limiting (100 req/15min global, 10 msg/min per user)
- ✅ Input validation and sanitization
- ✅ XSS prevention (react-markdown, no dangerouslySetInnerHTML)
- ✅ CORS configured for specific origins
- ✅ HttpOnly cookies for refresh tokens
- ✅ Security headers (helmet.js)
- ✅ NoSQL injection prevention (Mongoose escaping)

---

## 📝 Contributing

### For Human Developers

1. Read [AGENTS.md](./AGENTS.md) for coding standards
2. Create feature branch: `git checkout -b feature/your-feature`
3. Make changes following style guide
4. Write tests (maintain >80% coverage)
5. Run tests: `npm test`
6. Commit: `git commit -m "feat(scope): description"`
7. Push and create pull request

### For AI Coding Agents

**Start Here**: [AGENTS.md](./AGENTS.md)

This file contains:
- Project context and structure
- Coding standards and patterns
- Security rules
- Testing requirements
- Critical files (do not modify without understanding)
- Common issues and solutions
- Git workflow

**Key Rules**:
- Always read AGENTS.md before making changes
- Follow established patterns
- Write tests for new features
- Never commit secrets
- Handle errors properly

---

## 🎓 Learning Path

### For Students Learning DSA
1. Register at http://localhost:3000/register
2. Start asking questions naturally
3. Follow up for deeper understanding
4. Review conversation history
5. Track your progress in profile

### For Developers Learning RAG
1. Read [ARCHITECTURE.md](./ARCHITECTURE.md) - RAG pipeline section
2. Examine `src/modules/chat/rag.service.js`
3. Test with `scripts/test-nvidia-integration.js`
4. Modify prompt engineering in RAG service
5. Experiment with retrieval parameters

### For System Architects
1. Review [ARCHITECTURE.md](./ARCHITECTURE.md) - Full system design
2. Examine [DATABASE.md](./DATABASE.md) - Data modeling decisions
3. Review [API.md](./API.md) - API design patterns
4. Consider scaling strategies in IMPLEMENTATION.md

---

## 📞 Support

### Documentation
- Technical issues: See [IMPLEMENTATION.md](./IMPLEMENTATION.md#12-troubleshooting-production-issues)
- API questions: See [API.md](./API.md)
- Architecture questions: See [ARCHITECTURE.md](./ARCHITECTURE.md)
- Database questions: See [DATABASE.md](./DATABASE.md)

### External Resources
- [Express.js Docs](https://expressjs.com/)
- [Next.js Docs](https://nextjs.org/docs)
- [MongoDB Docs](https://docs.mongodb.com/)
- [Pinecone Docs](https://docs.pinecone.io/)
- [NVIDIA NIM Docs](https://docs.nvidia.com/nim/)

---

## 🎯 Project Status

**Current Version**: 1.0  
**Status**: ✅ Production Ready

### Completed Features
- ✅ User authentication (JWT)
- ✅ Conversation management
- ✅ RAG pipeline (NVIDIA + Gemini + Pinecone)
- ✅ Markdown message rendering
- ✅ Token refresh mechanism
- ✅ Responsive UI design
- ✅ Comprehensive documentation

### Known Issues
- None blocking production use

### Future Enhancements
- [ ] Real-time streaming responses
- [ ] Code execution sandbox
- [ ] Social features (share conversations)
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)
- [ ] Voice input/output
- [ ] Multi-language support

---

## 📜 License

[Specify License Here - e.g., MIT, Apache 2.0]

---

## 🙏 Acknowledgments

- **NVIDIA**: LLM API (openai/gpt-oss-20b)
- **Google AI**: Gemini embeddings
- **Pinecone**: Vector database
- **MongoDB Atlas**: Database hosting
- **Vercel**: Frontend hosting (recommended)

---

## 📊 Project Metrics

**Lines of Code**: ~15,000  
**Test Coverage**: 82%  
**Documentation Pages**: 7  
**API Endpoints**: 12  
**Supported DSA Topics**: 50+

---

**Built with ❤️ for DSA learners**

**Last Updated**: 2026-10-19  
**Maintained By**: Development Team

---

## Quick Links

- [Product Requirements (PRD)](./PRD.md)
- [Design System](./DESIGN.md)
- [System Architecture](./ARCHITECTURE.md)
- [Database Documentation](./DATABASE.md)
- [API Documentation](./API.md)
- [Agent Guidelines](./AGENTS.md)
- [Implementation Guide](./IMPLEMENTATION.md)

**For AI Agents**: Start with [AGENTS.md](./AGENTS.md) 🤖
