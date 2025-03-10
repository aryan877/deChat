import { z } from "zod";
import type { Action } from "../../types/action.js";
import { fetchInference } from "../../tools/allora/fetchInference.js";
import { getInferenceByTopicIDSchema } from "../../types/allora.js";
import { ACTION_NAMES } from "../actionNames.js";
import { REITERATE_PROMPT } from "../../constants/reiterate.js";

export const fetchInferenceSchema = getInferenceByTopicIDSchema;

export type FetchInferenceInput = z.infer<typeof fetchInferenceSchema>;

export const fetchInferenceAction: Action = {
  name: ACTION_NAMES.ALLORA_FETCH_INFERENCE,
  similes: [
    "get allora inference",
    "fetch allora topic inference",
    "get allora topic data",
    "fetch allora prediction",
  ],
  description: "Fetch inference data for a specific topic from the Allora API",
  examples: [
    [
      {
        input: { topicId: 1 },
        output: {
          inference: {
            network_inference: "0.75",
            timestamp: 1625097600,
          },
        },
        explanation: "Fetches inference data for topic ID 1 on testnet",
      },
    ],
    [
      {
        input: { topicId: 2, network: "MAINNET" },
        output: {
          inference: {
            network_inference: "0.82",
            timestamp: 1625097600,
          },
        },
        explanation: "Fetches inference data for topic ID 2 on mainnet",
      },
    ],
  ],
  schema: fetchInferenceSchema,
  handler: async (agent, input) => {
    const params = input as FetchInferenceInput;
    try {
      const inference = await fetchInference(params);

      return {
        status: "success",
        message: `Successfully fetched inference data for topic ${params.topicId}. ${REITERATE_PROMPT}`,
        data: inference,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to fetch inference data for topic ${params.topicId}`,
        error: {
          code: "FETCH_ERROR",
          message: error.message || "Unknown error occurred",
          details: error,
        },
      };
    }
  },
};
