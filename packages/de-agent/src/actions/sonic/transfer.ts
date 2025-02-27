import { z } from "zod";
import type { Action } from "../../types/action.js";
import { transferNative, transferToken } from "../../tools/sonic/transfer.js";
import { ACTION_NAMES } from "../actionNames.js";
import { TransferResult } from "../../types/index.js";

// Schema for validation
const addressSchema = z.string().regex(/^0x[a-fA-F0-9]{40}$/);
const amountSchema = z.string().refine((val) => !isNaN(parseFloat(val)), {
  message: "Amount must be a valid number string",
});

export const sonicTransferAction: Action = {
  name: ACTION_NAMES.SONIC_TRANSFER,
  similes: [
    "transfer sonic tokens",
    "send sonic",
    "transfer tokens on sonic",
    "send tokens on sonic chain",
  ],
  description: "Transfer SONIC tokens or other tokens on Sonic chain",
  examples: [
    [
      {
        input: {
          to: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
          amount: "1.5",
        },
        output: { txHash: "0x...", explorerUrl: "https://..." },
        explanation: "Transfers 1.5 SONIC tokens",
      },
    ],
    [
      {
        input: {
          to: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
          amount: "100",
          tokenAddress: "0x1234567890123456789012345678901234567890",
        },
        output: { txHash: "0x...", explorerUrl: "https://..." },
        explanation: "Transfers 100 tokens of the specified token contract",
      },
    ],
  ],
  schema: z.object({
    to: addressSchema,
    amount: amountSchema,
    tokenAddress: addressSchema.optional(),
  }),
  handler: async (agent, input) => {
    try {
      let result: TransferResult;

      if (input.tokenAddress) {
        // Token transfer
        result = await transferToken(
          agent,
          input.tokenAddress,
          input.to,
          input.amount
        );
      } else {
        // Native SONIC transfer
        result = await transferNative(agent, input.to, input.amount);
      }

      return {
        status: "success",
        message: `Successfully transferred ${input.amount} ${
          input.tokenAddress ? "tokens" : "SONIC"
        } to ${input.to}`,
        data: result,
      };
    } catch (error) {
      return {
        status: "error",
        message: "Failed to transfer tokens",
        error: {
          code: "TRANSFER_ERROR",
          message:
            error instanceof Error ? error.message : "Unknown error occurred",
          details: error,
        },
      };
    }
  },
};
