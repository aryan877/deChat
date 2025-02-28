import React from "react";
import { ACTION_NAMES } from "@repo/de-agent";
import { SupportedChainsSuccess } from "./SupportedChainsSuccess";
import type {
  deBridgeSupportedChainsResponse,
  ChainlinkPriceFeedInfo,
  ChainlinkPriceFeedResponse,
} from "@repo/de-agent";
import { TransferSuccess } from "./TransferSuccess";
import { ChainlinkPriceFeedsSuccess } from "./ChainlinkPriceFeedsSuccess";
import { ChainlinkPriceDataSuccess } from "./ChainlinkPriceDataSuccess";

// Define a mapping of tool names to their success result types
export type SuccessResultsMap = {
  [ACTION_NAMES.GET_SUPPORTED_CHAINS]: deBridgeSupportedChainsResponse;
  [ACTION_NAMES.SONIC_TRANSFER]: {
    txHash: string;
    explorerUrl: string;
  };
  [ACTION_NAMES.CHAINLINK_GET_PRICE_FEEDS]: {
    feeds: ChainlinkPriceFeedInfo[];
  };
  [ACTION_NAMES.CHAINLINK_GET_PRICE_DATA]: ChainlinkPriceFeedResponse & {
    formattedPrice: string;
  };
};

// Registry of tools that have success components
export const SUCCESS_COMPONENTS_REGISTRY = {
  [ACTION_NAMES.GET_SUPPORTED_CHAINS]: true,
  [ACTION_NAMES.SONIC_TRANSFER]: true,
  [ACTION_NAMES.CHAINLINK_GET_PRICE_FEEDS]: true,
  [ACTION_NAMES.CHAINLINK_GET_PRICE_DATA]: true,
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
    case ACTION_NAMES.CHAINLINK_GET_PRICE_FEEDS:
      return (
        <ChainlinkPriceFeedsSuccess
          data={
            data as SuccessResultsMap[typeof ACTION_NAMES.CHAINLINK_GET_PRICE_FEEDS]
          }
        />
      );
    case ACTION_NAMES.CHAINLINK_GET_PRICE_DATA:
      return (
        <ChainlinkPriceDataSuccess
          data={
            data as SuccessResultsMap[typeof ACTION_NAMES.CHAINLINK_GET_PRICE_DATA]
          }
        />
      );
    default:
      return null;
  }
}
