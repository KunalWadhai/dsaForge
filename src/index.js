
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { Pinecone } from '@pinecone-database/pinecone';
import { PineconeStore } from '@langchain/pinecone'
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import * as CONSTANTS from './constants.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PDF_PATH = `${__dirname}/files/DSA-revision-guide.pdf`;

async function indexDocument(){
    const pdfLoader = new PDFLoader(PDF_PATH);
    const rawDocs = await pdfLoader.load();
    //console.log(JSON.stringify(rawDocs, null, 2));
    console.log(rawDocs.length)

    const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: CONSTANTS.CHUNK_SIZE,
        chunkOverlap: CONSTANTS.CHUNK_OVERLAP,
    });
    const chunkedDocs = await textSplitter.splitDocuments(rawDocs);
  //console.log(JSON.stringify(chunkedDocs.slice(0, 2), null, 2));
    console.log('Chunks Documents : ', chunkedDocs.length)

    const embeddings = new GoogleGenerativeAIEmbeddings({
        apiKey: CONSTANTS.GEMINI_API_KEY,
        model: 'gemini-embedding-001',
    });
    console.log('Vector Embedding Model Configured!', embeddings);


    const pinecone = new Pinecone();
    const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME);
    console.log('Pinecone Database Configured Successfully')

    // Batch upsert to avoid free-tier rate limit (100 req/min)
    const BATCH_SIZE = 50;
    const store = await PineconeStore.fromExistingIndex(embeddings, {
        pineconeIndex,
    });

    for (let i = 0; i < chunkedDocs.length; i += BATCH_SIZE) {
        const batch = chunkedDocs.slice(i, i + BATCH_SIZE);
        console.log(`Upserting batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(chunkedDocs.length / BATCH_SIZE)} (${batch.length} docs)...`);
        await store.addDocuments(batch);

        // Wait 60s between batches to respect rate limit
        if (i + BATCH_SIZE < chunkedDocs.length) {
            console.log('Waiting 60s for rate limit...');
            await new Promise(r => setTimeout(r, 60000));
        }
    }

    console.log("Documents successfully uploaded to pinecone")
}

await indexDocument();