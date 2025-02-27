import { z } from "zod";
import type { Action } from "../../types/action.js";
import { getDebridgeTokensInfo } from "../../tools/debridge/getTokensInfo.js";
import { ACTION_NAMES } from "../actionNames.js";

const getTokensInfoSchema = z.object({
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

export type GetTokensInfoInput = z.infer<typeof getTokensInfoSchema>;

export const getTokensInfoAction: Action = {
  name: ACTION_NAMES.DEBRIDGE_GET_TOKENS_INFO,
  similes: [
    "get token information",
    "list supported tokens",
    "search available tokens",
    "check token details",
  ],
  description:
    "Get information about tokens supported by deBridge on a specific chain",
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
  schema: getTokensInfoSchema,
  handler: async (agent, input) => {
    const params = input as GetTokensInfoInput;
    try {
      const tokensInfo = await getDebridgeTokensInfo({
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
