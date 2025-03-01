import { z } from "zod";
import type { Action } from "../../types/action.js";
import { delegateToValidator } from "../../tools/sonic/index.js";
import { ACTION_NAMES } from "../actionNames.js";

const delegateSchema = z.object({
  validatorId: z.string().min(1),
  amount: z.string().min(1),
});

export type DelegateInput = z.infer<typeof delegateSchema>;

export const delegateAction: Action = {
  name: ACTION_NAMES.SONIC_DELEGATE,
  similes: [
    "delegate to sonic validator",
    "stake with sonic validator",
    "delegate sonic tokens",
    "stake sonic tokens with validator",
  ],
  description:
    "Delegate Sonic tokens to a validator by sending them as value in the transaction",
  examples: [
    [
      {
        input: {
          validatorId: "18",
          amount: "1",
        },
        output: {
          status: "success",
          data: {
            txHash: "0xae10b8...",
            explorerUrl: "https://explorer.sonic.soniclabs.com/tx/0xae10b8...",
          },
        },
        explanation: "Delegates 1 Sonic token to validator #18",
      },
    ],
  ],
  schema: delegateSchema,
  handler: async (agent, input) => {
    const params = input as DelegateInput;
    try {
      const result = await delegateToValidator(agent, params);
      return {
        status: "success",
        message: "Successfully delegated tokens to validator",
        data: result.data,
      };
    } catch (error) {
      return {
        status: "error",
        message: "Failed to delegate tokens",
        error: {
          code: "DELEGATION_ERROR",
          message:
            error instanceof Error ? error.message : "Unknown error occurred",
          details: error,
        },
      };
    }
  },
};
