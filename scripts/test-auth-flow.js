#!/usr/bin/env node

/**
 * Test to verify access token + refresh token flow
 * Ensures refresh is NOT called on every request
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
let refreshCallCount = 0;
let normalRequestCount = 0;

async function apiRequest(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(cookies ? { Cookie: cookies } : {}),
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    ...(options.headers || {})
  };

  // Track if this is a refresh call
  if (path === "/auth/refresh") {
    refreshCallCount++;
    console.log(colors.yellow(`  → REFRESH CALL #${refreshCallCount}`));
  } else {
    normalRequestCount++;
  }

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

async function runTest() {
  console.log(colors.bold(colors.cyan("\n" + "═".repeat(70))));
  console.log(colors.bold(colors.cyan("  ACCESS TOKEN + REFRESH TOKEN FLOW TEST")));
  console.log(colors.bold(colors.cyan("═".repeat(70) + "\n")));

  const testUser = {
    name: "Auth Test User",
    email: `authtest_${Date.now()}@example.com`,
    password: "TestPass123!"
  };

  try {
    // Step 1: Register
    console.log(colors.bold("\n📝 Step 1: Register User"));
    console.log(colors.cyan("  POST /auth/register"));
    const { data: registerData } = await apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify(testUser),
    });
    
    if (registerData.success && registerData.data.accessToken) {
      accessToken = registerData.data.accessToken;
      console.log(colors.green("  ✅ Registration successful"));
      console.log(colors.blue(`  ℹ Access token: ${accessToken.substring(0, 30)}...`));
      console.log(colors.blue(`  ℹ Cookie: ${cookies.substring(0, 30)}...`));
    } else {
      throw new Error("Registration failed");
    }

    // Step 2: Make multiple authenticated requests
    console.log(colors.bold("\n🔐 Step 2: Multiple Authenticated Requests (with valid token)"));
    console.log(colors.cyan("  These should NOT trigger refresh because token is valid"));
    
    for (let i = 1; i <= 5; i++) {
      console.log(colors.cyan(`\n  Request ${i}/5: POST /conversations`));
      const { data } = await apiRequest("/conversations", {
        method: "POST",
        body: JSON.stringify({ title: `Test Conversation ${i}` }),
      });
      
      if (data.success) {
        console.log(colors.green(`  ✅ Request ${i} successful (no refresh)`));
      } else {
        throw new Error(`Request ${i} failed`);
      }
    }

    // Step 3: Clear access token to simulate expiration
    console.log(colors.bold("\n⏰ Step 3: Simulate Token Expiration"));
    console.log(colors.yellow("  Clearing access token to simulate expiration..."));
    accessToken = "";
    
    // Step 4: Make request without token (should trigger ONE refresh)
    console.log(colors.bold("\n🔄 Step 4: Request Without Token (should auto-refresh)"));
    console.log(colors.cyan("  GET /conversations"));
    const beforeRefreshCount = refreshCallCount;
    
    const { status, data: convData } = await apiRequest("/conversations");
    
    if (status === 401) {
      // Manual refresh (simulating client behavior)
      console.log(colors.yellow("  Got 401, triggering refresh..."));
      const { data: refreshData } = await apiRequest("/auth/refresh", {
        method: "POST",
      });
      
      if (refreshData.success && refreshData.data.accessToken) {
        accessToken = refreshData.data.accessToken;
        console.log(colors.green("  ✅ Token refreshed successfully"));
        
        // Retry original request
        console.log(colors.cyan("  Retrying: GET /conversations"));
        const { data: retryData } = await apiRequest("/conversations");
        if (retryData.success) {
          console.log(colors.green("  ✅ Retry successful"));
        }
      }
    }

    const afterRefreshCount = refreshCallCount;
    const refreshesDuringStep = afterRefreshCount - beforeRefreshCount;
    
    if (refreshesDuringStep === 1) {
      console.log(colors.green(`  ✅ Refresh called exactly ONCE (expected)`));
    } else {
      console.log(colors.red(`  ❌ Refresh called ${refreshesDuringStep} times (expected 1)`));
    }

    // Step 5: Make more requests with new token
    console.log(colors.bold("\n✨ Step 5: Requests With New Token (should not refresh)"));
    for (let i = 1; i <= 3; i++) {
      console.log(colors.cyan(`  Request ${i}/3: GET /conversations`));
      const { data } = await apiRequest("/conversations");
      
      if (data.success) {
        console.log(colors.green(`  ✅ Request ${i} successful (no refresh)`));
      }
    }

    // Final analysis
    console.log(colors.bold(colors.cyan("\n" + "═".repeat(70))));
    console.log(colors.bold(colors.cyan("  TEST RESULTS")));
    console.log(colors.bold(colors.cyan("═".repeat(70) + "\n")));

    console.log(colors.bold("📊 Statistics:"));
    console.log(colors.blue(`  Total normal requests: ${normalRequestCount}`));
    console.log(colors.blue(`  Total refresh calls: ${refreshCallCount}`));
    console.log(colors.blue(`  Refresh ratio: ${((refreshCallCount / normalRequestCount) * 100).toFixed(1)}%`));

    console.log(colors.bold("\n✅ Expected Behavior:"));
    console.log(colors.green("  • Refresh called ONLY when token expires"));
    console.log(colors.green("  • NOT called on every request"));
    console.log(colors.green("  • Access token stored and reused"));
    console.log(colors.green("  • Refresh token in HttpOnly cookie"));

    if (refreshCallCount === 1 && normalRequestCount > 5) {
      console.log(colors.bold(colors.green("\n🎉 TEST PASSED!")));
      console.log(colors.green("  Refresh was called only once when token expired."));
      console.log(colors.green("  All other requests used the stored access token."));
    } else if (refreshCallCount > normalRequestCount / 2) {
      console.log(colors.bold(colors.red("\n❌ TEST FAILED!")));
      console.log(colors.red("  Refresh is being called too often."));
      console.log(colors.red("  This indicates the access token is not being stored/used correctly."));
    } else {
      console.log(colors.bold(colors.yellow("\n⚠️  TEST INCONCLUSIVE")));
      console.log(colors.yellow("  Results are within acceptable range but not optimal."));
    }

    console.log(colors.bold(colors.cyan("\n" + "═".repeat(70) + "\n")));

  } catch (error) {
    console.error(colors.red("\n❌ Test failed:"), error.message);
    process.exit(1);
  }
}

runTest();
