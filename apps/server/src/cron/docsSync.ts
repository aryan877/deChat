import { DataAPIClient } from "@datastax/astra-db-ts";
import FirecrawlApp from "@mendable/firecrawl-js";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cron from "node-cron";
import OpenAI from "openai";
import {
  getLastSuccessfulDocsSync,
  recordDocsSync,
} from "../models/DocsSync.js";

// Load environment variables
dotenv.config();

// Constants
const COLLECTION_NAME = "docs_embeddings";
const MINIMUM_SYNC_INTERVAL = 3 * 24 * 60 * 60 * 1000; // 3 days in milliseconds
const FIRECRAWL_TIMEOUT = parseInt(
  process.env.FIRECRAWL_TIMEOUT || "60000",
  10
); // 60 seconds default timeout
const MAX_FIRECRAWL_RETRIES = parseInt(
  process.env.MAX_FIRECRAWL_RETRIES || "3",
  10
); // Default 3 retries

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

// Function to crawl website
async function crawlAndSaveData() {
  try {
    console.log("🔍 Starting Sonic docs crawl process...");

    const app = initializeFirecrawl();

    // Track retry attempts
    let retryCount = 0;
    let crawlResponse = null;
    let lastError = null;

    // Retry logic for the crawl operation
    while (retryCount < MAX_FIRECRAWL_RETRIES) {
      try {
        console.log(
          `🔄 Attempt ${retryCount + 1}/${MAX_FIRECRAWL_RETRIES} to crawl docs...`
        );

        // Use the timeout parameter as specified in the Firecrawl documentation
        crawlResponse = await app.crawlUrl("https://docs.soniclabs.com", {
          limit: 100,
          scrapeOptions: {
            formats: ["markdown", "html"],
            timeout: FIRECRAWL_TIMEOUT, // Add timeout from configuration
          },
        });

        // Check if the crawl was successful
        if (crawlResponse && crawlResponse.success) {
          console.log(
            `✅ Crawl completed successfully on attempt ${retryCount + 1}`
          );
          return crawlResponse;
        } else {
          lastError = new Error(
            `Failed to crawl: ${crawlResponse?.error || "Unknown error"}`
          );
          console.warn(
            `⚠️ Crawl attempt ${retryCount + 1} failed: ${lastError.message}`
          );
        }
      } catch (error) {
        lastError = error;
        console.warn(
          `⚠️ Exception during crawl attempt ${retryCount + 1}:`,
          error
        );
      }

      // Increment retry counter and wait before retrying
      retryCount++;
      if (retryCount < MAX_FIRECRAWL_RETRIES) {
        const waitTime = retryCount * 3000; // Exponential backoff (3s, 6s, 9s, etc.)
        console.log(`⏳ Waiting ${waitTime / 1000}s before retry...`);
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
    }

    // If we got here, all retries failed
    throw (
      lastError ||
      new Error("All Firecrawl crawl attempts failed with unknown errors")
    );
  } catch (error) {
    console.error("❌ Error during crawl:", error);
    throw error;
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

// Function to check if the collection exists and count documents
async function countDocumentsInAstraDB() {
  try {
    console.log("🔌 Connecting to AstraDB to check document count...");
    const db = initializeAstraDB();
    const colls = await db.listCollections();

    // Check if collection exists
    const collectionExists = colls.some(
      (coll: any) => coll.name === COLLECTION_NAME
    );

    if (!collectionExists) {
      console.log(`ℹ️ Collection ${COLLECTION_NAME} does not exist. Count: 0`);
      return 0;
    }

    // Count documents
    const collection = db.collection(COLLECTION_NAME);

    // AstraDB doesn't have a direct count method, so we'll use find with a limit
    // to check if there are any documents
    const result = await collection.find({}, { limit: 1 }).toArray();
    const count = result.length;

    console.log(`📊 Document count in ${COLLECTION_NAME}: ${count}`);
    return count;
  } catch (error) {
    console.error("❌ Error counting documents:", error);
    throw error;
  }
}

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

    // Step 1: Crawl data first - this is safer
    console.log("🔍 Starting data crawl...");
    let crawlData;
    try {
      crawlData = await crawlAndSaveData();
    } catch (error) {
      console.error("❌ Firecrawl failed:", error);
      // Record failed sync with specific error
      await recordDocsSync(
        0,
        "failed",
        false,
        `Firecrawl API error: ${error instanceof Error ? error.message : String(error)}`
      );
      console.log("⚠️ Skipping docs sync due to Firecrawl API failure");
      return { success: false, error, skipped: true };
    }

    // Only proceed with deletion if crawl was successful
    console.log("✅ Crawl successful. Now safe to delete existing documents.");

    // Step 2: Delete existing documents (only after successful crawl)
    console.log("🗑️ Deleting existing documents...");
    try {
      await deleteAllDocuments();
    } catch (error) {
      console.error("❌ Error deleting documents:", error);
      // If deletion fails, record a failed sync but don't throw - we still want to try processing the crawled data
      await recordDocsSync(
        0,
        "failed",
        usedCachedData,
        `Failed to delete existing documents: ${error instanceof Error ? error.message : String(error)}`
      );
      return { success: false, error };
    }

    // Step 3: Store new data in AstraDB
    console.log("💾 Storing data in AstraDB...");
    try {
      const result = await storeInAstraDB(crawlData);
      documentsProcessed = result.successCount;

      // Record successful sync
      await recordDocsSync(documentsProcessed, "success", usedCachedData);

      console.log("✅ Sonic docs sync completed successfully");
      return { success: true, documentsProcessed, usedCachedData };
    } catch (error) {
      console.error("❌ Error storing data in AstraDB:", error);
      // Record failed sync
      await recordDocsSync(
        documentsProcessed,
        "failed",
        usedCachedData,
        `Failed to store data: ${error instanceof Error ? error.message : String(error)}`
      );
      return { success: false, error };
    }
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

    // Check when the last successful sync was performed
    const lastSync = await getLastSuccessfulDocsSync();

    // Check if there are documents in AstraDB
    const documentCount = await countDocumentsInAstraDB();

    // If no previous successful sync exists or there are no documents, perform initial sync
    if (!lastSync || documentCount === 0) {
      console.log(
        `🔄 ${!lastSync ? "No previous Sonic docs sync found" : "No documents found in AstraDB"}. Performing initial sync...`
      );
      await performDocsSync();
    } else {
      console.log(
        `🔄 Last successful Sonic docs sync: ${lastSync.toISOString()}`
      );
      console.log(`📊 Current document count in AstraDB: ${documentCount}`);

      // Check if it's time for a new sync based on the minimum interval
      const now = new Date();
      const timeSinceLastSync = now.getTime() - lastSync.getTime();

      if (timeSinceLastSync >= MINIMUM_SYNC_INTERVAL) {
        console.log(
          `🔄 Minimum sync interval (${MINIMUM_SYNC_INTERVAL / (24 * 60 * 60 * 1000)} days) has passed. Performing sync...`
        );
        await performDocsSync();
      } else {
        console.log(
          `⏳ Not enough time has passed since last sync. Next sync in ${
            (MINIMUM_SYNC_INTERVAL - timeSinceLastSync) / (24 * 60 * 60 * 1000)
          } days.`
        );
      }
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

      // Check if there are documents in AstraDB
      const documentCount = await countDocumentsInAstraDB();

      // Sync if the collection is empty or enough time has passed
      if (documentCount === 0) {
        console.log("⚠️ No documents found in AstraDB. Performing sync...");
        await performDocsSync();
        return;
      }

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
