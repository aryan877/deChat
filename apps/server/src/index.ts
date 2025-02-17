import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Configure dotenv
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

// Log environment configuration
console.log("Environment Variables:");
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("PORT:", process.env.PORT);
console.log(
  "MONGODB_PROD_URI:",
  process.env.MONGODB_PROD_URI ? "Set" : "Not Set"
);
console.log(
  "MONGODB_TEST_URI:",
  process.env.MONGODB_TEST_URI ? "Set" : "Not Set"
);
console.log("FRONTEND_URL:", process.env.FRONTEND_URL);

import {
  httpServer,
  connectDB,
  initializeRoutes,
  gracefulShutdown,
} from "./app.js";

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Ensure all required environment variables are present
    const requiredEnvVars = ["NODE_ENV", "PORT", "FRONTEND_URL"];
    const missingVars = requiredEnvVars.filter(
      (varName) => !process.env[varName]
    );

    if (missingVars.length > 0) {
      throw new Error(
        `Missing required environment variables: ${missingVars.join(", ")}`
      );
    }

    // Connect to database
    await connectDB();

    // Initialize routes and middleware
    await initializeRoutes();

    // Start server
    httpServer.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🔧 Environment: ${process.env.NODE_ENV || "development"}`);
    });

    // Add error handler for the HTTP server
    httpServer.on("error", (error: Error) => {
      console.error("HTTP Server error:", error);
      process.exit(1);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    if (error instanceof Error) {
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      console.error("Stack trace:", error.stack);
    }
    // Log any additional error properties
    console.error("Full error object:", JSON.stringify(error, null, 2));
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  gracefulShutdown();
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  gracefulShutdown();
});

// Handle graceful shutdown
process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);

// Start the server
startServer();
