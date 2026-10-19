import path from "node:path";
import { fileURLToPath } from "node:url";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { Pinecone } from "@pinecone-database/pinecone";
import { PineconeStore } from "@langchain/pinecone";
import { env } from "../../config/env.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const configuredPdfPath = path.resolve(process.cwd(), env.PDF_PATH);
const fallbackPdfPath = path.resolve(__dirname, "../../../files/DSA-revision-guide.pdf");
const PDF_PATH = configuredPdfPath;

async function indexDocument() {
  if (!env.GEMINI_API_KEY || !env.PINECONE_API_KEY || !env.PINECONE_INDEX_NAME) {
    throw new Error("Set GEMINI_API_KEY, PINECONE_API_KEY, and PINECONE_INDEX_NAME before indexing.");
  }
  let pdfPath = PDF_PATH;
  try { await (await import("node:fs/promises")).access(pdfPath); }
  catch {
    try { await (await import("node:fs/promises")).access(fallbackPdfPath); pdfPath = fallbackPdfPath; }
    catch { throw new Error(`PDF not found. Place DSA-revision-guide.pdf in ./files or set PDF_PATH. Tried: ${PDF_PATH}`); }
  }

  console.log("Loading PDF:", pdfPath);
  const loader = new PDFLoader(pdfPath);
  const rawDocs = await loader.load();
  console.log("PDF pages:", rawDocs.length);
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: env.CHUNK_SIZE, chunkOverlap: env.CHUNK_OVERLAP,
  });
  const chunkedDocs = await splitter.splitDocuments(rawDocs);
  console.log("Chunks:", chunkedDocs.length);

  const embeddings = new GoogleGenerativeAIEmbeddings({
    apiKey: env.GEMINI_API_KEY, model: env.GEMINI_EMBEDDING_MODEL,
  });
  const pinecone = new Pinecone({ apiKey: env.PINECONE_API_KEY });
  const pineconeIndex = pinecone.Index(env.PINECONE_INDEX_NAME);
  const options = { pineconeIndex };
  if (env.PINECONE_NAMESPACE) options.namespace = env.PINECONE_NAMESPACE;
  const store = await PineconeStore.fromExistingIndex(embeddings, options);

  for (let i = 0; i < chunkedDocs.length; i += env.INGEST_BATCH_SIZE) {
    const batch = chunkedDocs.slice(i, i + env.INGEST_BATCH_SIZE);
    console.log(`Upserting batch ${Math.floor(i / env.INGEST_BATCH_SIZE) + 1}/${Math.ceil(chunkedDocs.length / env.INGEST_BATCH_SIZE)} (${batch.length} chunks)`);
    await store.addDocuments(batch);
    if (i + env.INGEST_BATCH_SIZE < chunkedDocs.length && env.INGEST_BATCH_DELAY_MS > 0) {
      console.log(`Waiting ${env.INGEST_BATCH_DELAY_MS}ms before next batch...`);
      await new Promise(resolve => setTimeout(resolve, env.INGEST_BATCH_DELAY_MS));
    }
  }
  console.log("Document indexing completed.");
}

indexDocument().catch(error => {
  console.error("Document indexing failed:", error);
  process.exitCode = 1;
});
