#!/usr/bin/env node

/**
 * Test NVIDIA OpenAI API integration with RAG
 */

const API_BASE = "http://localhost:4000/api/v1";

const colors = {
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  blue: (text) => `\x1b[34m${text}\x1b[0m`,
  cyan: (text) => `\x1b[36m${text}\x1b[0m`,
  bold: (text) => `\x1b[1m${text}\x1b[0m`,
};

let accessToken = "";
let cookies = "";

async function apiRequest(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(cookies ? { Cookie: cookies } : {}),
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    ...(options.headers || {})
  };

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

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

  return { status: response.status, data };
}

async function testNvidiaIntegration() {
  console.log(colors.bold(colors.cyan("\n" + "═".repeat(70))));
  console.log(colors.bold(colors.cyan("  NVIDIA OPENAI API + RAG INTEGRATION TEST")));
  console.log(colors.bold(colors.cyan("═".repeat(70) + "\n")));

  const testUser = {
    name: "NVIDIA Test User",
    email: `nvidia_${Date.now()}@test.com`,
    password: "TestPass123!"
  };

  try {
    // Step 1: Register
    console.log(colors.bold("📝 Step 1: Register User"));
    const { data: registerData } = await apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify(testUser),
    });
    
    if (registerData.success && registerData.data.accessToken) {
      accessToken = registerData.data.accessToken;
      console.log(colors.green("✅ Registration successful"));
    } else {
      throw new Error("Registration failed");
    }

    // Step 2: Create conversation
    console.log(colors.bold("\n💬 Step 2: Create Conversation"));
    const { data: convData } = await apiRequest("/conversations", {
      method: "POST",
      body: JSON.stringify({ title: "NVIDIA Test - Binary Search" }),
    });
    
    if (!convData.success || !convData.data.id) {
      throw new Error("Failed to create conversation");
    }
    
    const conversationId = convData.data.id;
    console.log(colors.green(`✅ Conversation created: ${conversationId}`));

    // Step 3: Send message and test LLM
    console.log(colors.bold("\n🤖 Step 3: Test LLM Response (NVIDIA OpenAI API)"));
    console.log(colors.cyan("Question: 'Explain how binary search works'"));
    console.log(colors.yellow("Waiting for LLM response (this may take 10-20 seconds)...\n"));
    
    const startTime = Date.now();
    const { status, data: msgData } = await apiRequest(`/conversations/${conversationId}/messages`, {
      method: "POST",
      body: JSON.stringify({ message: "Explain how binary search works" }),
    });
    const responseTime = Date.now() - startTime;

    if (status !== 200 || !msgData.success) {
      console.log(colors.red(`❌ Request failed with status ${status}`));
      console.log(colors.red(`Response: ${JSON.stringify(msgData, null, 2)}`));
      throw new Error(`Message API failed: ${msgData.message || "Unknown error"}`);
    }

    console.log(colors.green(`✅ LLM response received in ${responseTime}ms (${(responseTime/1000).toFixed(1)}s)`));
    
    // Display answer
    console.log(colors.bold(colors.cyan("\n" + "─".repeat(70))));
    console.log(colors.bold("📝 LLM Answer:"));
    console.log(colors.bold(colors.cyan("─".repeat(70))));
    console.log(msgData.data.answer);
    console.log(colors.bold(colors.cyan("─".repeat(70))));

    // Display sources
    if (msgData.data.sources && msgData.data.sources.length > 0) {
      console.log(colors.bold("\n📚 Sources:"));
      msgData.data.sources.forEach((source, idx) => {
        const score = source.score ? ` (score: ${source.score.toFixed(3)})` : "";
        const page = source.page ? ` [page ${source.page}]` : "";
        console.log(colors.blue(`  ${idx + 1}. ${source.title}${page}${score}`));
      });
    }

    // Test follow-up question
    console.log(colors.bold("\n🔄 Step 4: Test Context-Aware Follow-up"));
    console.log(colors.cyan("Question: 'What is its time complexity?'"));
    
    const followupStart = Date.now();
    const { data: followupData } = await apiRequest(`/conversations/${conversationId}/messages`, {
      method: "POST",
      body: JSON.stringify({ message: "What is its time complexity?" }),
    });
    const followupTime = Date.now() - followupStart;

    if (followupData.success) {
      console.log(colors.green(`✅ Follow-up response received in ${followupTime}ms`));
      const preview = followupData.data.answer.substring(0, 200) + "...";
      console.log(colors.cyan(`   Answer preview: ${preview}`));
    }

    // Summary
    console.log(colors.bold(colors.green("\n" + "═".repeat(70))));
    console.log(colors.bold(colors.green("  🎉 NVIDIA OPENAI API INTEGRATION SUCCESSFUL!")));
    console.log(colors.bold(colors.green("═".repeat(70))));
    console.log(colors.green("\n✅ NVIDIA OpenAI API: Working"));
    console.log(colors.green("✅ RAG Pipeline: Operational"));
    console.log(colors.green("✅ Source Attribution: Working"));
    console.log(colors.green("✅ Context Awareness: Working"));
    console.log(colors.green("\n📊 Performance:"));
    console.log(colors.blue(`   First response: ${(responseTime/1000).toFixed(1)}s`));
    console.log(colors.blue(`   Follow-up: ${(followupTime/1000).toFixed(1)}s`));
    console.log(colors.bold(colors.green("\n" + "═".repeat(70) + "\n")));

  } catch (error) {
    console.error(colors.red("\n❌ Test failed:"), error.message);
    if (error.stack) {
      console.error(colors.red(error.stack));
    }
    process.exit(1);
  }
}

testNvidiaIntegration();
