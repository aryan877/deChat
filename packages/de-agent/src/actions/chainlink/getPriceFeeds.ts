import { z } from "zod";
import type { Action } from "../../types/action.js";
import { getChainlinkPriceFeeds } from "../../tools/chainlink/getPriceFeeds.js";
import { ACTION_NAMES } from "../actionNames.js";
import { ChainlinkSonicNetwork } from "../../types/index.js";

const getPriceFeedsSchema = z.object({
  network: z
    .enum([ChainlinkSonicNetwork.MAINNET, ChainlinkSonicNetwork.TESTNET])
    .describe(
      "Network to get price feeds for. Examples: 'sonic-mainnet', 'sonic-blaze-testnet'"
    ),
  pair: z
    .string()
    .optional()
    .describe("Trading pair to filter results (e.g., 'BTC/USD', 'ETH/USD')"),
});

export type GetPriceFeedsInput = z.infer<typeof getPriceFeedsSchema>;

export const getPriceFeedsAction: Action = {
  name: ACTION_NAMES.CHAINLINK_GET_PRICE_FEEDS,
  similes: [
    "get chainlink price feeds",
    "list chainlink price feeds",
    "find chainlink price feeds",
    "show available price feeds",
  ],
  description:
    "Get a list of available Chainlink price feeds for a specific network",
  examples: [
    [
      {
        input: { network: ChainlinkSonicNetwork.MAINNET },
        output: { feeds: [{ pair: "BTC/USD", address: "0x..." }] },
        explanation: "Returns all available price feeds on Sonic Mainnet",
      },
    ],
    [
      {
        input: { network: ChainlinkSonicNetwork.MAINNET, pair: "BTC/USD" },
        output: { feeds: [{ pair: "BTC/USD", address: "0x..." }] },
        explanation: "Returns BTC/USD price feed on Sonic Mainnet",
      },
    ],
  ],
  schema: getPriceFeedsSchema,
  handler: async (agent, input) => {
    const params = input as GetPriceFeedsInput;
    try {
      const feeds = await getChainlinkPriceFeeds(
        agent,
        params.network,
        params.pair
      );
      return {
        status: "success",
        message: "Successfully retrieved Chainlink price feeds",
        data: { feeds },
      };
    } catch (error) {
      return {
        status: "error",
        message: "Failed to get Chainlink price feeds",
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
