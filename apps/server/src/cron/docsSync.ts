import cron from "node-cron";
import mongoose from "mongoose";
import fs from "fs";
import dotenv from "dotenv";
import FirecrawlApp from "@mendable/firecrawl-js";
import { DataAPIClient } from "@datastax/astra-db-ts";
import OpenAI from "openai";
import {
  getLastSuccessfulDocsSync,
  recordDocsSync,
} from "../models/DocsSync.js";

// Load environment variables
dotenv.config();

// Constants
const CRAWL_RESULTS_FILE = "./sonic_docs_crawl_results.json";
const COLLECTION_NAME = "docs_embeddings";
const MINIMUM_SYNC_INTERVAL = 3 * 24 * 60 * 60 * 1000; // 3 days in milliseconds

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ===== DATABASE CONNECTION =====

const ensureConnection = async () => {
  // If already connected, return
  if (mongoose.connection.readyState === 1) {
    return;
  }

  const MONGODB_URI =
    process.env.NODE_ENV === "production"
      ? process.env.MONGODB_PROD_URI
      : process.env.MONGODB_TEST_URI || "mongodb://localhost:27017/dechat-test";

  if (!MONGODB_URI) {
    throw new Error("MongoDB URI is not defined");
  }

  try {
    await mongoose.connect(MONGODB_URI);
    console.log(
      `📦 Connected to MongoDB (${process.env.NODE_ENV} environment)`
    );
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
};

// ===== FIRECRAWL FUNCTIONS =====

// Initialize Firecrawl with API key from .env
const initializeFirecrawl = () => {
  const apiKey = process.env.FIRECRAWL_API_KEY;
  if (!apiKey) {
    throw new Error(
      "FIRECRAWL_API_KEY is not defined in environment variables"
    );
  }
  return new FirecrawlApp({
    apiKey,
  });
};

// Function to crawl website and save results
async function crawlAndSaveData() {
  try {
    console.log("🔍 Starting Sonic docs crawl process...");

    const app = initializeFirecrawl();
    const crawlResponse = await app.crawlUrl("https://docs.soniclabs.com", {
      limit: 100,
      scrapeOptions: {
        formats: ["markdown", "html"],
      },
    });

    if (!crawlResponse.success) {
      throw new Error(`Failed to crawl: ${crawlResponse.error}`);
    }

    // Save crawl results to file
    fs.writeFileSync(
      CRAWL_RESULTS_FILE,
      JSON.stringify(crawlResponse, null, 2)
    );
    console.log(`📄 Crawl results saved to ${CRAWL_RESULTS_FILE}`);

    return crawlResponse;
  } catch (error) {
    console.error("❌ Error during crawl:", error);
    throw error;
  }
}

// Function to load crawl data from file
function loadCrawlData() {
  try {
    console.log(`📂 Loading crawl results from ${CRAWL_RESULTS_FILE}`);
    if (!fs.existsSync(CRAWL_RESULTS_FILE)) {
      console.log("❌ Crawl results file not found");
      return null;
    }
    const data = fs.readFileSync(CRAWL_RESULTS_FILE, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error(
      `❌ Error loading crawl data: ${error instanceof Error ? error.message : String(error)}`
    );
    return null;
  }
}

// ===== ASTRA DB FUNCTIONS =====

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
    return response.data[0]?.embedding;
  } catch (error) {
    console.error("❌ Error creating embedding:", error);
    throw error;
  }
}

// Function to delete all documents from the collection
async function deleteAllDocuments() {
  try {
    console.log("🔌 Connecting to AstraDB...");
    const db = initializeAstraDB();
    const colls = await db.listCollections();
    console.log("✅ Connected to AstraDB");

    // Check if collection exists
    const collectionExists = colls.some(
      (coll: any) => coll.name === COLLECTION_NAME
    );

    if (!collectionExists) {
      console.log(
        `ℹ️ Collection ${COLLECTION_NAME} does not exist. Nothing to delete.`
      );
      return;
    }

    console.log(
      `🗑️ Deleting all documents from collection: ${COLLECTION_NAME}`
    );

    // Delete all documents
    const collection = db.collection(COLLECTION_NAME);
    const result = await collection.deleteMany({});
    console.log(`✅ Deleted documents from ${COLLECTION_NAME}`);

    return true;
  } catch (error) {
    console.error("❌ Error deleting documents:", error);
    throw error;
  }
}

// Function to store data in AstraDB
async function storeInAstraDB(crawlData: any) {
  try {
    console.log("🔌 Connecting to AstraDB...");
    const db = initializeAstraDB();
    const colls = await db.listCollections();
    console.log("✅ Connected to AstraDB");

    // Create collection if it doesn't exist
    const collectionExists = colls.some(
      (coll: any) => coll.name === COLLECTION_NAME
    );

    if (!collectionExists) {
      console.log(`🆕 Creating collection: ${COLLECTION_NAME}`);
      await db.createCollection(COLLECTION_NAME, {
        vector: { dimension: 1536, metric: "cosine" },
      });
    } else {
      console.log(
        `ℹ️ Collection ${COLLECTION_NAME} already exists, skipping creation.`
      );
    }

    const collection = db.collection(COLLECTION_NAME);

    // Process and store each document from the crawl
    console.log("💾 Storing documents in AstraDB...");

    // The crawl data structure has documents in crawlData.data
    const documents = crawlData.data || [];

    console.log(`📊 Found ${documents.length} documents to store`);

    // Track success and failures
    let successCount = 0;
    let failureCount = 0;

    for (const doc of documents) {
      // Extract and truncate content if needed (AstraDB has an 8000 byte limit)
      const content = doc.markdown || doc.content || "";
      const truncatedContent =
        content.length > 7500
          ? content.substring(0, 7500) + "... (truncated)"
          : content;

      try {
        // Generate embedding using OpenAI
        const embedding = await createEmbedding(truncatedContent);

        // Extract relevant data
        const documentData = {
          id:
            doc.metadata?.scrapeId ||
            `doc-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          url: doc.metadata?.sourceURL || doc.metadata?.url || "",
          title: doc.metadata?.title || "",
          content: truncatedContent,
          $vector: embedding,
          metadata: {
            source: "firecrawl",
            crawlDate: new Date().toISOString(),
            originalMetadata: doc.metadata || {},
          },
        };

        // Insert document into AstraDB
        await collection.insertOne(documentData);
        successCount++;
      } catch (error) {
        console.error(
          `❌ Error storing document: ${doc.metadata?.title || "Unknown"}`,
          error
        );
        failureCount++;
      }
    }

    console.log(
      `✅ Completed storing documents. Success: ${successCount}, Failures: ${failureCount}`
    );
    return { successCount, failureCount };
  } catch (error) {
    console.error("❌ Error storing in AstraDB:", error);
    throw error;
  }
}

// ===== MAIN SYNC FUNCTION =====

const performDocsSync = async () => {
  let documentsProcessed = 0;
  let usedCachedData = false;

  try {
    await ensureConnection();
    console.log("🔄 Starting Sonic docs sync...");

    // Step 1: Delete all existing documents
    console.log("🗑️ Deleting all existing documents...");
    await deleteAllDocuments();

    // Step 2: Crawl or load data
    let crawlData;
    try {
      crawlData = await crawlAndSaveData();
    } catch (error) {
      console.error(
        "❌ Firecrawl failed, attempting to use cached data:",
        error
      );
      crawlData = loadCrawlData();

      if (!crawlData) {
        throw new Error("Failed to crawl and no cached data available");
      }

      usedCachedData = true;
      console.log("⚠️ Using cached crawl data as fallback");
    }

    // Step 3: Store data in AstraDB
    console.log("💾 Storing data in AstraDB...");
    const result = await storeInAstraDB(crawlData);
    documentsProcessed = result.successCount;

    // Record successful sync
    await recordDocsSync(documentsProcessed, "success", usedCachedData);

    console.log("✅ Sonic docs sync completed successfully");
    return { success: true, documentsProcessed, usedCachedData };
  } catch (error) {
    console.error("❌ Error in Sonic docs sync:", error);
    // Record failed sync
    await recordDocsSync(
      documentsProcessed,
      "failed",
      usedCachedData,
      error instanceof Error ? error.message : "Unknown error"
    );
    return { success: false, error };
  }
};

export const startDocsSyncCron = async () => {
  try {
    // Check if we need to perform an initial sync
    await ensureConnection();

    // Check if the crawl results file exists
    const crawlFileExists = fs.existsSync(CRAWL_RESULTS_FILE);
    const lastSync = await getLastSuccessfulDocsSync();

    // If no previous successful sync exists or no crawl file exists, perform initial sync
    if (!lastSync || !crawlFileExists) {
      console.log(
        "🔄 No previous Sonic docs sync or crawl file found. Performing initial sync..."
      );
      await performDocsSync();
    } else {
      console.log(
        `🔄 Last successful Sonic docs sync: ${lastSync.toISOString()}`
      );
    }
  } catch (error) {
    console.error("❌ Error checking Sonic docs sync status:", error);
  }

  // Schedule regular sync every 3 days (at midnight)
  cron.schedule("0 0 */3 * *", async () => {
    console.log("🔄 Checking Sonic docs sync status...");

    try {
      await ensureConnection();

      // Check last successful sync
      const lastSync = await getLastSuccessfulDocsSync();
      const now = new Date();

      if (
        lastSync &&
        now.getTime() - lastSync.getTime() < MINIMUM_SYNC_INTERVAL
      ) {
        console.log("⏭️ Skipping sync - last successful sync was too recent");
        return;
      }

      await performDocsSync();
    } catch (error) {
      console.error("❌ Error in Sonic docs sync cron job:", error);
    }
  });

  console.log("🕒 Sonic docs sync cron job scheduled (runs every 3 days)");
};
