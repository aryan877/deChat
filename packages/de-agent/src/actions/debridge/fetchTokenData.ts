import { z } from "zod";
import type { Action } from "../../types/action.js";
import { fetchTokenData } from "../../tools/debridge/fetchTokenData.js";
import { ACTION_NAMES } from "../actionNames.js";

const fetchTokenDataSchema = z.object({
  chainId: z
    .string()
    .describe("Chain ID to get token information for (e.g., '1' for Ethereum)"),
  tokenAddress: z
    .string()
    .optional()
    .describe("Optional specific token address to query"),
  search: z
    .string()
    .optional()
    .describe("Optional search term to filter tokens by name or symbol"),
});

export type FetchTokenDataInput = z.infer<typeof fetchTokenDataSchema>;

export const fetchTokenDataAction: Action = {
  name: ACTION_NAMES.DEBRIDGE_FETCH_TOKEN_DATA,
  similes: [
    "fetch token information",
    "list supported tokens",
    "search available tokens",
    "check token details",
  ],
  description:
    "Fetch information about tokens supported by deBridge on a specific chain. Sonic uses chain ID '100000014' in the deBridge protocol.",
  examples: [
    [
      {
        input: {
          chainId: "1",
          search: "USDC",
        },
        output: {
          tokens: {
            "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48": {
              name: "USD Coin",
              symbol: "USDC",
              decimals: 6,
            },
          },
        },
        explanation: "Gets information about USDC token on Ethereum",
      },
    ],
  ],
  schema: fetchTokenDataSchema,
  handler: async (agent, input) => {
    const params = input as FetchTokenDataInput;
    try {
      const tokensInfo = await fetchTokenData({
        chainId: params.chainId,
        tokenAddress: params.tokenAddress,
        search: params.search,
      });
      return {
        status: "success",
        message: "Successfully retrieved tokens information",
        data: tokensInfo,
      };
    } catch (error) {
      return {
        status: "error",
        message: "Failed to get tokens information",
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
