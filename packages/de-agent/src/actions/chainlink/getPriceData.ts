import { z } from "zod";
import type { Action } from "../../types/action.js";
import { getChainlinkPriceData } from "../../tools/chainlink/getPriceData.js";
import { ACTION_NAMES } from "../actionNames.js";
import {
  CHAINLINK_SONIC_MAINNET_FEEDS,
  CHAINLINK_SONIC_BLAZE_TESTNET_FEEDS,
} from "../../constants/index.js";

const getPriceDataSchema = z.object({
  network: z
    .enum(["sonicMainnet", "sonicBlaze"] as const)
    .optional()
    .describe(
      "Optional network to get price data for. Examples: 'sonicMainnet', 'sonicBlaze'. Will use agent's network if not provided."
    ),
  feedAddress: z.string().describe("Chainlink price feed contract address"),
});

export type GetPriceDataInput = z.infer<typeof getPriceDataSchema>;

export const getPriceDataAction: Action = {
  name: ACTION_NAMES.CHAINLINK_GET_PRICE_DATA,
  similes: [
    "get chainlink price data",
    "read chainlink price",
    "fetch asset price from chainlink",
    "get current price from chainlink",
  ],
  description: "Get the latest price data from a Chainlink price feed",
  examples: [
    [
      {
        input: {
          feedAddress: "0x8Bcd59Cb7eEEea8e2Da3080C891609483dae53EF",
        },
        output: {
          decimals: 8,
          latestAnswer: "2900000000000",
          latestTimestamp: 1677721600,
          network: "sonicMainnet",
        },
        explanation:
          "Returns the latest BTC/USD price from Chainlink using agent's network",
      },
    ],
    [
      {
        input: {
          network: "sonicBlaze",
          feedAddress: "0x8Bcd59Cb7eEEea8e2Da3080C891609483dae53EF",
        },
        output: {
          decimals: 8,
          latestAnswer: "2900000000000",
          latestTimestamp: 1677721600,
          network: "sonicBlaze",
        },
        explanation:
          "Returns the latest BTC/USD price from Chainlink on Sonic Blaze testnet",
      },
    ],
  ],
  schema: getPriceDataSchema,
  handler: async (agent, input) => {
    const params = input as GetPriceDataInput;
    try {
      // Validate that the feed address exists on the selected network if network is provided
      const feedData = params.network
        ? params.network === "sonicMainnet"
          ? CHAINLINK_SONIC_MAINNET_FEEDS
          : CHAINLINK_SONIC_BLAZE_TESTNET_FEEDS
        : CHAINLINK_SONIC_MAINNET_FEEDS; // Default to mainnet feeds for validation

      // Check if the address is in our known feeds (optional validation)
      const isKnownFeed = Object.values(feedData).some(
        (address) => address.toLowerCase() === params.feedAddress.toLowerCase()
      );

      if (!isKnownFeed) {
        console.warn(
          `Warning: Using an unknown feed address: ${params.feedAddress}`
        );
      }

      // Pass both the feed address and optional network to the tool function
      const priceData = await getChainlinkPriceData(
        agent,
        params.feedAddress,
        params.network // Pass as optional cluster
      );

      // Format the price with decimals for human readability
      const price = Number(priceData.latestAnswer) / 10 ** priceData.decimals;

      return {
        status: "success",
        message: "Successfully retrieved Chainlink price data",
        data: {
          ...priceData,
          formattedPrice: price.toString(),
        },
      };
    } catch (error) {
      return {
        status: "error",
        message: "Failed to get Chainlink price data",
        error: {
          code: "FETCH_ERROR",
          message:
            error instanceof Error ? error.message : "Unknown error occurred",
          details: error,
        },
      };
    }
  },
};
