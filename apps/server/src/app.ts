import express, { Express } from "express";
import { createServer } from "http";
import mongoose from "mongoose";
import cors from "cors";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { setupChatRoutes } from "./routes/chatRoutes.js";
import { errorHandler } from "./middleware/errors/errorHandler.js";
import { notFoundHandler } from "./middleware/errors/notFoundHandler.js";
import { ErrorCode, ErrorResponse } from "./middleware/errors/types.js";
import cookieParser from "cookie-parser";
import { setupWalletRoutes } from "./routes/walletRoutes.js";
import { setupSonicRoutes } from "./routes/sonicRoutes.js";
import { startTokenSyncCron } from "./cron/tokenSync.js";

const app: Express = express();
const httpServer = createServer(app);

// Trust proxy - needed for express-rate-limit when behind a reverse proxy
app.set("trust proxy", 1);

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? process.env.FRONTEND_URL
        : "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-cluster"],
    credentials: true,
  })
);
// Rate limiting
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 1000, // 1000 requests per minute
  message: {
    error: {
      code: ErrorCode.RATE_LIMIT_ERROR,
      message: "Too many requests, please try again later",
    },
  } as ErrorResponse,
});
app.use(limiter);

app.use(cookieParser());

// Body parser middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Root endpoint
app.get("/", (req, res) => {
  res.status(200).json({ message: "Welcome to DeChat Backend!" });
});

// Health check endpoint
app.get("/health", (req, res) => {
  const healthcheck = {
    status: "ok",
    timestamp: new Date(),
    uptime: process.uptime(),
    mongoConnection:
      mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    environment: process.env.NODE_ENV,
  };

  try {
    res.status(200).json(healthcheck);
  } catch (error) {
    healthcheck.status = "error";
    res.status(503).json(healthcheck);
  }
});

// Setup routes
export const initializeRoutes = async () => {
  // Create separate router instances for each route
  const chatRouter = express.Router();
  const walletRouter = express.Router();
  const sonicRouter = express.Router();

  // Setup routes with their own router instances
  app.use("/api/chat", setupChatRoutes(chatRouter));
  app.use("/api/wallet", setupWalletRoutes(walletRouter));
  app.use("/api/sonic", setupSonicRoutes(sonicRouter));
  console.log("🛠️ Routes configured");

  // Handle 404 for undefined routes
  app.use("*", notFoundHandler);

  // Global error handler - should be last
  app.use(errorHandler);
};

// Database connection
export const connectDB = async () => {
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

    // Start token sync cron job after successful DB connection
    startTokenSyncCron();
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
};

// Graceful shutdown handler
export const gracefulShutdown = async () => {
  try {
    await mongoose.connection.close();
    console.log("MongoDB connection closed.");
    process.exit(0);
  } catch (error) {
    console.error("Error during shutdown:", error);
    process.exit(1);
  }
};

export { app, httpServer };
