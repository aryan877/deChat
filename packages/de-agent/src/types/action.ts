import { DeAgent } from "../agent/index.js";
import { z } from "zod";

/**
 * Example of an action with input and output
 */
export interface ActionExample {
  input: Record<string, any>;
  output: Record<string, any>;
  explanation: string;
}

/**
 * Possible status values for a handler execution result
 */
export type HandlerResultStatus = "success" | "error" | "cancelled";

/**
 * Standard response type for all handlers
 * @template T The type of the successful result data
 */
export type HandlerResponse<T = unknown> = Readonly<{
  /** The execution status of the handler */
  status: HandlerResultStatus;
  /** A human-readable message describing the result */
  message: string;
  /** The actual result data, present only on successful execution */
  data?: T;
  /** Error information, present only when status is "error" */
  error?: {
    /** Machine-readable error code */
    code: string;
    /** Human-readable error message */
    message: string;
    /** Additional error context/stack trace */
    details?: unknown;
  };
}>;

/**
 * Handler function type for executing the action
 */
export type Handler = (
  agent: DeAgent,
  input: Record<string, any>
) => Promise<HandlerResponse>;

/**
 * Main Action interface inspired by ELIZA
 * This interface makes it easier to implement actions across different frameworks
 */
export interface Action {
  /**
   * Unique name of the action
   */
  name: string;

  /**
   * Alternative names/phrases that can trigger this action
   */
  similes: string[];

  /**
   * Detailed description of what the action does
   */
  description: string;

  /**
   * Array of example inputs and outputs for the action
   * Each inner array represents a group of related examples
   */
  examples: ActionExample[][];

  /**
   * Zod schema for input validation
   */
  schema: z.ZodType<any>;

  /**
   * Whether this action requires user confirmation before execution
   * @default false
   */
  requiresConfirmation?: boolean;

  /**
   * Function that executes the action
   */
  handler?: Handler;
}
