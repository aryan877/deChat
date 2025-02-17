import { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import {
  APIError,
  ErrorCode,
  ErrorResponse,
  ValidationError,
  BadRequestError,
} from "./types.js";

export const errorHandler: ErrorRequestHandler = (
  err: Error | any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log error details
  console.error("Error details:", {
    name: err?.name || "UnknownError",
    message: err?.message || "No error message available",
    path: req.path,
    method: req.method,
    error: err, // Log the full error object
    ...(process.env.NODE_ENV === "development" && {
      stack: err?.stack,
    }),
  });

  // Handle null prototype objects
  if (err && Object.getPrototypeOf(err) === null) {
    console.error("Received null prototype error object:", err);
    err = new Error("Unexpected error format received");
  }

  // Default error response
  const errorResponse: ErrorResponse = {
    error: {
      code: ErrorCode.INTERNAL_SERVER_ERROR,
      message: "An unexpected error occurred",
      ...(process.env.NODE_ENV === "development" && {
        details: err?.message || "Unknown error",
      }),
    },
  };

  // Handle known API errors
  if (err instanceof APIError) {
    errorResponse.error = {
      code: err.code,
      message: err.message,
      details:
        process.env.NODE_ENV === "development"
          ? err.details
          : err instanceof ValidationError || err instanceof BadRequestError
            ? err.details // Safe to show validation/request errors in production
            : undefined,
    };
    res.status(err.statusCode).json(errorResponse);
    return;
  }

  // Handle Mongoose validation errors
  if (err.name === "ValidationError") {
    errorResponse.error = {
      code: ErrorCode.VALIDATION_ERROR,
      message: "Validation failed",
      details: err.message,
    };
    res.status(400).json(errorResponse);
    return;
  }

  // Handle MongoDB errors
  if (err.name === "MongoError" || err.name === "MongoServerError") {
    errorResponse.error = {
      code: ErrorCode.DATABASE_ERROR,
      message: "A database error occurred",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    };
    res.status(500).json(errorResponse);
    return;
  }

  // Return default error response for unexpected errors
  res.status(500).json(errorResponse);
};
