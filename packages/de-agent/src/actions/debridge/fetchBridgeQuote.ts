import { z } from "zod";
import type { Action } from "../../types/action.js";
import { fetchBridgeQuote } from "../../tools/debridge/fetchBridgeQuote.js";
import { ACTION_NAMES } from "../actionNames.js";

const fetchBridgeQuoteSchema = z.object({
  srcChainId: z.string().describe("Source chain ID (e.g., '1' for Ethereum)"),
  srcChainTokenIn: z.string().describe("Token address on source chain"),
  srcChainTokenInAmount: z
    .string()
    .describe("Amount to bridge (in token's smallest unit)"),
  dstChainId: z.string().describe("Destination chain ID"),
  dstChainTokenOut: z.string().describe("Token address on destination chain"),
  dstChainTokenOutRecipient: z
    .string()
    .describe("Recipient address on destination chain"),
  account: z.string().describe("Sender's wallet address"),
  slippage: z
    .number()
    .optional()
    .describe("Optional slippage tolerance in percentage"),
  referralCode: z.string().optional().describe("Optional referral code"),
});

export type FetchBridgeQuoteInput = z.infer<typeof fetchBridgeQuoteSchema>;

export const fetchBridgeQuoteAction: Action = {
  name: ACTION_NAMES.DEBRIDGE_FETCH_BRIDGE_QUOTE,
  similes: [
    "fetch bridge quote",
    "estimate bridge cost",
    "check bridge fees",
    "calculate bridge amount",
  ],
  description:
    "Fetch a quote for bridging tokens between chains including fees and estimated output",
  examples: [
    [
      {
        input: {
          srcChainId: "1",
          srcChainTokenIn: "0x...",
          srcChainTokenInAmount: "1000000000000000000",
          dstChainId: "56",
          dstChainTokenOut: "0x...",
          dstChainTokenOutRecipient: "0x...",
          account: "0x...",
          slippage: 0.5,
        },
        output: {
          estimatedGas: "500000",
          fee: "0.001",
          estimatedOutput: "990000000000000000",
        },
        explanation: "Gets a quote for bridging 1 ETH from Ethereum to BSC",
      },
    ],
  ],
  schema: fetchBridgeQuoteSchema,
  handler: async (agent, input) => {
    const params = input as FetchBridgeQuoteInput;
    try {
      const quote = await fetchBridgeQuote({
        srcChainId: params.srcChainId,
        srcChainTokenIn: params.srcChainTokenIn,
        srcChainTokenInAmount: params.srcChainTokenInAmount,
        dstChainId: params.dstChainId,
        dstChainTokenOut: params.dstChainTokenOut,
        dstChainTokenOutRecipient: params.dstChainTokenOutRecipient,
        account: params.account,
        slippage: params.slippage,
        referralCode: params.referralCode
          ? Number(params.referralCode)
          : undefined,
      });
      return {
        status: "success",
        message: "Successfully retrieved bridge quote",
        data: quote,
      };
    } catch (error) {
      return {
        status: "error",
        message: "Failed to get bridge quote",
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
