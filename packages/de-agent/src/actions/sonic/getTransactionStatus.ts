import { z } from "zod";
import type { Action } from "../../types/action.js";
import { getSonicTransactionStatus } from "../../tools/sonic/index.js";
import { ACTION_NAMES } from "../actionNames.js";

const getTransactionStatusSchema = z.object({
  txHash: z.string().regex(/^0x[a-fA-F0-9]{64}$/),
  network: z.enum(["mainnet", "testnet"]).default("mainnet"),
});

export type GetTransactionStatusInput = z.infer<
  typeof getTransactionStatusSchema
>;

export const getTransactionStatusAction: Action = {
  name: ACTION_NAMES.SONIC_GET_TRANSACTION_STATUS,
  similes: [
    "get sonic transaction status",
    "check sonic tx status",
    "get sonic tx result",
    "verify sonic transaction",
  ],
  description:
    "Get the execution status and error message of a transaction on Sonic chain",
  examples: [
    [
      {
        input: {
          txHash:
            "0x1234567890123456789012345678901234567890123456789012345678901234",
        },
        output: { isError: "0", errDescription: "" },
        explanation: "Gets the status of a transaction on mainnet",
      },
    ],
  ],
  schema: getTransactionStatusSchema,
  handler: async (agent, input) => {
    const params = input as GetTransactionStatusInput;
    try {
      const result = await getSonicTransactionStatus(
        params.txHash,
        params.network
      );
      return {
        status: "success",
        message: `Successfully retrieved transaction status for ${params.txHash}`,
        data: result,
      };
    } catch (error) {
      return {
        status: "error",
        message: "Failed to get transaction status",
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
