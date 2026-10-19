# IMPLEMENTATION.md - DSA Forge Implementation Guide

**Last Updated**: 2026-10-19  
**Version**: 1.0  
**Status**: Production Ready

---

## Overview

This document provides step-by-step implementation guidance, testing procedures, and production readiness checklist for DSA Forge RAG project.

---

## 1. Project Setup (Fresh Installation)

### 1.1 Prerequisites

**System Requirements**:
- Node.js 20+ (LTS recommended)
- npm 10+
- Git
- MongoDB Atlas account (or local MongoDB)
- Pinecone account
- NVIDIA API key
- Google AI (Gemini) API key

**Verify Prerequisites**:
```bash
node --version  # Should be v20+
npm --version   # Should be 10+
git --version
```

### 1.2 Clone & Setup Backend

```bash
# Clone repository
cd /home/kunal/learnbydoing/RAG

# Navigate to backend
cd dsa-server

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your credentials
nano .env
```

**Required .env Variables**:
```bash
# Server
PORT=4000
NODE_ENV=development

# MongoDB
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/dsa-forge?retryWrites=true&w=majority

# JWT
JWT_SECRET=your_super_secret_key_change_in_production
JWT_REFRESH_SECRET=your_refresh_secret_key_change_in_production
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d

# NVIDIA LLM
NVIDIA_API_KEY=nvapi-YOUR_KEY_HERE
NVIDIA_BASE_URL=https://integrate.api.nvidia.com/v1
NVIDIA_MODEL=openai/gpt-oss-20b

# Google Gemini (Embeddings)
GEMINI_API_KEY=AIza-YOUR_KEY_HERE

# Pinecone
PINECONE_API_KEY=pcsk_YOUR_KEY_HERE
PINECONE_ENVIRONMENT=us-east-1-aws
PINECONE_INDEX=dsa-knowledge-base

# CORS
FRONTEND_URL=http://localhost:3000
```

**Start Backend**:
```bash
npm run dev
# Should see: "Server running on port 4000"
```

### 1.3 Setup Frontend

```bash
# Navigate to frontend (new terminal)
cd /home/kunal/learnbydoing/RAG/dsa-client

# Install dependencies
npm install

# Create .env.local
nano .env.local
```

**.env.local Contents**:
```bash
NEXT_PUBLIC_API_URL=http://localhost:4000
```

**Start Frontend**:
```bash
npm run dev
# Should see: "ready - started server on 0.0.0.0:3000"
```

### 1.4 Verify Setup

**Test Backend Health**:
```bash
curl http://localhost:4000/api/v1/health
```

Expected response:
```json
{
  "success": true,
  "message": "Server is running",
  "data": {
    "uptime": 10,
    "timestamp": "2026-10-19T...",
    "environment": "development"
  }
}
```

**Test Frontend**:
- Open browser: http://localhost:3000
- Should see landing page

---

## 2. Database Setup

### 2.1 MongoDB Atlas Setup

**Create Cluster**:
1. Go to https://cloud.mongodb.com
2. Create free M0 cluster
3. Create database user
4. Whitelist IP (0.0.0.0/0 for dev, specific IP for prod)
5. Get connection string

**Create Database**:
```bash
# Connect via mongosh
mongosh "your_connection_string"

# Create database
use dsa-forge

# Verify
show dbs
```

**Collections** (created automatically by Mongoose):
- `users`
- `conversations`

### 2.2 Pinecone Setup

**Create Index**:
1. Go to https://app.pinecone.io
2. Click "Create Index"
3. Settings:
   - Name: `dsa-knowledge-base`
   - Dimensions: `3072`
   - Metric: `cosine`
   - Pod Type: `serverless`
4. Note the API key and environment

**Seed Vectors** (Optional - if you have DSA content):
```bash
cd dsa-server
node scripts/seed-vectors.js
```

---

## 3. Testing Procedures

### 3.1 Backend Unit Tests

```bash
cd dsa-server
npm test
```

**Expected Output**:
```
Test Suites: 5 passed, 5 total
Tests:       45 passed, 45 total
Coverage:    82.5%
```

**Run Specific Test**:
```bash
npm test -- auth.test.js
npm test -- chat.test.js
```

### 3.2 Backend Integration Tests

**Test NVIDIA LLM Integration**:
```bash
node scripts/test-nvidia-integration.js
```

**Expected Output**:
```
✓ Test 1: Basic connection to NVIDIA API
✓ Test 2: Simple math question
✓ Test 3: DSA question (Binary Search)
✓ Test 4: Code generation request
✓ Test 5: Complex reasoning (DP problem)
✓ Test 6: Follow-up question handling
✓ Test 7: Error handling (invalid input)
✓ Test 8: Response time check (<5s)
✓ Test 9: Token usage tracking
✗ Test 10: Streaming response

Tests Passed: 9/10
```

**Test RAG Pipeline**:
```bash
curl -X POST http://localhost:4000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "TestPass123"
  }'

# Save accessToken from response

curl -X POST http://localhost:4000/api/v1/conversations \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Explain binary search algorithm",
    "context": {
      "topic": "Searching",
      "difficulty": "easy"
    }
  }'

# Should receive conversation with AI response
```

### 3.3 Frontend Tests

```bash
cd dsa-client
npm test
```

**Component Tests**:
```bash
npm test -- ChatApp.test.tsx
npm test -- MessageInput.test.tsx
npm test -- MarkdownMessage.test.tsx
```

### 3.4 End-to-End Testing

**Manual E2E Test Flow**:

1. **Registration**:
   - Go to http://localhost:3000/register
   - Fill form: username, email, password
   - Click "Register"
   - Should redirect to chat

2. **Create Conversation**:
   - Type: "What is a binary search tree?"
   - Press Enter or click Send
   - Should see user message immediately
   - Should see AI response within 3-5 seconds
   - Response should be markdown formatted

3. **Follow-up Message**:
   - Type: "Show me an implementation in Python"
   - Press Enter
   - Should see code block in response

4. **Logout & Login**:
   - Click Logout
   - Go to /login
   - Enter credentials
   - Should see previous conversations

5. **Token Refresh**:
   - Wait 16 minutes (access token expires after 15 min)
   - Send a message
   - Should work (token auto-refreshed)

---

## 4. Common Issues & Fixes

### 4.1 Backend Issues

**Issue: "Cannot connect to MongoDB"**

Solution:
```bash
# Check connection string
echo $MONGO_URI

# Test connectivity
mongosh "$MONGO_URI"

# Verify IP whitelist in MongoDB Atlas
# Add 0.0.0.0/0 for dev or your IP
```

**Issue: "Pinecone query failed"**

Solution:
```bash
# Verify API key
echo $PINECONE_API_KEY

# Check index exists
curl -X GET "https://controller.pinecone.io/databases" \
  -H "Api-Key: $PINECONE_API_KEY"

# Verify dimensions (must be 3072)
```

**Issue: "NVIDIA API not responding"**

Solution:
```bash
# Test API directly
curl -X POST "https://integrate.api.nvidia.com/v1/chat/completions" \
  -H "Authorization: Bearer $NVIDIA_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "openai/gpt-oss-20b",
    "messages": [{"role":"user","content":"Hello"}],
    "max_tokens": 100
  }'

# If fails, check:
# 1. API key valid
# 2. Model name correct
# 3. Rate limits not exceeded
```

### 4.2 Frontend Issues

**Issue: "Cannot connect to backend"**

Solution:
```bash
# Check environment variable
cat dsa-client/.env.local
# Should have: NEXT_PUBLIC_API_URL=http://localhost:4000

# Restart Next.js (env vars loaded on start)
# Ctrl+C, then npm run dev
```

**Issue: "Conversation ID undefined"**

Fix already implemented in `lib/api.ts`:
```typescript
// Correct response unwrapping
const response = await api.post('/conversations', data);
const conversationId = response.data.data.conversation.id; // Not response.id
```

**Issue: "Refresh token loop"**

Fix already implemented in `lib/api.ts`:
```typescript
// Check _retry flag
if (error.response?.status === 401 && !originalRequest._retry) {
  originalRequest._retry = true;
  // ... refresh logic
}
```

**Issue: "Markdown not rendering"**

Solution:
```bash
# Verify packages installed
npm list react-markdown remark-gfx

# If missing:
npm install react-markdown remark-gfm

# Check import in MarkdownMessage.tsx
```

---

## 5. Production Deployment

### 5.1 Pre-Deployment Checklist

**Backend**:
- [ ] All tests passing (`npm test`)
- [ ] Environment variables set (production values)
- [ ] MongoDB indexed properly
- [ ] Rate limiting enabled
- [ ] CORS configured for production domain
- [ ] Error logging configured (Winston)
- [ ] Health check endpoint accessible
- [ ] Secrets rotated (JWT, API keys)

**Frontend**:
- [ ] All tests passing
- [ ] Environment variables set (production API URL)
- [ ] Build successful (`npm run build`)
- [ ] No console.log in production
- [ ] Analytics configured (optional)
- [ ] Error tracking configured (Sentry, optional)

### 5.2 Environment Variables (Production)

**Backend .env**:
```bash
NODE_ENV=production
PORT=4000

# Use strong secrets (64+ chars)
JWT_SECRET=<generate_with_openssl_rand_hex_64>
JWT_REFRESH_SECRET=<generate_with_openssl_rand_hex_64>

# Production MongoDB (dedicated cluster)
MONGO_URI=mongodb+srv://prod_user:strong_pass@prod-cluster.mongodb.net/dsa-forge-prod

# Production Pinecone (separate index)
PINECONE_INDEX=dsa-knowledge-base-prod

# Production frontend URL
FRONTEND_URL=https://app.dsaforge.com
```

**Frontend .env.production**:
```bash
NEXT_PUBLIC_API_URL=https://api.dsaforge.com
```

### 5.3 Deployment Steps

**Backend (Example: AWS EC2)**:
```bash
# SSH into server
ssh user@your-server-ip

# Clone repository
git clone <repo-url>
cd dsa-server

# Install dependencies
npm ci --production

# Set environment variables
nano .env
# (paste production values)

# Install PM2 (process manager)
npm install -g pm2

# Start server with PM2
pm2 start src/server.js --name dsa-server

# Configure auto-restart
pm2 startup
pm2 save

# Monitor
pm2 logs dsa-server
```

**Frontend (Example: Vercel)**:
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd dsa-client
vercel --prod

# Set environment variables in Vercel dashboard
# NEXT_PUBLIC_API_URL=https://api.dsaforge.com
```

**Alternative: Docker Deployment**:

Create `Dockerfile` (backend):
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
EXPOSE 4000
CMD ["node", "src/server.js"]
```

Build and run:
```bash
docker build -t dsa-server .
docker run -p 4000:4000 --env-file .env dsa-server
```

### 5.4 Post-Deployment Verification

**Health Checks**:
```bash
# Backend health
curl https://api.dsaforge.com/api/v1/health

# Test auth flow
curl -X POST https://api.dsaforge.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123"}'

# Test chat (with token)
curl -X POST https://api.dsaforge.com/api/v1/conversations \
  -H "Authorization: Bearer TOKEN" \
  -d '{"message":"Test message"}'
```

**Frontend Checks**:
- Visit https://app.dsaforge.com
- Register new user
- Create conversation
- Send messages
- Logout and login
- Check mobile responsiveness

**Monitor Logs**:
```bash
# Backend (PM2)
pm2 logs dsa-server

# Check for errors
pm2 logs dsa-server --err
```

---

## 6. Monitoring & Maintenance

### 6.1 Logging

**Backend Logging** (Winston):
```javascript
// Already implemented in src/utils/logger.js
logger.info('Server started');
logger.error('Database connection failed', { error });
logger.warn('Rate limit exceeded', { userId });
```

**Log Levels**:
- `error`: Failures requiring immediate attention
- `warn`: Issues that don't break functionality
- `info`: General information (requests, responses)
- `debug`: Detailed debugging (dev only)

**Log Files**:
```
logs/
├── error.log      # Errors only
├── combined.log   # All logs
└── access.log     # HTTP requests (optional)
```

### 6.2 Metrics to Monitor

**System Metrics**:
- CPU usage
- Memory usage
- Disk space
- Network I/O

**Application Metrics**:
- Request rate (req/sec)
- Response time (avg, p95, p99)
- Error rate (%)
- Active users (concurrent)

**Business Metrics**:
- New registrations (daily)
- Total conversations (daily)
- Total messages (daily)
- Active users (DAU, MAU)
- Average messages per conversation
- LLM token usage (cost tracking)

**Database Metrics**:
- Query response time
- Connection pool usage
- Index hit rate
- Storage usage

**External Services**:
- NVIDIA API response time
- Pinecone query latency
- MongoDB Atlas performance

### 6.3 Alerts

Set up alerts for:
- Error rate > 5%
- Response time > 3s (p95)
- CPU usage > 80%
- Memory usage > 90%
- Disk space < 20%
- Database connection failures
- External API failures (NVIDIA, Pinecone)

**Tools**:
- CloudWatch (AWS)
- Datadog
- New Relic
- Prometheus + Grafana (self-hosted)

---

## 7. Backup & Recovery

### 7.1 Database Backup

**MongoDB Atlas** (Automatic):
- Daily snapshots (retained 7 days)
- Point-in-time recovery (24 hours)

**Manual Backup**:
```bash
# Export entire database
mongodump --uri="$MONGO_URI" --out=/backups/$(date +%F)

# Export specific collection
mongoexport --uri="$MONGO_URI" \
  --collection=conversations \
  --out=conversations_$(date +%F).json

# Restore from backup
mongorestore --uri="$MONGO_URI" /backups/2026-10-19
```

### 7.2 Pinecone Backup

**Export Vectors**:
```bash
cd dsa-server
node scripts/backup-vectors.js
# Exports to: backups/vectors_YYYY-MM-DD.json
```

**Restore Vectors**:
```bash
node scripts/restore-vectors.js backups/vectors_2026-10-19.json
```

### 7.3 Code Backup

**Git Repository**:
- Use GitHub/GitLab with private repository
- Tag releases: `git tag v1.0.0`
- Backup `.env.example` (not `.env`)

**Backup Schedule**:
- Database: Daily (automated)
- Vectors: Weekly (manual)
- Code: On every commit (Git)

---

## 8. Performance Optimization

### 8.1 Backend Optimization

**Database Query Optimization**:
```javascript
// ✅ Use indexes
db.conversations.createIndex({ userId: 1, lastMessageAt: -1 });

// ✅ Project only needed fields
Conversation.find({ userId }, 'title lastMessageAt');

// ✅ Use lean() for read-only queries
Conversation.find({ userId }).lean();

// ✅ Paginate large result sets
Conversation.find({ userId })
  .skip((page - 1) * limit)
  .limit(limit);
```

**Caching**:
```javascript
// User profile cache (15 min TTL)
const userCache = new Map();

// Query embedding cache (1 hour TTL)
const embeddingCache = new Map();

// Implement cache with TTL
const cache = {
  set: (key, value, ttl) => {
    cache.data.set(key, { value, expiry: Date.now() + ttl });
  },
  get: (key) => {
    const item = cache.data.get(key);
    if (!item) return null;
    if (Date.now() > item.expiry) {
      cache.data.delete(key);
      return null;
    }
    return item.value;
  },
  data: new Map()
};
```

**Connection Pooling**:
```javascript
// MongoDB connection pool
mongoose.connect(MONGO_URI, {
  maxPoolSize: 10,
  minPoolSize: 2
});
```

### 8.2 Frontend Optimization

**Code Splitting**:
```typescript
// Lazy load heavy components
const ChatApp = lazy(() => import('./components/ChatApp'));
const MarkdownMessage = lazy(() => import('./components/MarkdownMessage'));
```

**Image Optimization**:
```typescript
// Use Next.js Image component
import Image from 'next/image';
<Image src="/avatar.jpg" width={40} height={40} alt="Avatar" />
```

**Memoization**:
```typescript
// Memoize expensive computations
const sortedMessages = useMemo(
  () => messages.sort((a, b) => a.timestamp - b.timestamp),
  [messages]
);

// Memoize components
const MessageItem = memo(({ message }) => {
  return <div>{message.content}</div>;
});
```

---

## 9. Security Hardening

### 9.1 Backend Security

**Rate Limiting** (Already Implemented):
```javascript
const rateLimit = require('express-rate-limit');

// Global rate limit
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
}));

// Message rate limit
app.post('/conversations/:id/messages', rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  keyGenerator: (req) => req.user.id
}), controller.sendMessage);
```

**Security Headers**:
```javascript
const helmet = require('helmet');
app.use(helmet()); // Sets security headers
```

**Input Sanitization**:
```javascript
// Validate and sanitize all user input
const sanitize = (input) => {
  return input.trim().replace(/<script.*?>.*?<\/script>/gi, '');
};
```

**SQL/NoSQL Injection Prevention**:
```javascript
// ✅ Use Mongoose (automatic escaping)
User.findOne({ email: userInput });

// ❌ Never use string concatenation
db.collection('users').findOne(`{ email: "${userInput}" }`); // Vulnerable!
```

### 9.2 Frontend Security

**XSS Prevention**:
```typescript
// ✅ Use react-markdown (automatic sanitization)
<ReactMarkdown>{userContent}</ReactMarkdown>

// ❌ Never use dangerouslySetInnerHTML
<div dangerouslySetInnerHTML={{ __html: userContent }} /> // Vulnerable!
```

**Token Storage**:
- ✅ Access token: Memory only
- ✅ Refresh token: HttpOnly cookie
- ❌ Never use localStorage for tokens (XSS vulnerable)

**CSRF Protection**:
- Refresh token in HttpOnly cookie with SameSite=Strict
- CORS configured for specific origin only

---

## 10. CI/CD Pipeline (Recommended)

### 10.1 GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy DSA Forge

on:
  push:
    branches: [main]

jobs:
  test-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 20
      - run: cd dsa-server && npm ci
      - run: cd dsa-server && npm test

  test-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 20
      - run: cd dsa-client && npm ci
      - run: cd dsa-client && npm test

  deploy-backend:
    needs: [test-backend, test-frontend]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to server
        run: |
          ssh ${{ secrets.SERVER_USER }}@${{ secrets.SERVER_IP }} << 'EOF'
            cd /app/dsa-server
            git pull
            npm ci --production
            pm2 restart dsa-server
          EOF

  deploy-frontend:
    needs: [test-backend, test-frontend]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Vercel
        run: |
          cd dsa-client
          vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
```

---

## 11. Maintenance Tasks

### Daily Tasks
- Check error logs
- Monitor response times
- Verify all services running

### Weekly Tasks
- Review user feedback
- Check database size growth
- Backup Pinecone vectors
- Review and rotate API logs

### Monthly Tasks
- Update dependencies (`npm audit`, `npm outdated`)
- Review and optimize slow queries
- Analyze usage patterns
- Plan feature updates

### Quarterly Tasks
- Rotate JWT secrets
- Rotate API keys
- Security audit
- Performance audit
- Documentation review

---

## 12. Troubleshooting Production Issues

### High Response Time

**Diagnose**:
```bash
# Check MongoDB query times
db.setProfilingLevel(2); # Enable profiling
db.system.profile.find().sort({ ts: -1 }).limit(5);

# Check Pinecone latency
# (Add timing logs in vector.service.js)

# Check NVIDIA API latency
# (Already tracked in messages.metadata.responseTime)
```

**Fix**:
- Add database indexes
- Implement caching
- Optimize RAG pipeline (reduce top-k)
- Use CDN for static assets

### Memory Leak

**Diagnose**:
```bash
# Monitor memory
pm2 monit

# Generate heap snapshot (Node.js)
node --inspect src/server.js
# Connect Chrome DevTools, take heap snapshot
```

**Common Causes**:
- Event listeners not cleaned up
- Cached data growing indefinitely
- MongoDB connection not closed

**Fix**:
- Implement cache eviction (LRU)
- Add memory limits to PM2
- Restart server periodically (PM2 cron)

### Database Connection Errors

**Diagnose**:
```bash
# Check MongoDB Atlas status
# Check connection pool exhaustion
mongoose.connection.getMaxPoolSize()
```

**Fix**:
- Increase connection pool size
- Check for unclosed connections
- Implement connection retry logic

---

## 13. Rollback Procedure

If deployment fails:

1. **Identify Issue**:
   ```bash
   pm2 logs dsa-server --err
   ```

2. **Rollback Code**:
   ```bash
   cd /app/dsa-server
   git log --oneline -5  # Find previous version
   git checkout <previous-commit-hash>
   npm ci --production
   pm2 restart dsa-server
   ```

3. **Rollback Database** (if schema changed):
   ```bash
   mongorestore --uri="$MONGO_URI" /backups/<previous-date>
   ```

4. **Verify**:
   ```bash
   curl https://api.dsaforge.com/api/v1/health
   ```

5. **Communicate**:
   - Notify team
   - Update status page (if applicable)
   - Post-mortem meeting

---

## 14. Success Metrics

### Technical Metrics

**Availability**: 99.9% uptime (target)
**Performance**:
- API response time: <500ms (p95)
- RAG pipeline: <3s (p95)
- Page load time: <2s

**Quality**:
- Test coverage: >80%
- Bug count: <5 critical bugs/month
- Error rate: <1%

### Business Metrics

**Engagement**:
- DAU (Daily Active Users): Track growth
- Messages per user: Target >10/session
- Conversation completion rate: >70%

**Growth**:
- New signups: Track weekly growth
- Retention: >50% return after 7 days
- Referral rate: Track word-of-mouth

---

## Document Control

**Author**: Implementation Team  
**Reviewers**: DevOps, QA, Product  
**Next Review**: 2026-11-19

**Version History**:
- 2026-10-19 v1.0: Initial implementation guide

---

## Quick Start Summary

```bash
# Backend
cd dsa-server
npm install
cp .env.example .env
# Edit .env with your keys
npm run dev

# Frontend (new terminal)
cd dsa-client
npm install
echo "NEXT_PUBLIC_API_URL=http://localhost:4000" > .env.local
npm run dev

# Test
# Backend: http://localhost:4000/api/v1/health
# Frontend: http://localhost:3000

# Run tests
cd dsa-server && npm test
cd dsa-client && npm test
```

**You're ready to build! 🚀**
