import { z } from "zod";
import type { Action } from "../../types/action.js";
import { fetchTopics } from "../../tools/allora/fetchTopics.js";
import { getAllTopicsSchema } from "../../types/allora.js";
import { ACTION_NAMES } from "../actionNames.js";
import { REITERATE_PROMPT } from "../../constants/reiterate.js";

export const fetchTopicsSchema = getAllTopicsSchema;

export type FetchTopicsInput = z.infer<typeof fetchTopicsSchema>;

export const fetchTopicsAction: Action = {
  name: ACTION_NAMES.ALLORA_FETCH_TOPICS,
  similes: [
    "get allora topics",
    "list allora topics",
    "fetch allora topics",
    "show allora topics",
  ],
  description: "Fetch all available topics from the Allora API",
  examples: [
    [
      {
        input: {},
        output: { topics: [{ topic_id: 1, topic_name: "Example Topic" }] },
        explanation: "Fetches all available topics from Allora on testnet",
      },
    ],
    [
      {
        input: { network: "MAINNET" },
        output: { topics: [{ topic_id: 2, topic_name: "Mainnet Topic" }] },
        explanation: "Fetches all available topics from Allora on mainnet",
      },
    ],
  ],
  schema: fetchTopicsSchema,
  handler: async (agent, input) => {
    const params = input as FetchTopicsInput;
    try {
      const topics = await fetchTopics(params);

      return {
        status: "success",
        message: `Successfully fetched ${topics.length} topics from Allora. ${REITERATE_PROMPT}`,
        data: topics,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: "Failed to fetch topics from Allora",
        error: {
          code: "FETCH_ERROR",
          message: error.message || "Unknown error occurred",
          details: error,
        },
      };
    }
  },
};
