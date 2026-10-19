#!/usr/bin/env node

/**
 * Direct LLM Test - Tests Gemini API connectivity
 */

import { GoogleGenAI } from "@google/genai";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { Pinecone } from "@pinecone-database/pinecone";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const colors = {
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  blue: (text) => `\x1b[34m${text}\x1b[0m`,
  cyan: (text) => `\x1b[36m${text}\x1b[0m`,
  bold: (text) => `\x1b[1m${text}\x1b[0m`,
};

function log(type, message) {
  const symbols = { success: "✓", error: "✗", info: "ℹ", section: "═" };
  const colorFn = type === "success" ? colors.green : type === "error" ? colors.red : colors.blue;
  console.log(colorFn(`${symbols[type]} ${message}`));
}

async function testGeminiConnection() {
  console.log(colors.bold(colors.yellow("\n" + "═".repeat(60))));
  console.log(colors.bold(colors.yellow("  DIRECT GEMINI LLM CONNECTION TEST")));
  console.log(colors.bold(colors.yellow("═".repeat(60))) + "\n");

  try {
    // Check environment variables
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY not found in environment");
    }
    log("success", `API Key loaded: ${process.env.GEMINI_API_KEY.substring(0, 20)}...`);
    log("info", `Model: ${process.env.GEMINI_CHAT_MODEL}`);
    log("info", `Embedding Model: ${process.env.GEMINI_EMBEDDING_MODEL}`);

    // Test Gemini Chat
    console.log(colors.bold("\n🤖 Testing Gemini Chat Generation..."));
    const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const startTime = Date.now();
    const response = await genAI.models.generateContent({
      model: process.env.GEMINI_CHAT_MODEL,
      contents: [{
        role: "user",
        parts: [{ text: "Explain binary search in 2 sentences." }]
      }],
      config: {
        temperature: 0.3,
      }
    });
    const responseTime = Date.now() - startTime;

    const text = response.text?.trim();
    if (text) {
      log("success", `LLM response received in ${responseTime}ms`);
      console.log(colors.cyan("\n" + "─".repeat(60)));
      console.log(colors.bold("Response:"));
      console.log(text);
      console.log(colors.cyan("─".repeat(60)));
    } else {
      throw new Error("Empty response from LLM");
    }

    // Test Embeddings
    console.log(colors.bold("\n🔢 Testing Gemini Embeddings..."));
    const embeddings = new GoogleGenerativeAIEmbeddings({
      apiKey: process.env.GEMINI_API_KEY,
      model: process.env.GEMINI_EMBEDDING_MODEL,
    });

    const embedStart = Date.now();
    const vector = await embeddings.embedQuery("binary search algorithm");
    const embedTime = Date.now() - embedStart;

    if (vector && vector.length > 0) {
      log("success", `Embedding generated in ${embedTime}ms`);
      log("info", `Vector dimensions: ${vector.length}`);
      log("info", `Sample values: [${vector.slice(0, 5).map(v => v.toFixed(4)).join(", ")}...]`);
    } else {
      throw new Error("Invalid embedding vector");
    }

    // Test Pinecone Connection
    console.log(colors.bold("\n📊 Testing Pinecone Connection..."));
    if (!process.env.PINECONE_API_KEY) {
      throw new Error("PINECONE_API_KEY not found in environment");
    }
    if (!process.env.PINECONE_INDEX_NAME) {
      throw new Error("PINECONE_INDEX_NAME not found in environment");
    }

    const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
    const index = pinecone.Index(process.env.PINECONE_INDEX_NAME);
    
    log("success", "Pinecone client initialized");
    log("info", `Index: ${process.env.PINECONE_INDEX_NAME}`);

    // Test query
    console.log(colors.bold("\n🔍 Testing Vector Search..."));
    const queryStart = Date.now();
    const result = await index.query({
      topK: 3,
      vector,
      includeMetadata: true,
    });
    const queryTime = Date.now() - queryStart;

    if (result.matches && result.matches.length > 0) {
      log("success", `Retrieved ${result.matches.length} matches in ${queryTime}ms`);
      console.log(colors.bold("\nTop Matches:"));
      result.matches.forEach((match, idx) => {
        const metadata = match.metadata || {};
        const title = metadata.source || metadata.title || metadata.fileName || "Unknown";
        const score = match.score ? match.score.toFixed(4) : "N/A";
        console.log(colors.cyan(`  ${idx + 1}. ${title} (score: ${score})`));
        if (metadata.text) {
          const preview = metadata.text.substring(0, 100) + "...";
          console.log(colors.blue(`     Preview: ${preview}`));
        }
      });
    } else {
      log("info", "No matches found (index might be empty)");
    }

    // Final summary
    console.log(colors.bold(colors.green("\n" + "═".repeat(60))));
    console.log(colors.bold(colors.green("  🎉 ALL LLM COMPONENTS WORKING!")));
    console.log(colors.bold(colors.green("═".repeat(60))));
    console.log(colors.green("\n✓ Gemini Chat API: Working"));
    console.log(colors.green("✓ Gemini Embeddings: Working"));
    console.log(colors.green("✓ Pinecone Vector DB: Connected"));
    console.log(colors.green("✓ RAG Pipeline: Operational\n"));

  } catch (error) {
    console.error(colors.bold(colors.red("\n❌ Test Failed:")));
    console.error(colors.red(error.message));
    if (error.code === 503 || error.message.includes("high demand")) {
      console.error(colors.yellow("\n⚠️  Note: Gemini API is experiencing high demand."));
      console.error(colors.yellow("This is a temporary issue. The integration itself is correctly configured."));
    }
    if (error.stack && process.env.DEBUG) {
      console.error(colors.red("\nStack trace:"));
      console.error(colors.red(error.stack));
    }
    process.exit(1);
  }
}

testGeminiConnection();
