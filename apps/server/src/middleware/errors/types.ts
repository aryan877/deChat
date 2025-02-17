// Error codes enum for type safety
export enum ErrorCode {
  VALIDATION_ERROR = "VALIDATION_ERROR",
  DATABASE_ERROR = "DATABASE_ERROR",
  NOT_FOUND = "NOT_FOUND",
  RATE_LIMIT_ERROR = "RATE_LIMIT_ERROR",
  INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
  BAD_REQUEST = "BAD_REQUEST",
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",
}

// Base error response type
export interface ErrorResponse {
  error: {
    code: ErrorCode;
    message: string;
    details?: unknown;
  };
}

// Base API Error class
export class APIError extends Error {
  constructor(
    public statusCode: number,
    public code: ErrorCode,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = "APIError";
    Object.setPrototypeOf(this, APIError.prototype);
  }
}

// Specific error classes
export class ValidationError extends APIError {
  constructor(message: string, details?: unknown) {
    super(400, ErrorCode.VALIDATION_ERROR, message, details);
    this.name = "ValidationError";
  }
}

export class DatabaseError extends APIError {
  constructor(message: string = "Database error occurred", details?: unknown) {
    super(500, ErrorCode.DATABASE_ERROR, message, details);
    this.name = "DatabaseError";
  }
}

export class NotFoundError extends APIError {
  constructor(resource: string) {
    super(404, ErrorCode.NOT_FOUND, `${resource} not found`);
    this.name = "NotFoundError";
  }
}

export class RateLimitError extends APIError {
  constructor(message: string = "Too many requests") {
    super(429, ErrorCode.RATE_LIMIT_ERROR, message);
    this.name = "RateLimitError";
  }
}

export class BadRequestError extends APIError {
  constructor(message: string, details?: unknown) {
    super(400, ErrorCode.BAD_REQUEST, message, details);
    this.name = "BadRequestError";
  }
}

export class UnauthorizedError extends APIError {
  constructor(message: string = "Unauthorized") {
    super(401, ErrorCode.UNAUTHORIZED, message);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends APIError {
  constructor(message: string = "Forbidden") {
    super(403, ErrorCode.FORBIDDEN, message);
    this.name = "ForbiddenError";
  }
}
