import React from "react";
import { ACTION_NAMES } from "@repo/de-agent";
import { SupportedChainsSuccess } from "./SupportedChainsSuccess";
import type { deBridgeSupportedChainsResponse } from "@repo/de-agent";
import { TransferSuccess } from "./TransferSuccess";

// Define a mapping of tool names to their success result types
export type SuccessResultsMap = {
  [ACTION_NAMES.GET_SUPPORTED_CHAINS]: deBridgeSupportedChainsResponse;
  [ACTION_NAMES.SONIC_TRANSFER]: {
    txHash: string;
    explorerUrl: string;
  };
};

// Registry of tools that have success components
export const SUCCESS_COMPONENTS_REGISTRY = {
  [ACTION_NAMES.GET_SUPPORTED_CHAINS]: true,
  [ACTION_NAMES.SONIC_TRANSFER]: true,
} as const;

// Type guard to check if a tool has success results
export function hasSuccessComponent(
  toolName: string
): toolName is keyof SuccessResultsMap {
  return toolName in SUCCESS_COMPONENTS_REGISTRY;
}

interface SuccessResultsProps<T extends keyof SuccessResultsMap> {
  toolName: T;
  data: SuccessResultsMap[T];
}

export function SuccessResults<T extends keyof SuccessResultsMap>({
  toolName,
  data,
}: SuccessResultsProps<T>) {
  switch (toolName) {
    case ACTION_NAMES.GET_SUPPORTED_CHAINS:
      return (
        <SupportedChainsSuccess
          data={data as deBridgeSupportedChainsResponse}
        />
      );
    case ACTION_NAMES.SONIC_TRANSFER:
      return (
        <TransferSuccess
          data={data as SuccessResultsMap[typeof ACTION_NAMES.SONIC_TRANSFER]}
        />
      );
    default:
      return null;
  }
}
