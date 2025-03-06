import { z } from "zod";
import type { Action } from "../../types/action.js";
import { getTradeQuote } from "../../tools/sonic/trade.js";
import { ACTION_NAMES } from "../actionNames.js";

const SONIC_NATIVE_TOKEN = "0x0000000000000000000000000000000000000000";
const USDC_TOKEN = "0x29219dd400f2Bf60E5a23d13Be72B486D4038894";

const tradeQuoteSchema = z.object({
  inputToken: z.string().min(1),
  inputAmount: z.string().min(1),
  outputToken: z.string().min(1),
  slippageLimitPercent: z.number().optional(),
});

export type TradeQuoteInput = z.infer<typeof tradeQuoteSchema>;

export const tradeQuoteAction: Action = {
  name: ACTION_NAMES.SONIC_TRADE_QUOTE,
  similes: [
    "get sonic trade quote",
    "quote sonic swap",
    "check sonic swap price",
    "get sonic exchange rate",
    "swap SONIC tokens",
    "trade native SONIC",
    "exchange SONIC for tokens",
  ],
  description:
    "Get a quote for trading tokens on Sonic. Use 0x0000000000000000000000000000000000000000 for native SONIC token. Input amount should be in human-readable format (e.g., '1.5' for 1.5 SONIC).",
  examples: [
    [
      {
        input: {
          inputToken: SONIC_NATIVE_TOKEN,
          inputAmount: "1.5", // Will be converted to 1500000000000000000 (18 decimals)
          outputToken: USDC_TOKEN,
        },
        output: {
          status: "success",
          data: {
            inAmounts: ["1500000000000000000"],
            outAmounts: ["821190"], // USDC has 6 decimals
            gasEstimate: 248175.0,
            priceImpact: -0.0011783440098132427,
            inputToken: {
              address: "0x0000000000000000000000000000000000000000",
              symbol: "SONIC",
              decimals: 18,
            },
            outputToken: {
              address: "0x29219dd400f2Bf60E5a23d13Be72B486D4038894",
              symbol: "USDC",
              decimals: 6,
            },
          },
        },
        explanation:
          "Gets a quote for swapping 1.5 native SONIC tokens for USDC, handling decimals automatically",
      },
      {
        input: {
          inputToken: USDC_TOKEN,
          inputAmount: "100", // Will be converted to 100000000 (6 decimals)
          outputToken: SONIC_NATIVE_TOKEN,
        },
        output: {
          status: "success",
          data: {
            inAmounts: ["100000000"],
            outAmounts: ["182500000000000000000"],
            gasEstimate: 248175.0,
            priceImpact: -0.001,
            inputToken: {
              address: "0x29219dd400f2Bf60E5a23d13Be72B486D4038894",
              symbol: "USDC",
              decimals: 6,
            },
            outputToken: {
              address: "0x0000000000000000000000000000000000000000",
              symbol: "SONIC",
              decimals: 18,
            },
          },
        },
        explanation:
          "Gets a quote for swapping 100 USDC to native SONIC tokens, handling decimals automatically",
      },
    ],
  ],
  schema: tradeQuoteSchema,
  handler: async (agent, input) => {
    const params = input as TradeQuoteInput;
    try {
      const result = await getTradeQuote(agent, params);
      return {
        status: "success",
        message: result.message,
        data: result.data,
      };
    } catch (error) {
      return {
        status: "error",
        message: "Failed to get trade quote",
        error: {
          code: "QUOTE_ERROR",
          message:
            error instanceof Error ? error.message : "Unknown error occurred",
          details: error,
        },
      };
    }
  },
};
