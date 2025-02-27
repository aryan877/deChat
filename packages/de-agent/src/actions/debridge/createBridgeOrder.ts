import { z } from "zod";
import type { Action } from "../../types/action.js";
import { createDebridgeBridgeOrder } from "../../tools/debridge/createBridgeOrder.js";
import { ACTION_NAMES } from "../actionNames.js";

const createBridgeOrderSchema = z.object({
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
  referralCode: z.string().optional().describe("Optional referral code"),
});

export type CreateBridgeOrderInput = z.infer<typeof createBridgeOrderSchema>;

export const createBridgeOrderAction: Action = {
  name: ACTION_NAMES.DEBRIDGE_CREATE_BRIDGE_ORDER,
  similes: [
    "create bridge order",
    "start bridge transaction",
    "initiate token bridge",
    "setup cross-chain transfer",
  ],
  description: "Create a new bridge order for cross-chain token transfer",
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
        },
        output: {
          orderId: "123",
          tx: { to: "0x...", data: "0x...", value: "0" },
        },
        explanation: "Creates a bridge order from Ethereum to BSC",
      },
    ],
  ],
  schema: createBridgeOrderSchema,
  handler: async (agent, input) => {
    const params = input as CreateBridgeOrderInput;
    try {
      const order = await createDebridgeBridgeOrder({
        srcChainId: params.srcChainId,
        srcChainTokenIn: params.srcChainTokenIn,
        srcChainTokenInAmount: params.srcChainTokenInAmount,
        dstChainId: params.dstChainId,
        dstChainTokenOut: params.dstChainTokenOut,
        dstChainTokenOutRecipient: params.dstChainTokenOutRecipient,
        account: params.account,
        referralCode: params.referralCode
          ? Number(params.referralCode)
          : undefined,
      });
      return {
        status: "success",
        message: "Successfully created bridge order",
        data: order,
      };
    } catch (error) {
      return {
        status: "error",
        message: "Failed to create bridge order",
        error: {
          code: "CREATION_ERROR",
          message:
            error instanceof Error ? error.message : "Unknown error occurred",
          details: error,
        },
      };
    }
  },
};
