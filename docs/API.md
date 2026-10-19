# API.md - DSA Forge RAG Project

**Last Updated**: 2026-10-19  
**Version**: 1.0  
**Status**: Implementation Complete

---

## Overview

DSA Forge backend API is a RESTful service built with Express.js, providing authentication, conversation management, and RAG-powered chat capabilities.

### Base Configuration
- **Base URL**: `http://localhost:4000` (dev) | `https://api.dsaforge.com` (prod)
- **API Version**: `v1`
- **API Prefix**: `/api/v1`
- **Content Type**: `application/json`
- **Authentication**: JWT (Bearer tokens)

---

## 1. Authentication

### 1.1 Register User

**Endpoint**: `POST /api/v1/auth/register`

**Description**: Create a new user account.

**Request**:
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Validation**:
- `username`: 3-30 chars, alphanumeric + underscore
- `email`: Valid email format
- `password`: Min 8 chars

**Response** (201 Created):
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "username": "john_doe",
      "email": "john@example.com",
      "role": "student",
      "profile": {
        "fullName": "",
        "avatar": "",
        "skillLevel": "beginner"
      },
      "createdAt": "2026-10-19T10:30:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Set-Cookie Header**:
```
refreshToken=eyJhbGc...; HttpOnly; Secure; SameSite=Strict; Max-Age=604800; Path=/api/v1/auth
```

**Errors**:
- `400`: Validation failed (missing fields, invalid format)
- `409`: Username or email already exists

---

### 1.2 Login

**Endpoint**: `POST /api/v1/auth/login`

**Description**: Authenticate user and receive tokens.

**Request**:
```json
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "username": "john_doe",
      "email": "john@example.com",
      "role": "student",
      "profile": {
        "fullName": "John Doe",
        "avatar": "https://avatar.url/john.jpg",
        "skillLevel": "intermediate"
      },
      "stats": {
        "totalConversations": 15,
        "totalQuestions": 87,
        "topicsExplored": ["arrays", "trees", "dynamic-programming"]
      }
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Set-Cookie Header**: Same as register

**Errors**:
- `400`: Missing email or password
- `401`: Invalid credentials
- `404`: User not found

---

### 1.3 Refresh Token

**Endpoint**: `POST /api/v1/auth/refresh-token`

**Description**: Get new access token using refresh token from cookie.

**Headers**:
```
Cookie: refreshToken=eyJhbGc...
```

**Request Body**: None required (token read from cookie)

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Errors**:
- `401`: No refresh token provided
- `403`: Invalid or expired refresh token

**Implementation Note**: Frontend should call this endpoint when receiving 401 from protected routes.

---

### 1.4 Logout

**Endpoint**: `POST /api/v1/auth/logout`

**Description**: Invalidate refresh token and clear cookie.

**Headers**:
```
Authorization: Bearer <accessToken>
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Logout successful"
}
```

**Set-Cookie Header** (clears cookie):
```
refreshToken=; HttpOnly; Secure; SameSite=Strict; Max-Age=0; Path=/api/v1/auth
```

---

### 1.5 Get Current User

**Endpoint**: `GET /api/v1/auth/me`

**Description**: Get authenticated user's profile.

**Headers**:
```
Authorization: Bearer <accessToken>
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "username": "john_doe",
      "email": "john@example.com",
      "role": "student",
      "profile": {
        "fullName": "John Doe",
        "avatar": "https://avatar.url/john.jpg",
        "bio": "CS student learning algorithms",
        "skillLevel": "intermediate",
        "learningGoals": ["Master DP", "Understand graph algorithms"]
      },
      "preferences": {
        "theme": "dark",
        "notifications": true,
        "language": "en"
      },
      "stats": {
        "totalConversations": 15,
        "totalQuestions": 87,
        "topicsExplored": ["arrays", "trees", "dynamic-programming"],
        "lastActive": "2026-10-19T15:45:00.000Z"
      },
      "createdAt": "2026-09-01T08:00:00.000Z"
    }
  }
}
```

**Errors**:
- `401`: No token or invalid token

---

## 2. Conversations

### 2.1 Create Conversation

**Endpoint**: `POST /api/v1/conversations`

**Description**: Start a new conversation with an initial message.

**Headers**:
```
Authorization: Bearer <accessToken>
Content-Type: application/json
```

**Request**:
```json
{
  "message": "Explain binary search algorithm",
  "context": {
    "topic": "Searching",
    "difficulty": "easy",
    "tags": ["binary-search", "arrays"]
  }
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "message": "Conversation created successfully",
  "data": {
    "conversation": {
      "id": "507f191e810c19729de860ea",
      "userId": "507f1f77bcf86cd799439011",
      "title": "Explain binary search algorithm",
      "context": {
        "topic": "Searching",
        "difficulty": "easy",
        "tags": ["binary-search", "arrays"]
      },
      "messages": [
        {
          "id": "507f191e810c19729de860eb",
          "role": "user",
          "content": "Explain binary search algorithm",
          "timestamp": "2026-10-19T16:00:00.000Z"
        }
      ],
      "stats": {
        "messageCount": 1,
        "userMessages": 1,
        "avgResponseTime": 0,
        "totalTokens": 0
      },
      "status": "active",
      "lastMessageAt": "2026-10-19T16:00:00.000Z",
      "createdAt": "2026-10-19T16:00:00.000Z"
    }
  }
}
```

**Errors**:
- `400`: Missing message content
- `401`: Unauthorized

---

### 2.2 Get All Conversations

**Endpoint**: `GET /api/v1/conversations`

**Description**: Retrieve user's conversations with pagination.

**Headers**:
```
Authorization: Bearer <accessToken>
```

**Query Parameters**:
- `page` (optional): Page number, default: 1
- `limit` (optional): Items per page, default: 20, max: 100
- `status` (optional): Filter by status ('active' | 'archived')
- `topic` (optional): Filter by context.topic

**Example**: `GET /api/v1/conversations?page=1&limit=10&status=active`

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "conversations": [
      {
        "id": "507f191e810c19729de860ea",
        "title": "Binary search explanation",
        "context": {
          "topic": "Searching",
          "difficulty": "easy",
          "tags": ["binary-search"]
        },
        "lastMessageAt": "2026-10-19T16:05:00.000Z",
        "messageCount": 5,
        "status": "active",
        "createdAt": "2026-10-19T16:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalItems": 25,
      "itemsPerPage": 10
    }
  }
}
```

**Errors**:
- `401`: Unauthorized

---

### 2.3 Get Single Conversation

**Endpoint**: `GET /api/v1/conversations/:id`

**Description**: Retrieve full conversation with all messages.

**Headers**:
```
Authorization: Bearer <accessToken>
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "conversation": {
      "id": "507f191e810c19729de860ea",
      "userId": "507f1f77bcf86cd799439011",
      "title": "Binary search explanation",
      "context": {
        "topic": "Searching",
        "difficulty": "easy",
        "tags": ["binary-search", "arrays"]
      },
      "messages": [
        {
          "id": "507f191e810c19729de860eb",
          "role": "user",
          "content": "Explain binary search algorithm",
          "timestamp": "2026-10-19T16:00:00.000Z"
        },
        {
          "id": "507f191e810c19729de860ec",
          "role": "assistant",
          "content": "Binary search is an efficient algorithm for finding an item...",
          "metadata": {
            "retrievedDocs": [
              {
                "docId": "binary-search-intro",
                "title": "Binary Search Algorithm",
                "similarity": 0.92,
                "source": "custom",
                "snippet": "Binary search works by repeatedly dividing..."
              }
            ],
            "tokensUsed": 450,
            "responseTime": 2400
          },
          "timestamp": "2026-10-19T16:00:03.000Z"
        }
      ],
      "stats": {
        "messageCount": 2,
        "userMessages": 1,
        "avgResponseTime": 2400,
        "totalTokens": 450
      },
      "status": "active",
      "lastMessageAt": "2026-10-19T16:00:03.000Z",
      "createdAt": "2026-10-19T16:00:00.000Z"
    }
  }
}
```

**Errors**:
- `401`: Unauthorized
- `403`: Forbidden (not user's conversation)
- `404`: Conversation not found

---

### 2.4 Send Message

**Endpoint**: `POST /api/v1/conversations/:id/messages`

**Description**: Add a message to conversation and get AI response.

**Headers**:
```
Authorization: Bearer <accessToken>
Content-Type: application/json
```

**Request**:
```json
{
  "message": "What's the time complexity?"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "message": "Message sent successfully",
  "data": {
    "userMessage": {
      "id": "507f191e810c19729de860ed",
      "role": "user",
      "content": "What's the time complexity?",
      "timestamp": "2026-10-19T16:05:00.000Z"
    },
    "assistantMessage": {
      "id": "507f191e810c19729de860ee",
      "role": "assistant",
      "content": "The time complexity of binary search is **O(log n)**...",
      "metadata": {
        "retrievedDocs": [
          {
            "docId": "binary-search-complexity",
            "title": "Binary Search Time Complexity",
            "similarity": 0.89,
            "source": "custom",
            "snippet": "Binary search has logarithmic time complexity..."
          }
        ],
        "reasoning": "User is asking about complexity analysis...",
        "tokensUsed": 380,
        "responseTime": 2100
      },
      "timestamp": "2026-10-19T16:05:02.000Z"
    }
  }
}
```

**Errors**:
- `400`: Empty message
- `401`: Unauthorized
- `403`: Forbidden (not user's conversation)
- `404`: Conversation not found
- `500`: RAG pipeline error

**Processing Flow**:
1. Validate message content
2. Add user message to conversation
3. Generate embedding for user query
4. Search Pinecone for relevant context (top 5)
5. Build prompt with retrieved context
6. Call NVIDIA LLM API
7. Store assistant response with metadata
8. Update conversation stats
9. Return both messages

---

### 2.5 Update Conversation

**Endpoint**: `PATCH /api/v1/conversations/:id`

**Description**: Update conversation metadata (title, tags, status).

**Headers**:
```
Authorization: Bearer <accessToken>
Content-Type: application/json
```

**Request**:
```json
{
  "title": "Binary Search Deep Dive",
  "context": {
    "tags": ["binary-search", "arrays", "divide-and-conquer"]
  },
  "status": "archived"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Conversation updated successfully",
  "data": {
    "conversation": {
      "id": "507f191e810c19729de860ea",
      "title": "Binary Search Deep Dive",
      "context": {
        "topic": "Searching",
        "difficulty": "easy",
        "tags": ["binary-search", "arrays", "divide-and-conquer"]
      },
      "status": "archived",
      "updatedAt": "2026-10-19T16:10:00.000Z"
    }
  }
}
```

**Errors**:
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not found

---

### 2.6 Delete Conversation

**Endpoint**: `DELETE /api/v1/conversations/:id`

**Description**: Soft delete conversation (status = 'deleted').

**Headers**:
```
Authorization: Bearer <accessToken>
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Conversation deleted successfully"
}
```

**Errors**:
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not found

---

## 3. User Profile

### 3.1 Update Profile

**Endpoint**: `PATCH /api/v1/users/profile`

**Description**: Update user profile information.

**Headers**:
```
Authorization: Bearer <accessToken>
Content-Type: application/json
```

**Request**:
```json
{
  "profile": {
    "fullName": "John Doe",
    "bio": "Computer Science student passionate about algorithms",
    "avatar": "https://avatar.url/new-avatar.jpg",
    "skillLevel": "advanced",
    "learningGoals": ["Master competitive programming", "Learn advanced DP"]
  },
  "preferences": {
    "theme": "light",
    "notifications": false
  }
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "username": "john_doe",
      "email": "john@example.com",
      "profile": {
        "fullName": "John Doe",
        "bio": "Computer Science student passionate about algorithms",
        "avatar": "https://avatar.url/new-avatar.jpg",
        "skillLevel": "advanced",
        "learningGoals": ["Master competitive programming", "Learn advanced DP"]
      },
      "preferences": {
        "theme": "light",
        "notifications": false,
        "language": "en"
      }
    }
  }
}
```

**Errors**:
- `400`: Invalid data
- `401`: Unauthorized

---

### 3.2 Get User Statistics

**Endpoint**: `GET /api/v1/users/stats`

**Description**: Get detailed user activity statistics.

**Headers**:
```
Authorization: Bearer <accessToken>
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "stats": {
      "totalConversations": 25,
      "activeConversations": 8,
      "archivedConversations": 17,
      "totalQuestions": 187,
      "topicsExplored": [
        "arrays",
        "trees",
        "dynamic-programming",
        "graphs",
        "sorting"
      ],
      "topicBreakdown": {
        "arrays": 45,
        "trees": 32,
        "dynamic-programming": 28,
        "graphs": 25,
        "sorting": 18
      },
      "avgMessagesPerConversation": 7.5,
      "totalTokensUsed": 45600,
      "avgResponseTime": 2300,
      "lastActive": "2026-10-19T16:10:00.000Z",
      "memberSince": "2026-09-01T08:00:00.000Z",
      "daysActive": 48
    }
  }
}
```

**Errors**:
- `401`: Unauthorized

---

## 4. Admin Routes (Future)

### 4.1 Get All Users

**Endpoint**: `GET /api/v1/admin/users`

**Description**: Admin-only endpoint to list all users.

**Headers**:
```
Authorization: Bearer <adminAccessToken>
```

**Query Parameters**:
- `page`, `limit`: Pagination
- `role`: Filter by role
- `sortBy`: 'createdAt' | 'lastActive' | 'totalConversations'

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "507f1f77bcf86cd799439011",
        "username": "john_doe",
        "email": "john@example.com",
        "role": "student",
        "stats": {
          "totalConversations": 25,
          "totalQuestions": 187
        },
        "createdAt": "2026-09-01T08:00:00.000Z",
        "lastActive": "2026-10-19T16:10:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 47
    }
  }
}
```

**Errors**:
- `401`: Unauthorized
- `403`: Forbidden (not admin)

---

## 5. Error Responses

### Standard Error Format

All errors follow this structure:

```json
{
  "success": false,
  "message": "Human-readable error message",
  "error": {
    "code": "ERROR_CODE",
    "details": "Additional error information"
  }
}
```

### HTTP Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful GET, PATCH, DELETE |
| 201 | Created | Successful POST |
| 400 | Bad Request | Validation errors, malformed requests |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Valid auth but insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate resource (e.g., username exists) |
| 422 | Unprocessable Entity | Semantic validation errors |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server-side errors |
| 503 | Service Unavailable | External service (Pinecone, LLM) down |

### Error Code Examples

```json
// Validation Error (400)
{
  "success": false,
  "message": "Validation failed",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": {
      "username": "Username must be 3-30 characters",
      "email": "Invalid email format"
    }
  }
}

// Authentication Error (401)
{
  "success": false,
  "message": "Invalid or expired token",
  "error": {
    "code": "INVALID_TOKEN",
    "details": "JWT signature verification failed"
  }
}

// Not Found Error (404)
{
  "success": false,
  "message": "Conversation not found",
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "details": "Conversation with ID 507f191e810c19729de860ea does not exist"
  }
}

// Rate Limit Error (429)
{
  "success": false,
  "message": "Too many requests",
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "details": "Maximum 10 messages per minute exceeded",
    "retryAfter": 45
  }
}

// External Service Error (503)
{
  "success": false,
  "message": "RAG service unavailable",
  "error": {
    "code": "SERVICE_UNAVAILABLE",
    "details": "Pinecone vector database connection failed"
  }
}
```

---

## 6. Authentication Flow

### 6.1 Token Management

**Access Token**:
- Type: JWT
- Lifetime: 15 minutes
- Storage: Client memory (not localStorage)
- Payload: `{ userId, username, email, role, iat, exp }`
- Header: `Authorization: Bearer <token>`

**Refresh Token**:
- Type: JWT
- Lifetime: 7 days
- Storage: HttpOnly cookie (server-side only)
- Payload: `{ userId, type: 'refresh', iat, exp }`
- Cookie: `refreshToken=<token>; HttpOnly; Secure; SameSite=Strict`

### 6.2 Client Authentication Flow

```
1. User logs in
   └─> POST /api/v1/auth/login
       └─> Receive accessToken (store in memory)
       └─> Receive refreshToken (automatic cookie)

2. Make authenticated request
   └─> GET /api/v1/conversations
       └─> Include: Authorization: Bearer <accessToken>

3. Access token expires (after 15 min)
   └─> Request fails with 401 Unauthorized
       └─> Client calls POST /api/v1/auth/refresh-token
           └─> Cookie automatically sent
           └─> Receive new accessToken
           └─> Retry original request

4. Refresh token expires (after 7 days)
   └─> Refresh fails with 403 Forbidden
       └─> Redirect to login page
```

### 6.3 Frontend Implementation Example

```typescript
// lib/api.ts (Existing implementation reference)

// Axios interceptor for auto token refresh
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Refresh token (cookie sent automatically)
        const { data } = await axios.post('/api/v1/auth/refresh-token');
        
        // Update access token in memory
        setAccessToken(data.data.accessToken);
        
        // Retry original request
        originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;
        return axios(originalRequest);
      } catch (refreshError) {
        // Refresh failed, redirect to login
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);
```

---

## 7. Rate Limiting

### Current Implementation

**Global Rate Limit**:
- 100 requests per 15 minutes per IP
- Applied to all routes
- Library: express-rate-limit

**Message Rate Limit**:
- 10 messages per minute per user
- Applied to POST /api/v1/conversations/:id/messages
- Prevents spam and abuse

**Response Headers**:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1698764400
```

### Rate Limit Configuration

```javascript
// Server implementation reference
const rateLimit = require('express-rate-limit');

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    success: false,
    message: 'Too many requests, please try again later'
  }
});

const messageLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  keyGenerator: (req) => req.user.id, // Per user, not IP
  message: {
    success: false,
    message: 'Maximum 10 messages per minute exceeded'
  }
});
```

---

## 8. CORS Configuration

### Allowed Origins

**Development**:
```javascript
const allowedOrigins = [
  'http://localhost:3000',  // Next.js dev server
  'http://localhost:4000'   // Backend dev server
];
```

**Production**:
```javascript
const allowedOrigins = [
  'https://dsaforge.com',
  'https://www.dsaforge.com',
  'https://app.dsaforge.com'
];
```

### CORS Headers

```
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Allow-Credentials: true
Access-Control-Max-Age: 86400
```

**Note**: `credentials: true` required for cookie-based refresh tokens.

---

## 9. Request/Response Examples

### 9.1 Complete Chat Flow

**1. Create Conversation**:
```bash
curl -X POST http://localhost:4000/api/v1/conversations \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Explain merge sort",
    "context": {
      "topic": "Sorting",
      "difficulty": "medium",
      "tags": ["merge-sort", "divide-and-conquer"]
    }
  }'
```

**2. Get Conversation**:
```bash
curl -X GET http://localhost:4000/api/v1/conversations/507f191e810c19729de860ea \
  -H "Authorization: Bearer eyJhbGc..."
```

**3. Send Follow-up Message**:
```bash
curl -X POST http://localhost:4000/api/v1/conversations/507f191e810c19729de860ea/messages \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Show me the Python implementation"
  }'
```

---

## 10. Webhooks (Future Enhancement)

### Event Types

Planned webhook events:
- `conversation.created`
- `conversation.completed`
- `user.registered`
- `message.sent`

### Webhook Payload Example

```json
{
  "event": "conversation.completed",
  "timestamp": "2026-10-19T16:20:00.000Z",
  "data": {
    "conversationId": "507f191e810c19729de860ea",
    "userId": "507f1f77bcf86cd799439011",
    "messageCount": 12,
    "topic": "Dynamic Programming",
    "duration": 1800
  }
}
```

---

## 11. API Testing

### Test Server Endpoints

**Health Check**:
```bash
GET http://localhost:4000/api/v1/health

Response:
{
  "success": true,
  "message": "Server is running",
  "data": {
    "uptime": 3600,
    "timestamp": "2026-10-19T16:25:00.000Z",
    "environment": "development",
    "version": "1.0.0"
  }
}
```

**Service Status**:
```bash
GET http://localhost:4000/api/v1/status

Response:
{
  "success": true,
  "data": {
    "mongodb": "connected",
    "pinecone": "connected",
    "nvidia_llm": "available",
    "gemini_embeddings": "available"
  }
}
```

### Test Suite Location

- Integration tests: `/tests/integration/`
- Unit tests: `/tests/unit/`
- Test runner: Jest
- Coverage target: 80%

---

## 12. API Versioning

### Current Version: v1

All endpoints prefixed with `/api/v1/`

### Future Versions

Breaking changes will increment version:
- `/api/v2/` - Major changes to response format
- `/api/v3/` - Complete API redesign

Non-breaking changes (new fields, new endpoints) added to existing version.

### Deprecation Policy

- 6-month notice before deprecation
- Deprecated endpoints return `Deprecated` header
- Documentation marks deprecated routes with ⚠️

---

## Appendix A: Full Endpoint List

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/logout` - User logout
- `POST /api/v1/auth/refresh-token` - Refresh access token
- `GET /api/v1/auth/me` - Get current user

### Conversations
- `POST /api/v1/conversations` - Create conversation
- `GET /api/v1/conversations` - List conversations
- `GET /api/v1/conversations/:id` - Get single conversation
- `PATCH /api/v1/conversations/:id` - Update conversation
- `DELETE /api/v1/conversations/:id` - Delete conversation
- `POST /api/v1/conversations/:id/messages` - Send message

### User Profile
- `PATCH /api/v1/users/profile` - Update profile
- `GET /api/v1/users/stats` - Get user statistics

### System
- `GET /api/v1/health` - Health check
- `GET /api/v1/status` - Service status

---

## Appendix B: Environment Variables

Required API configuration:

```bash
# Server
PORT=4000
NODE_ENV=development

# MongoDB
MONGO_URI=mongodb+srv://...

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_REFRESH_SECRET=your_refresh_secret_key
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d

# NVIDIA LLM
NVIDIA_API_KEY=nvapi-...
NVIDIA_BASE_URL=https://integrate.api.nvidia.com/v1
NVIDIA_MODEL=openai/gpt-oss-20b

# Google Gemini (Embeddings)
GEMINI_API_KEY=AIza...

# Pinecone
PINECONE_API_KEY=pcsk_...
PINECONE_ENVIRONMENT=us-east-1-aws
PINECONE_INDEX=dsa-knowledge-base

# CORS
FRONTEND_URL=http://localhost:3000
```

---

## Document Control

**Author**: API Team  
**Reviewers**: Frontend Team, QA Team  
**Next Review**: 2026-11-19

**Change Log**:
- 2026-10-19: Initial API documentation for v1
