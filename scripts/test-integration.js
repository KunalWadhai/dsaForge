#!/usr/bin/env node

/**
 * Integration test script for DSA Forge
 * Tests the full flow: auth -> conversations -> LLM responses
 */

const API_BASE = "http://localhost:4000/api/v1";
const TEST_USER = {
  name: "Test User",
  email: `test_${Date.now()}@example.com`,
  password: "TestPassword123!"
};

// Color output helpers
const colors = {
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  blue: (text) => `\x1b[34m${text}\x1b[0m`,
  cyan: (text) => `\x1b[36m${text}\x1b[0m`,
  bold: (text) => `\x1b[1m${text}\x1b[0m`,
};

let cookies = "";
let accessToken = "";

async function apiRequest(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const headers = {
    "Content-Type": "application/json",
    ...(cookies ? { Cookie: cookies } : {}),
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    ...(options.headers || {})
  };

  console.log(colors.cyan(`→ ${options.method || "GET"} ${path}`));
  
  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Capture cookies from response
    const setCookie = response.headers.get("set-cookie");
    if (setCookie) {
      cookies = setCookie.split(";")[0];
    }

    const text = await response.text();
    let data;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${data?.message || text || response.statusText}`);
    }

    return { status: response.status, data };
  } catch (error) {
    if (error.code === "ECONNREFUSED") {
      throw new Error("Cannot connect to server. Is it running on port 4000?");
    }
    throw error;
  }
}

function logSuccess(message) {
  console.log(colors.green(`✓ ${message}`));
}

function logError(message) {
  console.log(colors.red(`✗ ${message}`));
}

function logInfo(message) {
  console.log(colors.blue(`ℹ ${message}`));
}

function logSection(title) {
  console.log("\n" + colors.bold(colors.yellow(`${"=".repeat(60)}`)));
  console.log(colors.bold(colors.yellow(`  ${title}`)));
  console.log(colors.bold(colors.yellow(`${"=".repeat(60)}`)) + "\n");
}

async function testHealthCheck() {
  logSection("TEST 1: Health Check");
  try {
    // Health endpoint at root level (not under auth)
    const url = API_BASE.replace("/api/v1", "") + "/health";
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.success && data.data.status === "ok") {
      logSuccess("Server is healthy and responding");
      logInfo(`Service: ${data.data.service}`);
      return true;
    }
  } catch (error) {
    // If health check fails, try with auth
    const { data } = await apiRequest("/health");
    if (data.success && data.data.status === "ok") {
      logSuccess("Server is healthy and responding");
      logInfo(`Service: ${data.data.service}`);
      return true;
    }
  }
  throw new Error("Health check failed");
}

async function testRegistration() {
  logSection("TEST 2: User Registration");
  const { data } = await apiRequest("/auth/register", {
    method: "POST",
    body: JSON.stringify(TEST_USER),
  });
  
  if (data.success && data.data.user && data.data.accessToken) {
    accessToken = data.data.accessToken;
    logSuccess("User registered successfully");
    logInfo(`User ID: ${data.data.user.id}`);
    logInfo(`Name: ${data.data.user.name}`);
    logInfo(`Email: ${data.data.user.email}`);
    logInfo(`Access token received: ${accessToken.substring(0, 30)}...`);
    return data.data.user;
  }
  throw new Error("Registration failed");
}

async function testLogin() {
  logSection("TEST 3: User Login");
  // Clear cookies and token to test fresh login
  cookies = "";
  accessToken = "";
  
  const { data } = await apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email: TEST_USER.email,
      password: TEST_USER.password,
    }),
  });
  
  if (data.success && data.data.user && data.data.accessToken && cookies) {
    accessToken = data.data.accessToken;
    logSuccess("Login successful");
    logInfo(`Access token received: ${accessToken.substring(0, 30)}...`);
    logInfo(`Session cookie received: ${cookies.substring(0, 50)}...`);
    return data.data.user;
  }
  throw new Error("Login failed");
}

async function testAuthCheck() {
  logSection("TEST 4: Authentication Verification");
  const { data } = await apiRequest("/auth/me");
  
  if (data.success && data.data.user) {
    logSuccess("Authentication verified");
    logInfo(`Authenticated as: ${data.data.user.email}`);
    return data.data.user;
  }
  throw new Error("Auth verification failed");
}

async function testCreateConversation() {
  logSection("TEST 5: Create Conversation");
  const { data } = await apiRequest("/conversations", {
    method: "POST",
    body: JSON.stringify({ title: "Test Conversation - Binary Search" }),
  });
  
  if (data.success && data.data.id) {
    logSuccess("Conversation created successfully");
    logInfo(`Conversation ID: ${data.data.id}`);
    logInfo(`Title: ${data.data.title}`);
    return data.data.id;
  }
  throw new Error("Conversation creation failed");
}

async function testListConversations() {
  logSection("TEST 6: List Conversations");
  const { data } = await apiRequest("/conversations");
  
  if (data.success && Array.isArray(data.data)) {
    logSuccess(`Retrieved ${data.data.length} conversation(s)`);
    data.data.forEach((conv, idx) => {
      logInfo(`${idx + 1}. ${conv.title} (ID: ${conv.id})`);
    });
    return data.data;
  }
  throw new Error("List conversations failed");
}

async function testSendMessage(conversationId, question) {
  logSection(`TEST 7: Send Message & LLM Response`);
  logInfo(`Question: "${question}"`);
  
  const startTime = Date.now();
  const { data } = await apiRequest(`/conversations/${conversationId}/messages`, {
    method: "POST",
    body: JSON.stringify({ message: question }),
  });
  const responseTime = Date.now() - startTime;
  
  if (data.success && data.data.answer) {
    logSuccess(`LLM response received in ${responseTime}ms`);
    console.log(colors.bold("\n📝 LLM Answer:"));
    console.log(colors.cyan("─".repeat(60)));
    console.log(data.data.answer);
    console.log(colors.cyan("─".repeat(60)));
    
    if (data.data.sources && data.data.sources.length > 0) {
      console.log(colors.bold("\n📚 Sources:"));
      data.data.sources.forEach((source, idx) => {
        const score = source.score ? ` (score: ${source.score.toFixed(3)})` : "";
        const page = source.page ? ` [page ${source.page}]` : "";
        logInfo(`${idx + 1}. ${source.title}${page}${score}`);
      });
    } else {
      logInfo("No sources returned");
    }
    
    return data.data;
  }
  throw new Error("Send message failed");
}

async function testGetConversation(conversationId) {
  logSection("TEST 8: Retrieve Conversation History");
  const { data } = await apiRequest(`/conversations/${conversationId}`);
  
  if (data.success && data.data.messages) {
    logSuccess(`Retrieved conversation with ${data.data.messages.length} message(s)`);
    logInfo(`Title: ${data.data.title}`);
    
    console.log(colors.bold("\n💬 Message History:"));
    data.data.messages.forEach((msg, idx) => {
      const role = msg.role === "user" ? "👤 User" : "🤖 Assistant";
      const preview = msg.content.substring(0, 80) + (msg.content.length > 80 ? "..." : "");
      console.log(`  ${idx + 1}. ${role}: ${preview}`);
    });
    
    return data.data;
  }
  throw new Error("Get conversation failed");
}

async function testMultipleMessages(conversationId) {
  logSection("TEST 9: Multiple Messages (Context Test)");
  
  const questions = [
    "What is the time complexity of binary search?",
    "Can you explain why it's logarithmic?"
  ];
  
  for (let i = 0; i < questions.length; i++) {
    logInfo(`\nMessage ${i + 1}/${questions.length}: "${questions[i]}"`);
    const startTime = Date.now();
    const { data } = await apiRequest(`/conversations/${conversationId}/messages`, {
      method: "POST",
      body: JSON.stringify({ message: questions[i] }),
    });
    const responseTime = Date.now() - startTime;
    
    if (data.success && data.data.answer) {
      logSuccess(`Response received in ${responseTime}ms`);
      const preview = data.data.answer.substring(0, 150) + "...";
      console.log(colors.cyan(`   Answer preview: ${preview}`));
    } else {
      throw new Error(`Message ${i + 1} failed`);
    }
  }
  
  logSuccess("Context-aware conversation working!");
}

async function testDeleteConversation(conversationId) {
  logSection("TEST 10: Delete Conversation");
  const { status } = await apiRequest(`/conversations/${conversationId}`, {
    method: "DELETE",
  });
  
  if (status === 204) {
    logSuccess("Conversation deleted successfully");
    return true;
  }
  throw new Error("Delete conversation failed");
}

async function runTests() {
  console.log(colors.bold(colors.green("\n" + "═".repeat(60))));
  console.log(colors.bold(colors.green("  DSA FORGE INTEGRATION TEST SUITE")));
  console.log(colors.bold(colors.green("═".repeat(60))));
  
  let conversationId;
  const results = {
    passed: 0,
    failed: 0,
    errors: []
  };
  
  const tests = [
    { name: "Health Check", fn: testHealthCheck },
    { name: "Registration", fn: testRegistration },
    { name: "Login", fn: testLogin },
    { name: "Auth Verification", fn: testAuthCheck },
    { name: "Create Conversation", fn: async () => { conversationId = await testCreateConversation(); } },
    { name: "List Conversations", fn: testListConversations },
    { name: "Send Message & LLM Response", fn: async () => await testSendMessage(conversationId, "Explain how binary search works") },
    { name: "Get Conversation", fn: async () => await testGetConversation(conversationId) },
    { name: "Multiple Messages", fn: async () => await testMultipleMessages(conversationId) },
    { name: "Delete Conversation", fn: async () => await testDeleteConversation(conversationId) },
  ];
  
  for (const test of tests) {
    try {
      await test.fn();
      results.passed++;
    } catch (error) {
      results.failed++;
      results.errors.push({ test: test.name, error: error.message });
      logError(`Test failed: ${error.message}`);
    }
  }
  
  // Final summary
  console.log("\n" + colors.bold(colors.yellow("═".repeat(60))));
  console.log(colors.bold(colors.yellow("  TEST SUMMARY")));
  console.log(colors.bold(colors.yellow("═".repeat(60))) + "\n");
  
  console.log(`Total Tests: ${tests.length}`);
  console.log(colors.green(`Passed: ${results.passed}`));
  console.log(results.failed > 0 ? colors.red(`Failed: ${results.failed}`) : `Failed: 0`);
  
  if (results.errors.length > 0) {
    console.log(colors.bold("\n❌ Failed Tests:"));
    results.errors.forEach((err, idx) => {
      console.log(colors.red(`  ${idx + 1}. ${err.test}: ${err.error}`));
    });
  }
  
  console.log("\n" + colors.bold(colors.yellow("═".repeat(60))) + "\n");
  
  if (results.failed === 0) {
    console.log(colors.bold(colors.green("🎉 ALL TESTS PASSED! Integration is working perfectly.")));
    process.exit(0);
  } else {
    console.log(colors.bold(colors.red("⚠️  SOME TESTS FAILED. Check the errors above.")));
    process.exit(1);
  }
}

// Run the tests
runTests().catch(error => {
  console.error(colors.red("\n💥 Test suite crashed:"), error.message);
  process.exit(1);
});
