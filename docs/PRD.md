# Product Requirements Document: DSA Forge

## Problem Statement

Students and professionals learning Data Structures & Algorithms face a critical challenge: traditional learning resources (textbooks, videos, documentation) are scattered, not contextual, and don't provide interactive, personalized explanations. When stuck on a DSA concept, users must:
- Search through multiple resources
- Read lengthy documentation hoping to find relevant information
- Lack context-aware answers that build on previous questions
- Cannot get explanations tailored to their current understanding level

## Value Proposition

**DSA Forge** is an AI-powered learning companion that provides instant, accurate, grounded answers to DSA questions by leveraging RAG (Retrieval-Augmented Generation) technology. Unlike generic AI assistants:

- **Grounded Answers**: All responses are backed by authoritative DSA knowledge sources
- **Context-Aware**: Remembers conversation history for follow-up questions
- **Source Attribution**: Shows exact sources used to generate each answer
- **Interactive Learning**: Conversational interface for exploring concepts deeply
- **Structured Responses**: Markdown-formatted answers with code examples, tables, and diagrams

## Target Users

### Primary Users
1. **Computer Science Students** (20-25 years)
   - Learning DSA for coursework
   - Preparing for technical interviews
   - Need quick, accurate concept explanations

2. **Software Engineers** (25-35 years)
   - Interview preparation
   - Concept refreshers
   - Learning new algorithms/data structures

### Secondary Users
3. **Self-taught Developers**
   - Career transition to tech
   - Building foundational knowledge
   - Need structured learning paths

## Core User Journeys

### Journey 1: Learning a New Concept
1. User opens DSA Forge
2. Types question: "Explain how binary search works"
3. System retrieves relevant content from knowledge base
4. LLM generates comprehensive answer with:
   - Conceptual explanation
   - Code examples
   - Time/space complexity analysis
   - Edge cases
5. User sees answer with source citations
6. User asks follow-up: "What is its time complexity?"
7. System provides context-aware answer referencing previous discussion

### Journey 2: Interview Preparation
1. User logs in to continue previous session
2. Reviews past conversations on specific topics
3. Creates new conversation for practice problems
4. Asks: "Compare BFS vs DFS"
5. Gets structured comparison with use cases
6. Follows up with: "When should I use DFS?"
7. Gets specific guidance with examples

### Journey 3: Quick Reference
1. User needs quick reminder on a concept
2. Opens existing conversation or creates new one
3. Asks specific question
4. Gets concise, relevant answer
5. Copies code snippet for reference

## User Stories

### Authentication & Account Management
- **As a user**, I want to create an account so I can save my conversation history
- **As a user**, I want to log in/out securely so my data remains private
- **As a user**, I want my sessions to persist so I don't lose work during breaks

### Conversation Management
- **As a user**, I want to create new conversations so I can organize topics separately
- **As a user**, I want to see my conversation history so I can review past learning
- **As a user**, I want to continue previous conversations so I can build on prior context
- **As a user**, I want to delete conversations I no longer need

### Question & Answer
- **As a user**, I want to ask DSA questions in natural language so I get helpful answers
- **As a user**, I want context-aware follow-up responses so conversations feel natural
- **As a user**, I want to see source citations so I can verify information
- **As a user**, I want markdown-formatted responses so code and explanations are readable
- **As a user**, I want to see which knowledge sources were used for each answer

### User Experience
- **As a user**, I want clear loading indicators so I know my question is processing
- **As a user**, I want error messages when something fails so I know what went wrong
- **As a user**, I want to copy answers easily so I can save them for reference
- **As a user**, I want syntax-highlighted code blocks so examples are easy to read

## Features & Functional Requirements

### MVP Features (v1.0)

#### 1. Authentication System
- User registration (name, email, password)
- Secure login with JWT tokens (access + refresh)
- Logout functionality
- Session management with HttpOnly cookies
- Password hashing (bcrypt)

#### 2. Conversation Management
- Create new conversations
- List user's conversations
- Continue existing conversations
- Delete conversations
- Auto-title conversations based on first message

#### 3. AI-Powered Q&A
- Natural language question input
- RAG-based answer generation using NVIDIA OpenAI API
- Context-aware responses (conversation history)
- Source attribution (up to 8 sources per answer)
- Markdown-formatted responses
- Query transformation for better retrieval

#### 4. Knowledge Base
- PDF document ingestion (DSA Revision Guide)
- Vector embedding generation (Gemini)
- Semantic search (Pinecone)
- Source metadata (title, page, relevance score)

#### 5. User Interface
- Welcome screen with starter prompts
- Chat interface with message history
- Sidebar with conversation list
- Markdown rendering for LLM responses
- Source citation display
- Loading/thinking states
- Error notifications
- Copy-to-clipboard functionality

## Non-Functional Requirements

### Performance
- **Response Time**: LLM responses within 30 seconds
- **Page Load**: Initial page load < 3 seconds
- **Concurrent Users**: Support 100+ simultaneous users

### Security
- **Authentication**: JWT access tokens (15min) + refresh tokens (7 days)
- **Password Storage**: bcrypt with 10 rounds
- **API Security**: All endpoints protected with Bearer tokens
- **CORS**: Configured for specific frontend origin
- **Rate Limiting**: 120 requests/min global, 20 requests/min for chat
- **Input Validation**: All user inputs sanitized and validated
- **Secrets Management**: Environment variables only, never hardcoded

### Scalability
- **Database**: MongoDB with indexed queries
- **Vector DB**: Pinecone for distributed vector search
- **Stateless Backend**: No server-side session storage
- **Horizontal Scaling**: Stateless API design allows multiple instances

### Reliability
- **Error Handling**: Graceful degradation for API failures
- **Data Persistence**: All conversations saved to MongoDB
- **Backup**: Database backup strategy required
- **Logging**: Error logging without exposing sensitive data

### Usability
- **Responsive Design**: Works on desktop, tablet, mobile
- **Accessibility**: Keyboard navigation, ARIA labels
- **Browser Support**: Modern browsers (Chrome, Firefox, Safari, Edge)
- **Markdown Support**: Tables, code blocks, lists, headings

### Maintainability
- **Code Quality**: TypeScript for frontend, Zod validation for backend
- **Documentation**: Inline comments for complex logic
- **Testing**: Integration tests for critical paths
- **Version Control**: Git with meaningful commit messages

## Pages/Screens

### 1. Landing Page (/)
**Purpose**: Welcome users and explain value proposition
**Components**:
- Hero section with tagline
- Starter prompt cards
- Welcome message from AI
**State**: Unauthenticated users see login/register prompts

### 2. Chat Interface (/chat)
**Purpose**: Main application interface for asking questions
**Components**:
- Left Sidebar:
  - Brand logo
  - New conversation button
  - Conversation history list
  - Search conversations
  - User profile menu
- Main Chat Area:
  - Conversation title
  - Message history (user + assistant)
  - Source citations
  - Markdown-rendered responses
  - Thinking/loading indicator
- Input Composer:
  - Text input area
  - Send button
  - Character count (optional)
  - Keyboard shortcuts hint

### 3. Login Page (/login)
**Purpose**: User authentication
**Components**:
- Email input
- Password input
- Login button
- Link to register
- Error messages

### 4. Register Page (/register)
**Purpose**: New user account creation
**Components**:
- Name input
- Email input
- Password input (with requirements)
- Register button
- Link to login
- Validation messages

## Roles & Permissions

### User Role
**Permissions**:
- Create, read, update, delete own conversations
- Send messages in own conversations
- View own profile
- Logout

**Restrictions**:
- Cannot access other users' conversations
- Cannot modify system knowledge base
- Cannot bypass rate limits

### Future: Admin Role (Not MVP)
- Manage knowledge base documents
- View system analytics
- Manage users

## Data Requirements

### User Data
- **Personal Information**: Name, email (PII - encrypted in transit)
- **Authentication**: Hashed passwords, refresh tokens
- **Activity**: Conversation history, timestamps

### Conversation Data
- **Metadata**: Title, created/updated timestamps, user ID
- **Messages**: User questions, assistant responses, sources
- **Context**: Conversation history for context-aware responses

### Knowledge Base Data
- **Documents**: PDF files (DSA Revision Guide)
- **Vectors**: Embedded chunks in Pinecone
- **Metadata**: Source file, page numbers, text content

### Session Data
- **Tokens**: JWT access tokens (memory), refresh tokens (DB)
- **Expiry**: Access token 15min, refresh token 7 days

## Integrations

### Required Integrations

#### 1. NVIDIA OpenAI API
**Purpose**: LLM for answer generation
**Model**: openai/gpt-oss-20b
**Usage**: Generate contextual, grounded DSA answers
**Configuration**: API key, base URL
**Error Handling**: Fallback message if API unavailable

#### 2. Google Gemini Embeddings
**Purpose**: Generate vector embeddings for semantic search
**Model**: gemini-embedding-001
**Usage**: Convert text chunks to 3072-dimensional vectors
**Configuration**: API key
**Error Handling**: Cannot process questions without embeddings

#### 3. Pinecone Vector Database
**Purpose**: Store and search document embeddings
**Configuration**: API key, index name, namespace (optional)
**Usage**: Semantic similarity search for relevant context
**Error Handling**: Return "no relevant information" if search fails

#### 4. MongoDB Atlas
**Purpose**: Primary database for users, conversations, sessions
**Configuration**: Connection URI
**Usage**: Store all application data
**Error Handling**: Connection retry logic, graceful error messages

## Loading, Empty & Error States

### Loading States
- **Thinking Indicator**: Animated dots with "Searching knowledge base and reasoning"
- **Button Disabled**: Send button disabled during request
- **Input Disabled**: Cannot type new message while processing

### Empty States
- **No Conversations**: Welcome screen with starter prompts
- **No Messages**: Clean slate with "Ask your first question"
- **No Sources**: "No sources available" (rare edge case)

### Error States
- **Network Error**: "Unable to connect. Please check your connection."
- **Authentication Error**: "Session expired. Please log in again."
- **Rate Limit**: "Too many requests. Please wait a moment."
- **LLM Error**: "Failed to generate response. Please try again."
- **No Results**: "I couldn't find relevant information for this question."
- **Invalid Input**: "Please enter a valid question"

### Success States
- **Account Created**: "Welcome! Your account is ready."
- **Login Success**: Redirect to chat
- **Message Sent**: Immediate display in chat
- **Conversation Created**: New conversation in sidebar
- **Copied**: "Copied to clipboard" toast notification

## MVP Scope

### In Scope (MVP)
✅ User registration and authentication
✅ Secure login/logout
✅ Create, list, delete conversations
✅ Ask questions and receive AI-generated answers
✅ Context-aware follow-up questions
✅ Source attribution for all answers
✅ Markdown rendering for responses
✅ Conversation history persistence
✅ Responsive UI (desktop, tablet, mobile)
✅ Rate limiting and security
✅ PDF knowledge base (DSA Revision Guide)

### Out of Scope (Post-MVP)
❌ User profile editing
❌ Conversation search functionality
❌ Export conversations (PDF, Markdown)
❌ Conversation sharing with others
❌ Multiple knowledge bases
❌ File upload for custom knowledge
❌ Learning path recommendations
❌ Bookmarking specific answers
❌ Admin dashboard
❌ Analytics and usage tracking
❌ Multiple themes/customization
❌ Voice input
❌ Streaming responses
❌ Code execution sandbox

## Success Criteria

### Launch Criteria
1. ✅ User can register, login, and logout successfully
2. ✅ User can create and manage conversations
3. ✅ System generates accurate, grounded DSA answers within 30 seconds
4. ✅ All answers include source citations
5. ✅ Follow-up questions maintain context
6. ✅ UI is responsive and accessible
7. ✅ No critical security vulnerabilities
8. ✅ Error states handled gracefully
9. ✅ Application deployed and accessible

### Success Metrics (Post-Launch)
- **Engagement**: Average 5+ messages per conversation
- **Accuracy**: 90%+ user satisfaction with answers (feedback)
- **Performance**: 95%+ responses under 30 seconds
- **Retention**: 60%+ users return within 7 days
- **Error Rate**: < 5% failed requests

## Assumptions

### Technical Assumptions
- NVIDIA OpenAI API has sufficient quota and uptime
- Pinecone free tier supports expected load
- MongoDB Atlas free tier sufficient for MVP
- Users have modern browsers with JavaScript enabled
- PDF knowledge base is comprehensive enough

### Business Assumptions
- Target users are comfortable with AI-generated content
- Users value source attribution over pure AI responses
- Interview preparation is primary use case
- English-only interface is acceptable for MVP

## Open Questions Requiring Approval

### Feature Decisions
1. **Conversation Limits**: Should free users have a max number of conversations?
2. **Message History**: How many past messages should be included in context (currently 8)?
3. **Knowledge Base Updates**: How often should the DSA content be refreshed?
4. **Data Retention**: How long should we keep conversation history?

### Technical Decisions
1. **Deployment**: Preferred hosting (Vercel, AWS, Railway)?
2. **Monitoring**: Which error tracking service (Sentry, LogRocket)?
3. **Backup**: Automated backup frequency for MongoDB?

### UX Decisions
1. **Onboarding**: Should we have a guided tutorial for new users?
2. **Feedback**: Include thumbs up/down for answers in MVP?
3. **Limits**: Should we display rate limit remaining count to users?
