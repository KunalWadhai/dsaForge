# DATABASE.md - DSA Forge RAG Project

**Last Updated**: 2026-10-19  
**Version**: 1.0  
**Status**: Implementation Complete

---

## Overview

DSA Forge uses **MongoDB Atlas** as the primary database with **Pinecone** as the vector database for semantic search. This document details all schemas, relationships, indexes, and data management strategies.

### Technology Stack
- **Primary Database**: MongoDB Atlas (Cloud-hosted)
- **ODM**: Mongoose 8.x
- **Vector Database**: Pinecone (Serverless)
- **Embeddings**: Google Gemini (gemini-embedding-001, 3072 dimensions)
- **Caching**: In-memory (Node.js Map objects)

---

## 1. MongoDB Collections

### 1.1 Users Collection

**Purpose**: Store user accounts, credentials, and profile information.

```javascript
// Schema: /home/kunal/learnbydoing/RAG/dsa-server/src/modules/auth/user.model.js

{
  _id: ObjectId,
  username: String,        // Unique, required, 3-30 chars
  email: String,           // Unique, required, validated
  password: String,        // Bcrypt hashed, required
  role: String,            // Enum: ['student', 'admin'], default: 'student'
  profile: {
    fullName: String,
    avatar: String,        // URL to profile picture
    bio: String,
    learningGoals: [String],
    skillLevel: String     // Enum: ['beginner', 'intermediate', 'advanced']
  },
  preferences: {
    theme: String,         // 'light' | 'dark'
    notifications: Boolean,
    language: String       // Default: 'en'
  },
  stats: {
    totalConversations: Number,  // Default: 0
    totalQuestions: Number,       // Default: 0
    topicsExplored: [String],
    lastActive: Date
  },
  refreshToken: String,    // Current valid refresh token
  createdAt: Date,         // Auto-generated
  updatedAt: Date          // Auto-updated
}
```

**Indexes**:
```javascript
// Unique indexes
{ username: 1 }  // Unique
{ email: 1 }     // Unique

// Query optimization
{ 'stats.lastActive': -1 }  // Recent users query
{ role: 1, createdAt: -1 }  // Admin queries
```

**Validations**:
- Email: RFC 5322 compliant
- Password: Min 8 chars (enforced at API level, stored hashed)
- Username: Alphanumeric + underscore, 3-30 chars
- Role: Only 'student' or 'admin'

---

### 1.2 Conversations Collection

**Purpose**: Store chat conversations with embedded messages (denormalized for performance).

```javascript
// Schema: /home/kunal/learnbydoing/RAG/dsa-server/src/modules/chat/conversation.model.js

{
  _id: ObjectId,
  userId: ObjectId,        // Ref: 'User', required, indexed
  title: String,           // Auto-generated from first message, max 100 chars
  context: {
    topic: String,         // e.g., 'Binary Search', 'Dynamic Programming'
    difficulty: String,    // 'easy' | 'medium' | 'hard'
    tags: [String],        // e.g., ['arrays', 'recursion']
    problemId: String      // Optional: LeetCode/external problem reference
  },
  messages: [              // Embedded messages array
    {
      _id: ObjectId,       // Message ID
      role: String,        // 'user' | 'assistant' | 'system'
      content: String,     // Message text (markdown supported)
      metadata: {
        retrievedDocs: [   // RAG context used for this response
          {
            docId: String,       // Pinecone vector ID
            title: String,       // Document title
            similarity: Number,  // Cosine similarity score
            source: String,      // 'leetcode' | 'geeksforgeeks' | 'custom'
            snippet: String      // Relevant text excerpt
          }
        ],
        reasoning: String,       // LLM reasoning (if available)
        tokensUsed: Number,      // LLM tokens consumed
        responseTime: Number     // MS to generate response
      },
      timestamp: Date      // Message creation time
    }
  ],
  stats: {
    messageCount: Number,  // Total messages in conversation
    userMessages: Number,  // User message count
    avgResponseTime: Number, // Average LLM response time (ms)
    totalTokens: Number    // Total tokens used
  },
  status: String,          // 'active' | 'archived' | 'deleted'
  lastMessageAt: Date,     // Last activity timestamp
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:
```javascript
// Primary queries
{ userId: 1, lastMessageAt: -1 }  // User's recent conversations
{ userId: 1, status: 1 }          // Active/archived filtering

// Search and analytics
{ 'context.topic': 1 }            // Topic-based queries
{ 'context.tags': 1 }             // Tag-based filtering
{ createdAt: -1 }                 // Recent conversations (admin)
{ 'messages.timestamp': -1 }      // Message timeline queries
```

**Data Management**:
- **Embedded Messages**: Messages stored as subdocuments for atomic updates and performance
- **Message Limit**: Soft limit of 100 messages per conversation (UI pagination)
- **Archival**: Conversations inactive for 90 days auto-archived
- **Deletion**: Soft delete (status='deleted'), hard delete after 30 days

---

### 1.3 Sessions Collection (Optional - Not Currently Implemented)

**Purpose**: Store active user sessions for distributed session management (future enhancement).

```javascript
// Future schema if implementing Redis-backed sessions

{
  _id: ObjectId,
  userId: ObjectId,      // Ref: 'User'
  sessionToken: String,  // Unique session identifier
  data: Mixed,           // Session data (flexible)
  ipAddress: String,
  userAgent: String,
  expiresAt: Date,       // TTL for auto-cleanup
  createdAt: Date
}
```

**Current Implementation**: 
- Using JWT-based stateless auth (access token in memory, refresh token in HttpOnly cookie)
- No session collection needed unless scaling to multi-server setup with shared state

---

## 2. Pinecone Vector Database

### 2.1 Index Configuration

**Index Name**: `dsa-knowledge-base` (or environment-specific)

```javascript
// Configuration
{
  dimension: 3072,              // Gemini embedding dimensions
  metric: 'cosine',            // Similarity metric
  cloud: 'aws',                // or 'gcp', 'azure'
  region: 'us-east-1',         // Deployment region
  pod_type: 'serverless'       // Serverless or pod-based
}
```

### 2.2 Vector Metadata Schema

Each vector in Pinecone stores:

```javascript
{
  id: String,                  // Unique document ID (UUID or slug)
  values: [Float],             // 3072-dim embedding vector
  metadata: {
    title: String,             // Document title
    content: String,           // Full text (max 40KB)
    category: String,          // 'data-structures' | 'algorithms' | 'concepts'
    topic: String,             // Specific topic (e.g., 'Binary Search Trees')
    difficulty: String,        // 'easy' | 'medium' | 'hard'
    tags: [String],            // Searchable tags
    source: String,            // 'leetcode' | 'geeksforgeeks' | 'custom'
    sourceUrl: String,         // Original URL
    language: String,          // Programming language (if code example)
    problemId: String,         // LeetCode/external problem ID
    timeComplexity: String,    // e.g., 'O(n log n)'
    spaceComplexity: String,   // e.g., 'O(n)'
    createdAt: Number,         // Unix timestamp
    updatedAt: Number,         // Unix timestamp
    version: Number            // Document version for updates
  }
}
```

### 2.3 Query Patterns

**Semantic Search**:
```javascript
// Top-k similarity search
await index.query({
  vector: embeddingVector,      // 3072-dim query embedding
  topK: 5,                       // Number of results
  includeMetadata: true,
  filter: {                      // Metadata filtering
    category: 'algorithms',
    difficulty: { $in: ['easy', 'medium'] }
  }
});
```

**Hybrid Search** (Semantic + Keyword):
```javascript
// Combine vector similarity with metadata filtering
await index.query({
  vector: embeddingVector,
  topK: 10,
  filter: {
    tags: { $in: ['dynamic-programming', 'memoization'] },
    difficulty: 'hard'
  }
});
```

---

## 3. Data Relationships

### 3.1 Entity Relationship Diagram

```
┌─────────────┐
│    Users    │
│   (MongoDB) │
└──────┬──────┘
       │ 1
       │
       │ N
┌──────▼──────────┐
│ Conversations   │
│   (MongoDB)     │
│                 │
│  ┌───────────┐  │
│  │ Messages  │  │  (Embedded)
│  │  Array    │  │
│  └───────────┘  │
└─────────────────┘

┌─────────────────┐
│ Vector Embeddings│
│   (Pinecone)    │
│                 │
│ - DSA Content   │
│ - Code Examples │
│ - Explanations  │
└─────────────────┘
     ▲
     │ (Retrieved during RAG)
     │
     └─ Referenced in messages.metadata.retrievedDocs
```

### 3.2 Relationship Details

**User → Conversations**: One-to-Many
- One user can have multiple conversations
- Conversations cannot exist without a user
- Cascade delete: When user deleted, all conversations deleted

**Conversation → Messages**: One-to-Many (Embedded)
- Messages embedded in conversation document
- No separate messages collection (denormalized for performance)
- Atomic updates using Mongoose array operations

**Messages ↔ Pinecone Vectors**: Loose Coupling
- Messages store references to retrieved documents in `metadata.retrievedDocs`
- Pinecone vectors exist independently
- No foreign key constraints (different databases)

---

## 4. Data Access Patterns

### 4.1 Read Operations

**Get User Conversations** (Most Frequent):
```javascript
// Optimized with index: { userId: 1, lastMessageAt: -1 }
Conversation.find({ userId, status: 'active' })
  .sort({ lastMessageAt: -1 })
  .limit(20)
  .select('title context lastMessageAt stats');
```

**Get Conversation with Messages**:
```javascript
// Single document fetch (messages embedded)
Conversation.findById(conversationId)
  .populate('userId', 'username email profile');
```

**Vector Search** (RAG Pipeline):
```javascript
// 1. Generate query embedding
const queryEmbedding = await geminiService.generateEmbedding(query);

// 2. Search Pinecone
const results = await pineconeIndex.query({
  vector: queryEmbedding,
  topK: 5,
  includeMetadata: true,
  filter: { difficulty: userLevel }
});

// 3. Store references in message metadata
message.metadata.retrievedDocs = results.matches.map(m => ({
  docId: m.id,
  title: m.metadata.title,
  similarity: m.score,
  snippet: m.metadata.content.substring(0, 200)
}));
```

### 4.2 Write Operations

**Create Conversation**:
```javascript
// Atomic creation with first message
const conversation = await Conversation.create({
  userId,
  title: extractTitle(firstMessage),
  messages: [{
    role: 'user',
    content: firstMessage,
    timestamp: new Date()
  }],
  status: 'active'
});
```

**Add Message to Conversation**:
```javascript
// Atomic array push with stats update
await Conversation.findByIdAndUpdate(
  conversationId,
  {
    $push: { messages: newMessage },
    $set: { lastMessageAt: new Date() },
    $inc: { 'stats.messageCount': 1, 'stats.totalTokens': tokensUsed }
  },
  { new: true }
);
```

**Update User Stats**:
```javascript
// Increment conversation/question counts
await User.findByIdAndUpdate(
  userId,
  {
    $inc: { 'stats.totalQuestions': 1 },
    $set: { 'stats.lastActive': new Date() },
    $addToSet: { 'stats.topicsExplored': topic }
  }
);
```

---

## 5. Indexing Strategy

### 5.1 MongoDB Indexes

**Performance Indexes**:
```javascript
// Conversations collection
db.conversations.createIndex({ userId: 1, lastMessageAt: -1 });
db.conversations.createIndex({ userId: 1, status: 1 });
db.conversations.createIndex({ 'context.topic': 1 });
db.conversations.createIndex({ 'context.tags': 1 });

// Users collection
db.users.createIndex({ username: 1 }, { unique: true });
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ refreshToken: 1 }, { sparse: true });
```

**Index Usage Monitoring**:
```javascript
// Check index usage in MongoDB Atlas
db.conversations.aggregate([
  { $indexStats: {} }
]);
```

### 5.2 Pinecone Index Optimization

**Namespace Strategy** (Future):
```javascript
// Separate namespaces for different content types
{
  'algorithms': { /* algorithm vectors */ },
  'data-structures': { /* DS vectors */ },
  'code-examples': { /* code vectors */ }
}
```

**Metadata Filtering**:
- Index all filterable fields in metadata
- Keep metadata under 40KB per vector
- Use selective metadata for large documents

---

## 6. Data Validation

### 6.1 Schema Validation (Mongoose)

**User Schema Validations**:
```javascript
username: {
  type: String,
  required: true,
  unique: true,
  trim: true,
  minlength: 3,
  maxlength: 30,
  match: /^[a-zA-Z0-9_]+$/
}

email: {
  type: String,
  required: true,
  unique: true,
  lowercase: true,
  match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
}
```

**Conversation Schema Validations**:
```javascript
messages: [{
  role: {
    type: String,
    enum: ['user', 'assistant', 'system'],
    required: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 10000  // 10K chars per message
  }
}]
```

### 6.2 Application-Level Validation

**Input Sanitization**:
- Strip HTML tags from user input (XSS prevention)
- Validate ObjectId formats before queries
- Sanitize search queries for Pinecone

**Business Logic Validation**:
- Max 100 messages per conversation
- Max 50 conversations per user (student role)
- Message content length: 1-10,000 chars

---

## 7. Data Migration & Seeding

### 7.1 Initial Data Seeding

**DSA Knowledge Base** (Pinecone):
```javascript
// Seed script location: /scripts/seed-vectors.js
// Data source: /data/dsa-content/*.json

// Example seed process:
1. Load DSA content from JSON files
2. Generate embeddings using Gemini
3. Batch upsert to Pinecone (100 vectors at a time)
4. Verify insertion with metadata queries
```

**Sample Content Structure**:
```json
{
  "id": "binary-search-intro",
  "title": "Binary Search Algorithm",
  "content": "Binary search is an efficient algorithm...",
  "category": "algorithms",
  "topic": "Searching",
  "difficulty": "easy",
  "tags": ["binary-search", "divide-and-conquer"],
  "timeComplexity": "O(log n)",
  "codeExample": "function binarySearch(arr, target) { ... }"
}
```

### 7.2 Migration Scripts

**Database Version Management**:
```javascript
// Location: /scripts/migrations/

// Example: 001-add-user-stats.js
module.exports = {
  async up(db) {
    await db.collection('users').updateMany(
      {},
      {
        $set: {
          'stats.totalConversations': 0,
          'stats.totalQuestions': 0,
          'stats.topicsExplored': []
        }
      }
    );
  },
  
  async down(db) {
    await db.collection('users').updateMany(
      {},
      { $unset: { stats: 1 } }
    );
  }
};
```

---

## 8. Backup & Recovery

### 8.1 MongoDB Backup Strategy

**Automated Backups** (MongoDB Atlas):
- **Frequency**: Daily snapshots (retained 7 days)
- **Point-in-Time Recovery**: Enabled (last 24 hours)
- **Backup Location**: AWS S3 (same region as cluster)

**Manual Backups**:
```bash
# Export conversations for specific user
mongoexport --uri="mongodb+srv://..." \
  --collection=conversations \
  --query='{"userId": ObjectId("...")}' \
  --out=user_conversations.json

# Full database dump
mongodump --uri="mongodb+srv://..." --out=/backups/$(date +%F)
```

### 8.2 Pinecone Backup

**Vector Export**:
```javascript
// Fetch all vectors in batches
const allVectors = [];
let paginationToken = null;

do {
  const response = await index.query({
    vector: dummyVector,
    topK: 1000,
    includeMetadata: true,
    paginationToken
  });
  
  allVectors.push(...response.matches);
  paginationToken = response.paginationToken;
} while (paginationToken);

// Save to JSON
fs.writeFileSync('vectors-backup.json', JSON.stringify(allVectors));
```

---

## 9. Performance Optimization

### 9.1 Query Optimization

**Conversation List Query** (N+1 Prevention):
```javascript
// Bad: N+1 queries
const conversations = await Conversation.find({ userId });
for (const conv of conversations) {
  conv.user = await User.findById(conv.userId);  // N queries
}

// Good: Single populate
const conversations = await Conversation
  .find({ userId })
  .populate('userId', 'username profile.avatar');  // 1 query
```

**Message Pagination**:
```javascript
// Return only recent messages, load more on demand
Conversation.findById(id, {
  messages: { $slice: -20 }  // Last 20 messages
});
```

### 9.2 Caching Strategy

**In-Memory Caching**:
```javascript
// User profile cache (15 min TTL)
const userCache = new Map();

async function getCachedUser(userId) {
  const cached = userCache.get(userId);
  if (cached && Date.now() - cached.timestamp < 900000) {
    return cached.user;
  }
  
  const user = await User.findById(userId);
  userCache.set(userId, { user, timestamp: Date.now() });
  return user;
}
```

**Vector Search Cache**:
- Cache frequent query embeddings (e.g., "binary search tutorial")
- TTL: 1 hour
- Max size: 1000 entries (LRU eviction)

### 9.3 Connection Pooling

**MongoDB Connection**:
```javascript
mongoose.connect(MONGO_URI, {
  maxPoolSize: 10,      // Max simultaneous connections
  minPoolSize: 2,       // Min connections to maintain
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000
});
```

**Pinecone Connection**:
```javascript
// Pinecone client reuse (singleton)
const pineconeClient = new Pinecone({ apiKey });
// Client automatically manages connection pooling
```

---

## 10. Security Considerations

### 10.1 Data Encryption

**At Rest**:
- MongoDB Atlas: Encrypted volumes (AES-256)
- Pinecone: Encrypted storage (provider-managed)

**In Transit**:
- MongoDB: TLS 1.2+ required
- Pinecone API: HTTPS only
- Internal services: HTTPS enforced

### 10.2 Access Control

**MongoDB**:
```javascript
// Application user (limited permissions)
{
  role: 'readWrite',
  db: 'dsa-forge',
  privileges: [
    { resource: { db: 'dsa-forge', collection: '' }, actions: ['find', 'insert', 'update'] }
  ]
}

// Admin user (full access)
{
  role: 'dbAdmin',
  db: 'dsa-forge'
}
```

**Pinecone**:
- API key rotation: Every 90 days
- Separate keys for dev/staging/prod
- Key stored in environment variables (never in code)

### 10.3 PII Handling

**User Data**:
- Passwords: Bcrypt hashed (10 rounds)
- Email: Stored in plaintext (searchable), never shared with LLM
- Profile data: User-controlled, optional fields

**Conversation Data**:
- User queries: Stored in plaintext (for RAG context)
- No automatic PII detection (future enhancement)
- User can delete conversations (right to be forgotten)

---

## 11. Monitoring & Analytics

### 11.1 Database Metrics

**MongoDB Atlas Monitoring**:
- Query performance (slow query log > 100ms)
- Connection pool usage
- Index hit rate (target: >95%)
- Storage growth (weekly trends)

**Custom Application Metrics**:
```javascript
// Track in messages metadata
{
  avgResponseTime: 2400,     // ms
  tokensUsed: 850,
  retrievedDocsCount: 5,
  cacheHitRate: 0.73
}
```

### 11.2 Analytics Queries

**User Engagement**:
```javascript
// Most active users
db.users.find().sort({ 'stats.totalQuestions': -1 }).limit(10);

// Popular topics
db.conversations.aggregate([
  { $unwind: '$context.tags' },
  { $group: { _id: '$context.tags', count: { $sum: 1 } } },
  { $sort: { count: -1 } }
]);
```

**System Performance**:
```javascript
// Average RAG response times
db.conversations.aggregate([
  { $unwind: '$messages' },
  { $match: { 'messages.role': 'assistant' } },
  { $group: {
    _id: null,
    avgResponseTime: { $avg: '$messages.metadata.responseTime' }
  }}
]);
```

---

## 12. Future Enhancements

### 12.1 Planned Database Changes

**Conversation Search**:
- Full-text search index on conversation messages
- Elasticsearch integration for advanced search

**User Activity Tracking**:
- Separate `user_activities` collection for detailed analytics
- Track page views, feature usage, search queries

**Collaborative Features**:
- Shared conversations (many-to-many User-Conversation)
- Comments/annotations on conversations

### 12.2 Scaling Considerations

**Sharding Strategy** (if >10M documents):
- Shard key: `userId` (user data isolated)
- Zone-based sharding for geographic distribution

**Read Replicas**:
- Dedicated replica for analytics queries
- Eventual consistency acceptable for non-critical reads

**Vector Database Scaling**:
- Pinecone auto-scales (serverless)
- Consider namespaces for multi-tenant isolation

---

## Appendix A: Connection Strings

### Development
```bash
MONGO_URI=mongodb://localhost:27017/dsa-forge-dev
PINECONE_ENVIRONMENT=us-east-1-aws
```

### Production
```bash
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/dsa-forge?retryWrites=true&w=majority
PINECONE_ENVIRONMENT=us-east-1-aws
PINECONE_INDEX=dsa-knowledge-base-prod
```

---

## Appendix B: Data Size Estimates

**Current Implementation**:
- Users: ~100 documents (avg 2KB each) = 200KB
- Conversations: ~500 documents (avg 50KB each) = 25MB
- Pinecone vectors: ~1000 vectors (3072 dims + 5KB metadata) = ~17MB

**Projected Growth (1 Year)**:
- Users: 10,000 (20MB)
- Conversations: 100,000 (5GB)
- Pinecone vectors: 50,000 (850MB)

**Storage Requirements**:
- MongoDB: 10GB (includes indexes and overhead)
- Pinecone: 1GB (vector storage only)

---

## Document Control

**Author**: System Architect  
**Reviewers**: Backend Team, DevOps  
**Next Review**: 2026-11-19 (1 month)

**Change Log**:
- 2026-10-19: Initial database design documentation
- Future: Add sharding strategy when scaling beyond 10M docs
