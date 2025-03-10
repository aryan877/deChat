import { z } from "zod";
import type { Action } from "../../types/action.js";
import { ACTION_NAMES } from "../actionNames.js";
import { sonicDocsSearch } from "../../tools/knowledge/sonicDocsSearch.js";
import { REITERATE_PROMPT } from "../../constants/reiterate.js";

const sonicDocsSearchSchema = z.object({
  query: z.string().min(1, "Search query is required"),
  limit: z.number().optional().default(5),
});

export type SonicDocsSearchInput = z.infer<typeof sonicDocsSearchSchema>;

export const sonicDocsSearchAction: Action = {
  name: ACTION_NAMES.SONIC_DOCS_SEARCH,
  similes: [
    "search sonic docs",
    "find in documentation",
    "look up in sonic docs",
    "search documentation",
    "find information about",
    "get information on",
    "learn about sonic",
    "how does sonic",
    "what is sonic",
  ],
  description:
    "Search for information in Sonic documentation and get AI-generated answers",
  examples: [
    [
      {
        input: {
          query: "How does staking work on Sonic?",
          limit: 5,
        },
        output: {
          success: true,
          count: 3,
          data: [],
          answer:
            "Staking on Sonic allows users to earn rewards by delegating their SONIC tokens to validators. When you stake your tokens, you're helping secure the network while earning passive income...",
        },
        explanation:
          "Searches Sonic documentation for information about staking and returns an AI-generated answer",
      },
    ],
  ],
  schema: sonicDocsSearchSchema,
  handler: async (agent, input) => {
    const params = input as SonicDocsSearchInput;
    try {
      const result = await sonicDocsSearch(agent, params.query, params.limit);

      let message = `Found ${result.count} relevant documents. `;

      if (result.answer) {
        message += `Here's what I found: ${result.answer} `;
      }

      message += REITERATE_PROMPT;

      return {
        status: "success",
        message,
        data: result,
      };
    } catch (error) {
      return {
        status: "error",
        message: "Failed to search Sonic documentation",
        error: {
          code: "DOCS_SEARCH_ERROR",
          message:
            error instanceof Error ? error.message : "Unknown error occurred",
          details: error,
        },
      };
    }
  },
};
