import dotenv from "dotenv";
import mongoose from "mongoose";
import { ensureIndexes } from "../models/Token.js";

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

const main = async () => {
  try {
    // Connect to the database
    await connectDB();

    // Create indexes
    await ensureIndexes();

    console.log("🎉 Token indexes created successfully");
  } catch (error) {
    console.error("Error creating indexes:", error);
  } finally {
    // Close the database connection
    await mongoose.disconnect();
    console.log("📦 Disconnected from MongoDB");
  }
};

// Run the main function
main();
