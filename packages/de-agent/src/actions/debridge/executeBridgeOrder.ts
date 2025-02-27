import { z } from "zod";
import type { Action } from "../../types/action.js";
import { executeDebridgeBridgeOrder } from "../../tools/debridge/executeBridgeOrder.js";
import { ACTION_NAMES } from "../actionNames.js";
import type { deBridgeOrderResponse } from "../../types/index.js";

const executeBridgeOrderSchema = z.object({
  transactionData: z
    .custom<deBridgeOrderResponse>((val) => {
      return typeof val === "object" && val !== null && "tx" in val;
    })
    .describe("Transaction data from deBridge API"),
});

export type ExecuteBridgeOrderInput = z.infer<typeof executeBridgeOrderSchema>;

export const executeBridgeOrderAction: Action = {
  name: ACTION_NAMES.DEBRIDGE_EXECUTE_BRIDGE_ORDER,
  similes: [
    "execute bridge order",
    "submit bridge transaction",
    "complete token bridge",
    "send cross-chain transfer",
  ],
  description: "Execute a bridge transaction on the source chain",
  examples: [
    [
      {
        input: {
          transactionData: {
            orderId: "123",
            tx: {
              to: "0x...",
              data: "0x...",
              value: "0",
            },
          },
        },
        output: {
          txHash: "0x...",
        },
        explanation:
          "Executes a bridge transaction and returns the transaction hash",
      },
    ],
  ],
  schema: executeBridgeOrderSchema,
  handler: async (agent, input) => {
    const params = input as ExecuteBridgeOrderInput;
    try {
      const txHash = await executeDebridgeBridgeOrder(
        agent,
        params.transactionData
      );
      return {
        status: "success",
        message: "Successfully executed bridge transaction",
        data: { txHash },
      };
    } catch (error) {
      return {
        status: "error",
        message: "Failed to execute bridge transaction",
        error: {
          code: "EXECUTION_ERROR",
          message:
            error instanceof Error ? error.message : "Unknown error occurred",
          details: error,
        },
      };
    }
  },
};
