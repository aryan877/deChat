import { z } from "zod";
import type { Action } from "../../types/action.js";
import { searchSonic } from "../../tools/sonic/search.js";
import { ACTION_NAMES } from "../actionNames.js";

const searchSchema = z.object({
  term: z.string().min(1),
});

export type SearchInput = z.infer<typeof searchSchema>;

export const searchAction: Action = {
  name: ACTION_NAMES.SONIC_SEARCH,
  similes: [
    "search sonic scan",
    "find on sonic scan",
    "lookup on sonic",
    "search for token on sonic",
  ],
  description:
    "Search for tokens, addresses, or other entities on Sonic scan (mainnet only)",
  examples: [
    [
      {
        input: {
          term: "USDT",
        },
        output: {
          status: "success",
          data: [
            {
              address: "0x6047828dc181963ba44974801ff68e538da5eaf9",
              link: "/address/0x6047828dc181963ba44974801ff68e538da5eaf9",
              group: "Addresses",
              groupid: "2",
            },
          ],
        },
        explanation: "Searches for USDT token on Sonic scan",
      },
    ],
  ],
  schema: searchSchema,
  handler: async (agent, input) => {
    const params = input as SearchInput;
    try {
      const result = await searchSonic(agent, params.term);
      return {
        status: "success",
        message: "Successfully searched Sonic scan",
        data: result.data,
      };
    } catch (error) {
      return {
        status: "error",
        message: "Failed to search Sonic scan",
        error: {
          code: "SEARCH_ERROR",
          message:
            error instanceof Error ? error.message : "Unknown error occurred",
          details: error,
        },
      };
    }
  },
};
