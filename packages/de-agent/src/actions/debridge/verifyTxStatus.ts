import { z } from "zod";
import type { Action } from "../../types/action.js";
import { verifyTxStatus } from "../../tools/debridge/verifyTxStatus.js";
import { ACTION_NAMES } from "../actionNames.js";

const verifyTxStatusSchema = z.object({
  txHash: z.string().describe("The transaction hash to check status for"),
});

export type VerifyTxStatusInput = z.infer<typeof verifyTxStatusSchema>;

export const verifyTxStatusAction: Action = {
  name: ACTION_NAMES.DEBRIDGE_VERIFY_TX_STATUS,
  similes: [
    "verify bridge transaction status",
    "get bridge transaction status",
    "check debridge transaction",
    "verify bridge status",
  ],
  description: "Verify the status of a cross-chain bridge transaction",
  examples: [
    [
      {
        input: { txHash: "0x123..." },
        output: { status: "completed", orderLink: "https://..." },
        explanation: "Returns the status of a bridge transaction",
      },
    ],
  ],
  schema: verifyTxStatusSchema,
  handler: async (agent, input) => {
    const params = input as VerifyTxStatusInput;
    try {
      const status = await verifyTxStatus(agent, params.txHash);
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
