import { z } from "zod";

// Chainlink Feed Types
export enum ChainlinkFeedType {
  PRICE = "price",
  DATA = "data",
  VOLATILITY = "volatility",
}

// Chainlink Sonic Networks
export enum ChainlinkSonicNetwork {
  MAINNET = "sonic-mainnet",
  TESTNET = "sonic-blaze-testnet",
}

// Chainlink Price Feed Response
export interface ChainlinkPriceFeedInfo {
  address: string;
  pair: string;
  assetName?: string;
  assetType?: string;
  marketHours?: string;
  status?: "active" | "inactive";
  network: ChainlinkSonicNetwork;
}

// Chainlink Price Feed Response
export interface ChainlinkPriceFeedResponse {
  decimals: number;
  latestAnswer: string;
  latestTimestamp: number;
  latestRound: string;
  network?: string; // Optional to maintain backward compatibility
  chainId?: number; // Optional to maintain backward compatibility
}

// Chainlink Price Feed Parameters Schema
export const getChainlinkPriceFeedSchema = z.object({
  /** Network to query price feeds for */
  network: z
    .enum([ChainlinkSonicNetwork.MAINNET, ChainlinkSonicNetwork.TESTNET])
    .describe(
      "Network to get price feeds for. Examples: 'sonic-mainnet', 'sonic-blaze-testnet'"
    ),

  /** Optional pair to filter results */
  pair: z
    .string()
    .optional()
    .describe(
      "Trading pair to get price feed for (e.g., 'BTC/USD', 'ETH/USD')"
    ),
});

export type GetChainlinkPriceFeedParams = z.infer<
  typeof getChainlinkPriceFeedSchema
>;

// Chainlink Price Data Parameters Schema
export const getChainlinkPriceDataSchema = z.object({
  /** Network to query price data for */
  network: z
    .enum([ChainlinkSonicNetwork.MAINNET, ChainlinkSonicNetwork.TESTNET])
    .describe(
      "Network to get price data for. Examples: 'sonic-mainnet', 'sonic-blaze-testnet'"
    ),

  /** Feed address to get price data for */
  feedAddress: z.string().describe("Chainlink price feed contract address"),
});

export type GetChainlinkPriceDataParams = z.infer<
  typeof getChainlinkPriceDataSchema
>;
