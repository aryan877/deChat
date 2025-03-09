import { z } from "zod";
import type { Action } from "../../types/action.js";
import { processTransfer } from "../../tools/debridge/processTransfer.js";
import { ACTION_NAMES } from "../actionNames.js";

const processTransferSchema = z.object({
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
  referralCode: z.string().optional().describe("Optional referral code"),
});

export type ProcessTransferInput = z.infer<typeof processTransferSchema>;

export const processTransferAction: Action = {
  name: ACTION_NAMES.DEBRIDGE_EXECUTE_BRIDGE_TRANSFER,
  similes: [
    "process bridge transfer",
    "execute cross-chain transfer",
    "bridge tokens",
    "transfer across chains",
    "send tokens to another chain",
  ],
  description:
    "Process and execute a bridge transfer for cross-chain token movement",
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
          txHash: "0x...",
        },
        explanation: "Bridges tokens from Ethereum to BSC",
      },
    ],
  ],
  schema: processTransferSchema,
  handler: async (agent, input) => {
    const params = input as ProcessTransferInput;
    try {
      const txHash = await processTransfer(agent, {
        srcChainId: params.srcChainId,
        srcChainTokenIn: params.srcChainTokenIn,
        srcChainTokenInAmount: params.srcChainTokenInAmount,
        dstChainId: params.dstChainId,
        dstChainTokenOut: params.dstChainTokenOut,
        dstChainTokenOutRecipient: params.dstChainTokenOutRecipient,
        account: agent.wallet_address,
        referralCode: params.referralCode
          ? Number(params.referralCode)
          : undefined,
      });
      return {
        status: "success",
        message: "Successfully executed bridge transfer",
        data: { txHash },
      };
    } catch (error) {
      return {
        status: "error",
        message: "Failed to execute bridge transfer",
        error: {
          code: "BRIDGE_ERROR",
          message:
            error instanceof Error ? error.message : "Unknown error occurred",
          details: error,
        },
      };
    }
  },
};
