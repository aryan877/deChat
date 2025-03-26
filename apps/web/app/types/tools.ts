/**
 * This module defines the type system for tool results in the application.
 * Tools are external integrations or actions that can be invoked, and this
 * provides a standardized way to handle their responses.
 * Focused on Ethereum/Sonic blockchain tools.
 */

import { SiloMarket, SiloStats } from "@/components/tools/silo/types";
import type { AskForConfirmationInput, SiloFinanceInput } from "@repo/de-agent";
import { ACTION_NAMES } from "@repo/de-agent";
/**
 * Possible status values for a tool execution result
 * - success: The tool executed successfully
 * - error: The tool encountered an error during execution
 * - cancelled: The tool execution was cancelled by the user or system
 */
export type ToolResultStatus = "success" | "error" | "cancelled";

/**
 * Base interface for all tool results
 * @template T The type of the successful result data
 *
 * For example:
 * const result: ToolResultBase<{ txHash: string }> = {
 *   status: "success",
 *   message: "Swap completed",
 *   data: { txHash: "0x123..." }
 * };
 */
export interface ToolResultBase<T = unknown> {
  /** The execution status of the tool */
  status: ToolResultStatus;
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
}

export interface ConfirmationData {
  confirmed: boolean;
}

export interface SiloFinanceData {
  markets: SiloMarket[];
  stats: SiloStats;
}

export type ConfirmationToolResult = ToolResultBase<ConfirmationData>;

export type SiloFinanceToolResult = ToolResultBase<SiloFinanceData>;

/**
 * Registry that maps tool names to their corresponding result types
 * This allows for type-safe access to tool results based on the tool name
 */
export interface ToolResultTypes {
  // [ACTION_NAMES.SONIC_SWAP]: SonicSwapToolResult;
  // TODO: Add additional Sonic/Ethereum tool result types as needed
  [ACTION_NAMES.ASK_FOR_CONFIRMATION]: ConfirmationToolResult;
  [ACTION_NAMES.SILO_FINANCE]: SiloFinanceToolResult;
}

/**
 * Helper type that extracts the result type for a specific tool from the registry
 * @template T The tool name (key) from ToolResultTypes
 *
 * Usage:
 * const result: ToolResultType<typeof ACTION_NAMES.SONIC_SWAP>;
 */
export type ToolResultType<T extends keyof ToolResultTypes> =
  ToolResultTypes[T];

/**
 * Type guard function that checks if a value matches the ToolResultBase structure
 * Used for runtime type checking of tool results
 *
 * Usage:
 * if (isToolResult(response)) {
 *   // TypeScript now knows response has status and message properties
 *   console.log(response.status, response.message);
 * }
 */
export function isToolResult(value: unknown): value is ToolResultBase {
  return (
    typeof value === "object" &&
    value !== null &&
    "status" in value &&
    "message" in value &&
    (value as ToolResultBase).status in
      {
        success: true,
        error: true,
        cancelled: true,
      }
  );
}

/**
 * Registry that maps tool names to their corresponding input types
 */
export interface ToolInputTypes {
  // [ACTION_NAMES.SONIC_SWAP]: SonicSwapInput;
  // TODO: Add additional Sonic/Ethereum tool input types as needed
  [ACTION_NAMES.ASK_FOR_CONFIRMATION]: AskForConfirmationInput;
  [ACTION_NAMES.SILO_FINANCE]: SiloFinanceInput;
}

/**
 * Helper type that extracts the input type for a specific tool
 */
export type ToolInputType<T extends keyof ToolInputTypes> = ToolInputTypes[T];
