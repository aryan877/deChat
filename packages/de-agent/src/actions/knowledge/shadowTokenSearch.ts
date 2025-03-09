import { z } from "zod";
import type { Action } from "../../types/action.js";
import { ACTION_NAMES } from "../actionNames.js";
import { shadowTokenSearch } from "../../tools/knowledge/shadowTokenSearch.js";
import { REITERATE_PROMPT } from "../../constants/reiterate.js";

const shadowTokenSearchSchema = z.object({
  query: z.string().min(1, "Search query is required"),
  limit: z.number().optional().default(3),
});

export type ShadowTokenSearchInput = z.infer<typeof shadowTokenSearchSchema>;

export const shadowTokenSearchAction: Action = {
  name: ACTION_NAMES.SHADOW_TOKEN_SEARCH,
  similes: [
    "search for tokens",
    "find tokens",
    "look up tokens",
    "search tokens by name",
    "search tokens by symbol",
    "find token information",
  ],
  description: "Search for Shadow tokens by name or symbol",
  examples: [
    [
      {
        input: {
          query: "ETH",
          limit: 3,
        },
        output: {
          success: true,
          count: 2,
          data: [
            {
              name: "Wrapped Ether on Sonic",
              address: "0x50c42dEAcD8Fc9773493ED674b675bE577f2634b",
              symbol: "WETH",
              decimals: 18,
            },
            {
              name: "Sonic ETH",
              address: "0x3bcE5CB273F0F148010BbEa2470e7b5df84C7812",
              symbol: "scETH",
              decimals: 18,
            },
          ],
        },
        explanation: "Searches for tokens with 'ETH' in their name or symbol",
      },
    ],
  ],
  schema: shadowTokenSearchSchema,
  handler: async (agent, input) => {
    const params = input as ShadowTokenSearchInput;
    try {
      const result = await shadowTokenSearch(agent, params.query, params.limit);

      return {
        status: "success",
        message: `Found ${result.count} tokens matching "${params.query}". ${REITERATE_PROMPT}`,
        data: result,
      };
    } catch (error) {
      return {
        status: "error",
        message: "Failed to search for tokens",
        error: {
          code: "TOKEN_SEARCH_ERROR",
          message:
            error instanceof Error ? error.message : "Unknown error occurred",
          details: error,
        },
      };
    }
  },
};
