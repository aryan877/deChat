import { DeAgent } from "../../agent/index.js";
import { SonicDocsSearchResponse } from "../../types/knowledge.js";
import { DataAPIClient } from "@datastax/astra-db-ts";
import OpenAI from "openai";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const COLLECTION_NAME = "docs_embeddings";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Initialize AstraDB client
const initializeAstraDB = () => {
  const token = process.env.ASTRA_DB_TOKEN;
  const endpoint = process.env.ASTRA_DB_API_ENDPOINT;

  if (!token || !endpoint) {
    throw new Error(
      "ASTRA_DB_TOKEN or ASTRA_DB_API_ENDPOINT is not defined in environment variables"
    );
  }

  const client = new DataAPIClient(token);
  const db = client.db(endpoint);
  return db;
};

// Function to create embedding using OpenAI
async function createEmbedding(text: string) {
  try {
    const response = await openai.embeddings.create({
      input: text,
      model: "text-embedding-3-small",
    });

    if (!response.data?.[0]?.embedding) {
      throw new Error(
        "Failed to create embedding: No data returned from OpenAI"
      );
    }

    return response.data[0].embedding;
  } catch (error) {
    console.error("Error creating embedding:", error);
    throw error;
  }
}

// Function to perform vector search
async function performVectorSearch(query: string, limit = 5) {
  try {
    const db = initializeAstraDB();
    const collection = db.collection(COLLECTION_NAME);

    // Generate embedding for the query using OpenAI
    const queryVector = await createEmbedding(query);

    const cursor = collection
      .find({})
      .sort({
        $vector: queryVector,
      })
      .limit(limit)
      .includeSimilarity(true);

    // Convert cursor to array
    const results = await cursor.toArray();

    // Format the results with more content for context
    const formattedResults = results.map((doc) => ({
      id: doc.id || `doc-${Date.now()}`,
      title: doc.title || "Untitled Document",
      content: doc.content || "",
    }));

    return formattedResults;
  } catch (error) {
    console.error("Error in vector search:", error);
    throw error;
  }
}

// Function to generate answer using OpenAI based on search results
async function generateAnswer(question: string, searchResults: any[]) {
  try {
    // Extract content from search results to use as context
    const context = searchResults
      .map(
        (doc, index) =>
          `[Document ${index + 1}] ${doc.title || "Untitled"}\n${doc.content || "No content available"}`
      )
      .join("\n\n");

    // Generate answer using OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant that answers questions about Sonic blockchain. Use the provided context to answer the user's question. If the answer is not in the context, say that you don't know. Keep your answers concise and to the point.",
        },
        {
          role: "user",
          content: `Context:\n${context}\n\nQuestion: ${question}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const message = completion.choices?.[0]?.message;
    if (!message?.content) {
      throw new Error("Failed to generate answer: No response from OpenAI");
    }

    return message.content;
  } catch (error) {
    console.error("Error generating answer:", error);
    throw error;
  }
}

/**
 * Search for information in Sonic documentation
 * @param agent DeAgent instance
 * @param query Search query string
 * @param limit Maximum number of results to return (default: 5)
 * @returns Sonic docs search results with AI-generated answer
 */
export async function sonicDocsSearch(
  agent: DeAgent,
  query: string,
  limit: number = 5
): Promise<SonicDocsSearchResponse> {
  if (!query) {
    throw new Error("Search query is required");
  }

  try {
    // Perform vector search to find relevant documents
    const searchResults = await performVectorSearch(query, limit);

    if (!searchResults || searchResults.length === 0) {
      return {
        success: true,
        count: 0,
        data: [],
        answer:
          "I couldn't find any information about that in the Sonic documentation.",
      };
    }

    // Generate answer
    const answer = await generateAnswer(query, searchResults);

    return {
      success: true,
      count: searchResults.length,
      data: [],
      answer,
    };
  } catch (error) {
    console.error("Error searching Sonic docs:", error);
    throw new Error(
      `Failed to search Sonic documentation: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}
