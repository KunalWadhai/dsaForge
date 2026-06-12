import dotenv, { config } from 'dotenv';
dotenv.config();
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import {Pinecone} from '@pinecone-database/pinecone';
import {PineconeStore} from '@langchain/pinecone';
import readLineSync from 'readline-sync';
import * as CONSTANTS from './constants.js';
import { GoogleGenAI } from '@google/genai';
import { querystring } from '@pinecone-database/pinecone/dist/pinecone-generated-ts-fetch/control/runtime.js';

const History = [];

async function transformQuery(question){
    const ai = new GoogleGenAI({});
    History.push({
        role: 'user',
        parts: [{text: question}]
    });

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: History,
        config: {
            systemInstruction: `
                Transform user question into a meaningful and specific query for a
                retrieval system. Make it more specific and meaningful

                Question: ${question}
            `
        }
    });
    History.pop();
    console.log("transformed query : ", response.text);
    return response.text;
}


async function chatting(question){
    const embeddings = new GoogleGenerativeAIEmbeddings({
        apiKey: CONSTANTS.GEMINI_API_KEY,
        model: 'gemini-embedding-001',
    })
    const queries = await transformQuery(question);

    const queryVector = await embeddings.embedQuery(queries);

    // make connection with pinecone vector db
    const pinecone = new Pinecone();
    const pineconeIndex = pinecone.Index(CONSTANTS.PINECONE_INDEX_NAME);
    
    // search the query in the pinecone 
    const searchResult = await pineconeIndex.query({
        topK: 10,
        vector: queryVector,
        includeMetadata: true,
    });
   // console.log('searchResult : ', searchResult)
    const context = searchResult.matches.map(
        (match) => match.metadata.text
    ).join("\n\n---\n\n");
    
    // e.g context would look like this= >
    //  what is kvl 
    //
    // 
    // what is avl
    const ai = new GoogleGenAI({});

    History.push({
        role: 'user',
        parts: [{text: queries}],
    });

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: History,
        config: {
            systemInstruction: `
                You have to behave like a master level expert in Data Structures 
                and Algorithams, you will be given a context and relevant information 
                along with user question. 
                Your task is to answer the user's question based only on the provided
                context.
                If the answer is not in the context, you must say you couldn't provide
                the in the given context. 

                Keep your answer clear, concise, conceptual with strong understanding

                Context: ${context}
            `
        }
    });
    
    History.push({
        role: 'model', 
        parts: [{text: response.text}],
    });
    console.log('Response : ', response.text);
}

async function main() {
    const userQuestion = readLineSync.question("Ask something ---> ");
    await chatting(userQuestion);
    await main();
}
await main();