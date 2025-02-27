import { z } from "zod";
import type { Action } from "../../types/action.js";
import { checkDebridgeTransactionStatus } from "../../tools/debridge/checkTransactionStatus.js";
import { ACTION_NAMES } from "../actionNames.js";

const checkTransactionStatusSchema = z.object({
  txHash: z.string().describe("The transaction hash to check status for"),
});

export type CheckTransactionStatusInput = z.infer<
  typeof checkTransactionStatusSchema
>;

export const checkTransactionStatusAction: Action = {
  name: ACTION_NAMES.DEBRIDGE_CHECK_TRANSACTION_STATUS,
  similes: [
    "check bridge transaction status",
    "get bridge transaction status",
    "check debridge transaction",
    "verify bridge status",
  ],
  description: "Check the status of a cross-chain bridge transaction",
  examples: [
    [
      {
        input: { txHash: "0x123..." },
        output: { status: "completed", orderLink: "https://..." },
        explanation: "Returns the status of a bridge transaction",
      },
    ],
  ],
  schema: checkTransactionStatusSchema,
  handler: async (agent, input) => {
    const params = input as CheckTransactionStatusInput;
    try {
      const status = await checkDebridgeTransactionStatus(agent, params.txHash);
      return {
        status: "success",
        message: "Successfully retrieved transaction status",
        data: status,
      };
    } catch (error) {
      return {
        status: "error",
        message: "Failed to check transaction status",
        error: {
          code: "FETCH_ERROR",
          message:
            error instanceof Error ? error.message : "Unknown error occurred",
          details: error,
        },
      };
    }
  },
};
