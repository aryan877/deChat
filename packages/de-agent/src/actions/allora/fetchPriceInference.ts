import { z } from "zod";
import type { Action } from "../../types/action.js";
import { fetchPriceInference } from "../../tools/allora/fetchPriceInference.js";
import { getPriceInferenceSchema } from "../../types/allora.js";
import { ACTION_NAMES } from "../actionNames.js";
import { REITERATE_PROMPT } from "../../constants/reiterate.js";

export const fetchPriceInferenceSchema = getPriceInferenceSchema;

export type FetchPriceInferenceInput = z.infer<
  typeof fetchPriceInferenceSchema
>;

export const fetchPriceInferenceAction: Action = {
  name: ACTION_NAMES.ALLORA_FETCH_PRICE_INFERENCE,
  similes: [
    "get allora price prediction",
    "fetch allora price inference",
    "get crypto price prediction",
    "fetch token price forecast",
  ],
  description:
    "Fetch price inference data for a specific asset and timeframe from the Allora API",
  examples: [
    [
      {
        input: { asset: "BTC", timeframe: "5m" },
        output: {
          priceInference: "45000.75",
          tokenSymbol: "BTC",
          timeframe: "5m",
        },
        explanation: "Fetches 5-minute price inference for Bitcoin on testnet",
      },
    ],
    [
      {
        input: { asset: "ETH", timeframe: "8h", network: "MAINNET" },
        output: {
          priceInference: "3200.50",
          tokenSymbol: "ETH",
          timeframe: "8h",
        },
        explanation: "Fetches 8-hour price inference for Ethereum on mainnet",
      },
    ],
  ],
  schema: fetchPriceInferenceSchema,
  handler: async (agent, input) => {
    const params = input as FetchPriceInferenceInput;
    try {
      const inference = await fetchPriceInference(params);

      const assetName = params.asset === "BTC" ? "Bitcoin" : "Ethereum";
      const timeframeLabel =
        params.timeframe === "5m" ? "5 minutes" : "8 hours";

      return {
        status: "success",
        message: `Successfully fetched ${assetName} price inference data for ${timeframeLabel} timeframe. ${REITERATE_PROMPT}`,
        data: inference,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to fetch price inference data for ${params.asset} (${params.timeframe})`,
        error: {
          code: "FETCH_ERROR",
          message: error.message || "Unknown error occurred",
          details: error,
        },
      };
    }
  },
};
