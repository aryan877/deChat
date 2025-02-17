import { Request, Response } from "express";
import { ErrorCode, ErrorResponse } from "./types.js";

export const notFoundHandler = (req: Request, res: Response) => {
  // Log the 404 error
  console.warn("404 Not Found:", {
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString(),
  });

  const errorResponse: ErrorResponse = {
    error: {
      code: ErrorCode.NOT_FOUND,
      message: "The requested resource was not found",
      details: {
        path: req.path,
        method: req.method,
      },
    },
  };

  res.status(404).json(errorResponse);
};
