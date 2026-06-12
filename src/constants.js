import dotenv from 'dotenv';
dotenv.config({path: '../.env'});

export const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME;
export const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
export const PINECONE_ENVIRONMENT = process.env.PINECONE_ENVIRONMENT;
export const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
export const CHUNK_OVERLAP = 200;
export const CHUNK_SIZE = 1000;