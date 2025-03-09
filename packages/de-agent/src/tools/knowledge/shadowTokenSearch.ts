import { DeAgent } from "../../agent/index.js";
import mongoose from "mongoose";
import {
  ShadowToken,
  ShadowTokenSearchResponse,
} from "../../types/knowledge.js";

const tokenSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      index: true,
    },
    address: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    symbol: {
      type: String,
      required: true,
      index: true,
    },
    decimals: {
      type: Number,
      required: true,
    },
    logo: {
      type: String,
      required: false,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Create text indexes for better search capabilities
tokenSchema.index(
  { name: "text", symbol: "text" },
  { weights: { symbol: 10, name: 5 } }
);

// Connect to MongoDB
async function connectToMongoDB(): Promise<void> {
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
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
}

// Get or create the Token model
function getTokenModel(): mongoose.Model<ShadowToken> {
  try {
    return mongoose.model<ShadowToken>("Token");
  } catch {
    // If model doesn't exist, create it
    return mongoose.model<ShadowToken>("Token", tokenSchema);
  }
}

/**
 * Search for Shadow tokens by name or symbol
 * @param agent DeAgent instance
 * @param query Search query string
 * @param limit Maximum number of results to return (default: 3)
 * @returns Token search results
 */
export async function shadowTokenSearch(
  agent: DeAgent,
  query: string,
  limit: number = 3
): Promise<ShadowTokenSearchResponse> {
  if (!query) {
    throw new Error("Search query is required");
  }

  try {
    // Connect to MongoDB
    await connectToMongoDB();

    // Get the Token model
    const TokenModel = getTokenModel();

    // First try text search if indexes exist
    try {
      const textSearchTokens = await TokenModel.find(
        { $text: { $search: query } },
        { score: { $meta: "textScore" } }
      )
        .sort({ score: { $meta: "textScore" } })
        .limit(limit)
        .lean();

      if (textSearchTokens.length > 0) {
        return {
          success: true,
          count: textSearchTokens.length,
          data: textSearchTokens,
        };
      }
    } catch (error) {
      console.warn("Text search failed, falling back to regex search:", error);
      // Continue to regex search as fallback
    }

    // Fallback: Search for tokens by name or symbol using regex for case-insensitive search
    const tokens = await TokenModel.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { symbol: { $regex: query, $options: "i" } },
      ],
    })
      .limit(limit)
      .sort({ symbol: 1 })
      .lean();

    return {
      success: true,
      count: tokens.length,
      data: tokens,
    };
  } catch (error) {
    console.error("Error searching tokens:", error);
    throw new Error(
      `Failed to search tokens: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}
