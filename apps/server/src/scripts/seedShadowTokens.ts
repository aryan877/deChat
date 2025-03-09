import dotenv from "dotenv";
import mongoose from "mongoose";
import axios from "axios";
import { Token, ensureIndexes } from "../models/Token.js";
import { recordSync } from "../models/TokenSync.js";

dotenv.config();

interface TokenData {
  name: string;
  address: string;
  symbol: string;
  decimals: number;
  logo: string | null;
}

interface TokenList {
  name: string;
  tokens: TokenData[][];
}

const GITHUB_BASE_URL =
  "https://raw.githubusercontent.com/Shadow-Exchange/shadow-assets/main";
const LOGO_BASE_PATH = "/blockchains/sonic/assets";

const connectDB = async () => {
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
    return true;
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
};

const fetchTokenLogo = async (address: string): Promise<string | null> => {
  try {
    const logoUrl = `${GITHUB_BASE_URL}${LOGO_BASE_PATH}/${address}/logo.png`;
    const response = await axios.get(logoUrl, {
      responseType: "arraybuffer",
      validateStatus: (status) => status === 200, // Only accept 200
    });

    // If we get here, the logo exists
    return logoUrl;
  } catch (error) {
    console.log(`⚠️ No logo found for token ${address}`);
    return null;
  }
};

export const fetchTokenList = async (): Promise<TokenData[]> => {
  try {
    const tokenListUrl =
      "https://raw.githubusercontent.com/Shadow-Exchange/shadow-assets/main/blockchains/sonic/tokenlist.json";

    console.log(`🔍 Fetching token list from: ${tokenListUrl}`);
    const response = await axios.get(tokenListUrl);
    const data = response.data as TokenList;

    // Flatten the nested array structure
    const flattenedTokens = data.tokens.flat();

    // Process tokens and fetch logos
    const processedTokens = await Promise.all(
      flattenedTokens.map(async (token) => {
        // Handle empty symbol
        if (!token.symbol || token.symbol.trim() === "") {
          console.log(
            `⚠️ Token with empty symbol found: ${token.name}. Using name as symbol.`
          );
          token.symbol = token.name.substring(0, 10);
        }

        // Fetch logo
        const logo = await fetchTokenLogo(token.address);
        return {
          ...token,
          logo,
        };
      })
    );

    console.log(`📋 Fetched ${processedTokens.length} tokens`);
    return processedTokens;
  } catch (error) {
    console.error("Error fetching token list:", error);
    throw error;
  }
};

// Insert tokens into the database
export const seedTokens = async (tokens: TokenData[]): Promise<number> => {
  try {
    // Get existing tokens for comparison
    const existingTokens = await Token.find({}, { address: 1, logo: 1 }).lean();
    const existingMap = new Map(existingTokens.map((t) => [t.address, t]));

    // Prepare batch operations
    const operations = tokens.map((token) => ({
      updateOne: {
        filter: { address: token.address },
        update: {
          $set: {
            ...token,
            // Preserve existing logo if new one is null and old one exists
            logo: token.logo || existingMap.get(token.address)?.logo || null,
          },
        },
        upsert: true,
      },
    }));

    // Execute batch update
    const result = await Token.bulkWrite(operations);
    const updatedCount =
      (result.upsertedCount || 0) + (result.modifiedCount || 0);

    console.log(`✅ Successfully processed ${updatedCount} tokens`);
    return updatedCount;
  } catch (error) {
    console.error("Error seeding tokens:", error);
    throw error;
  }
};

const main = async () => {
  try {
    // Connect to the database
    await connectDB();

    // Fetch tokens from GitHub
    const tokens = await fetchTokenList();

    // Seed tokens to database
    const updatedCount = await seedTokens(tokens);

    // Ensure indexes are created
    await ensureIndexes();

    // Record successful sync
    await recordSync(updatedCount, "success");

    console.log("🎉 Token seeding completed successfully");
  } catch (error) {
    console.error("Error in main function:", error);
    // Record failed sync
    await recordSync(
      0,
      "failed",
      error instanceof Error ? error.message : "Unknown error"
    );
  } finally {
    // Only disconnect if running as standalone script
    if (process.argv[1]?.includes("seedShadowTokens")) {
      await mongoose.disconnect();
      console.log("📦 Disconnected from MongoDB");
    }
  }
};

// Only run if called directly
if (process.argv[1]?.includes("seedShadowTokens")) {
  main();
}
