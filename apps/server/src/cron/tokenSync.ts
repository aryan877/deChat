import cron from "node-cron";
import mongoose from "mongoose";
import { fetchTokenList, seedTokens } from "../scripts/seedShadowTokens.js";
import { ensureIndexes } from "../models/Token.js";
import { getLastSuccessfulSync, recordSync } from "../models/TokenSync.js";

const MINIMUM_SYNC_INTERVAL = 12 * 60 * 60 * 1000; // 12 hours in milliseconds

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

// Extract sync logic to a separate function to avoid duplication
const performTokenSync = async () => {
  try {
    await ensureConnection();
    console.log("🔄 Starting token sync...");

    // Fetch and seed tokens
    const tokens = await fetchTokenList();
    const updatedCount = await seedTokens(tokens);

    // Ensure indexes
    await ensureIndexes();

    // Record successful sync
    await recordSync(updatedCount, "success");

    console.log("✅ Token sync completed successfully");
  } catch (error) {
    console.error("❌ Error in token sync:", error);
    // Record failed sync
    await recordSync(
      0,
      "failed",
      error instanceof Error ? error.message : "Unknown error"
    );
  }
};

export const startTokenSyncCron = async () => {
  try {
    // Check if we need to perform an initial sync
    await ensureConnection();
    const lastSync = await getLastSuccessfulSync();

    // If no previous successful sync exists, perform initial sync
    if (!lastSync) {
      console.log(
        "🔄 No previous token sync found. Performing initial sync..."
      );
      await performTokenSync();
    } else {
      console.log(`🔄 Last successful token sync: ${lastSync.toISOString()}`);
    }
  } catch (error) {
    console.error("❌ Error checking token sync status:", error);
  }

  // Schedule regular sync
  cron.schedule("0 0 * * *", async () => {
    console.log("🔄 Checking token sync status...");

    try {
      await ensureConnection();

      // Check last successful sync
      const lastSync = await getLastSuccessfulSync();
      const now = new Date();

      if (
        lastSync &&
        now.getTime() - lastSync.getTime() < MINIMUM_SYNC_INTERVAL
      ) {
        console.log("⏭️ Skipping sync - last successful sync was too recent");
        return;
      }

      await performTokenSync();
    } catch (error) {
      console.error("❌ Error in token sync cron job:", error);
    }
  });

  console.log("🕒 Token sync cron job scheduled");
};
