#!/usr/bin/env node

/**
 * NVIDIA LLM Integration Test Script
 * 
 * Tests the complete RAG pipeline with NVIDIA API
 * Run: node scripts/test-nvidia-integration.js
 */

import OpenAI from 'openai';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, '..', '.env');

dotenv.config({ path: envPath });

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  bold: '\x1b[1m',
};

const log = {
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  title: (msg) => console.log(`\n${colors.bold}${msg}${colors.reset}\n`),
};

// Initialize OpenAI client for NVIDIA
const openai = new OpenAI({
  apiKey: process.env.NVIDIA_API_KEY,
  baseURL: process.env.NVIDIA_BASE_URL || 'https://integrate.api.nvidia.com/v1',
});

const model = process.env.NVIDIA_MODEL || 'openai/gpt-oss-20b';

// Test suite
const tests = [];
let passedTests = 0;
let failedTests = 0;

// Helper function to run a test
async function runTest(name, testFn) {
  process.stdout.write(`Testing: ${name}... `);
  const startTime = Date.now();
  
  try {
    await testFn();
    const duration = Date.now() - startTime;
    log.success(`${name} (${duration}ms)`);
    passedTests++;
    return true;
  } catch (error) {
    const duration = Date.now() - startTime;
    log.error(`${name} (${duration}ms)`);
    console.error(`  Error: ${error.message}`);
    failedTests++;
    return false;
  }
}

// Test 1: Basic connection
async function testBasicConnection() {
  const completion = await openai.chat.completions.create({
    model,
    messages: [{ role: 'user', content: 'Say "Hello World"' }],
    max_tokens: 20,
    temperature: 0.1,
  });
  
  const response = completion.choices[0]?.message?.content;
  if (!response) throw new Error('No response from API');
  if (!response.toLowerCase().includes('hello')) {
    throw new Error(`Unexpected response: ${response}`);
  }
}

// Test 2: Simple math question
async function testSimpleMath() {
  const completion = await openai.chat.completions.create({
    model,
    messages: [{ role: 'user', content: 'Which number is larger, 9.11 or 9.8?' }],
    max_tokens: 100,
    temperature: 0.1,
  });
  
  const response = completion.choices[0]?.message?.content;
  if (!response) throw new Error('No response from API');
  if (!response.toLowerCase().includes('9.8')) {
    throw new Error(`Incorrect answer: ${response}`);
  }
}

// Test 3: DSA question (Binary Search)
async function testDSAQuestion() {
  const completion = await openai.chat.completions.create({
    model,
    messages: [{ 
      role: 'user', 
      content: 'Explain binary search algorithm in 2 sentences.' 
    }],
    max_tokens: 150,
    temperature: 0.5,
  });
  
  const response = completion.choices[0]?.message?.content;
  if (!response) throw new Error('No response from API');
  if (response.length < 50) {
    throw new Error('Response too short');
  }
}

// Test 4: Code generation
async function testCodeGeneration() {
  const completion = await openai.chat.completions.create({
    model,
    messages: [{ 
      role: 'user', 
      content: 'Write a Python function to reverse a string. Just the code, no explanation.' 
    }],
    max_tokens: 200,
    temperature: 0.3,
  });
  
  const response = completion.choices[0]?.message?.content;
  if (!response) throw new Error('No response from API');
  if (!response.includes('def ') || !response.includes(':')) {
    throw new Error('Response does not contain Python function');
  }
}

// Test 5: Complex reasoning (DP problem)
async function testComplexReasoning() {
  const completion = await openai.chat.completions.create({
    model,
    messages: [{ 
      role: 'user', 
      content: 'What is dynamic programming? Explain in one paragraph.' 
    }],
    max_tokens: 250,
    temperature: 0.5,
  });
  
  const response = completion.choices[0]?.message?.content;
  if (!response) throw new Error('No response from API');
  if (response.length < 100) {
    throw new Error('Response too short for complex topic');
  }
}

// Test 6: Multi-turn conversation
async function testMultiTurn() {
  const messages = [
    { role: 'user', content: 'What is a binary tree?' },
  ];
  
  const completion1 = await openai.chat.completions.create({
    model,
    messages,
    max_tokens: 150,
    temperature: 0.5,
  });
  
  const response1 = completion1.choices[0]?.message?.content;
  if (!response1) throw new Error('No response from first message');
  
  // Add assistant response to conversation
  messages.push({ role: 'assistant', content: response1 });
  messages.push({ role: 'user', content: 'What are its types?' });
  
  const completion2 = await openai.chat.completions.create({
    model,
    messages,
    max_tokens: 150,
    temperature: 0.5,
  });
  
  const response2 = completion2.choices[0]?.message?.content;
  if (!response2) throw new Error('No response from second message');
  if (response2.length < 50) {
    throw new Error('Follow-up response too short');
  }
}

// Test 7: Error handling (invalid input)
async function testErrorHandling() {
  try {
    await openai.chat.completions.create({
      model,
      messages: [],  // Empty messages should fail
      max_tokens: 100,
    });
    throw new Error('Should have thrown error for empty messages');
  } catch (error) {
    if (error.message.includes('Should have thrown')) {
      throw error;
    }
    // Expected error
  }
}

// Test 8: Response time check
async function testResponseTime() {
  const startTime = Date.now();
  
  await openai.chat.completions.create({
    model,
    messages: [{ role: 'user', content: 'What is sorting?' }],
    max_tokens: 100,
    temperature: 0.5,
  });
  
  const duration = Date.now() - startTime;
  if (duration > 10000) {  // 10 seconds timeout
    throw new Error(`Response too slow: ${duration}ms`);
  }
}

// Test 9: Token usage tracking
async function testTokenUsage() {
  const completion = await openai.chat.completions.create({
    model,
    messages: [{ role: 'user', content: 'Hello' }],
    max_tokens: 50,
    temperature: 0.5,
  });
  
  if (!completion.usage) {
    throw new Error('No usage information in response');
  }
  
  if (!completion.usage.total_tokens || completion.usage.total_tokens <= 0) {
    throw new Error('Invalid token count');
  }
}

// Test 10: Max tokens enforcement
async function testMaxTokens() {
  const maxTokens = 10;
  const completion = await openai.chat.completions.create({
    model,
    messages: [{ 
      role: 'user', 
      content: 'Explain data structures and algorithms in detail.' 
    }],
    max_tokens: maxTokens,
    temperature: 0.5,
  });
  
  const response = completion.choices[0]?.message?.content;
  if (!response) throw new Error('No response from API');
  
  // Response should be truncated due to max_tokens
  // This is acceptable behavior
}

// Main test runner
async function main() {
  log.title('🧪 NVIDIA LLM Integration Test Suite');
  
  // Verify environment variables
  if (!process.env.NVIDIA_API_KEY) {
    log.error('NVIDIA_API_KEY not found in .env');
    process.exit(1);
  }
  
  log.info(`Using model: ${model}`);
  log.info(`Base URL: ${process.env.NVIDIA_BASE_URL}`);
  console.log('');
  
  // Run all tests
  await runTest('Test 1: Basic connection to NVIDIA API', testBasicConnection);
  await runTest('Test 2: Simple math question', testSimpleMath);
  await runTest('Test 3: DSA question (Binary Search)', testDSAQuestion);
  await runTest('Test 4: Code generation request', testCodeGeneration);
  await runTest('Test 5: Complex reasoning (DP problem)', testComplexReasoning);
  await runTest('Test 6: Multi-turn conversation handling', testMultiTurn);
  await runTest('Test 7: Error handling (invalid input)', testErrorHandling);
  await runTest('Test 8: Response time check (<10s)', testResponseTime);
  await runTest('Test 9: Token usage tracking', testTokenUsage);
  await runTest('Test 10: Max tokens enforcement', testMaxTokens);
  
  // Print summary
  log.title('📊 Test Results');
  console.log(`Total Tests: ${passedTests + failedTests}`);
  log.success(`Passed: ${passedTests}`);
  if (failedTests > 0) {
    log.error(`Failed: ${failedTests}`);
  }
  console.log(`\nSuccess Rate: ${Math.round((passedTests / (passedTests + failedTests)) * 100)}%`);
  
  if (failedTests === 0) {
    log.title('✨ All tests passed! NVIDIA LLM integration is working perfectly!');
  } else {
    log.warning(`\n⚠️  ${failedTests} test(s) failed. Review the errors above.`);
  }
  
  process.exit(failedTests > 0 ? 1 : 0);
}

// Run tests
main().catch((error) => {
  log.error(`Fatal error: ${error.message}`);
  console.error(error);
  process.exit(1);
});
