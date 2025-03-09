import dotenv from "dotenv";
import mongoose from "mongoose";
import { Token } from "../models/Token.js";

dotenv.config();

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

const checkIndexes = async () => {
  try {
    const indexes = await Token.collection.indexes();
    console.log("Current indexes on Token collection:");
    console.log(JSON.stringify(indexes, null, 2));

    // Check if text index exists
    const textIndex = indexes.find((index) =>
      Object.keys(index.key).some((key) => key === "_fts" || key === "_ftsx")
    );

    if (textIndex) {
      console.log("Text index found:", textIndex);
      console.log("Text index weights:", textIndex.weights);
    } else {
      console.log("No text index found on Token collection");
    }

    return indexes;
  } catch (error) {
    console.error("Error checking indexes:", error);
    throw error;
  }
};

const main = async () => {
  try {
    // Connect to the database
    await connectDB();

    await checkIndexes();

    console.log("🔍 Index check completed");
  } catch (error) {
    console.error("Error in main function:", error);
  } finally {
    // Close the database connection
    await mongoose.disconnect();
    console.log("📦 Disconnected from MongoDB");
  }
};

main();
