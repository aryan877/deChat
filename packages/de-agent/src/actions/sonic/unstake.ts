import { z } from "zod";
import type { Action } from "../../types/action.js";
import { undelegateFromValidator } from "../../tools/sonic/unstake.js";
import { ACTION_NAMES } from "../actionNames.js";

const unstakeSchema = z.object({
  validatorId: z.string().min(1),
  amount: z.string().min(1),
});

export type UnstakeInput = z.infer<typeof unstakeSchema>;

export const unstakeAction: Action = {
  name: ACTION_NAMES.SONIC_UNSTAKE,
  similes: [
    "undelegate from sonic validator",
    "unstake from sonic validator",
    "withdraw sonic tokens",
    "unstake sonic tokens from validator",
  ],
  description:
    "Undelegate (unstake) Sonic tokens from a validator by providing validator ID and amount",
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
            explorerUrl: "https://sonicscan.org/tx/0xae10b8...",
          },
        },
        explanation: "Undelegates 1 Sonic token from validator #18",
      },
    ],
  ],
  schema: unstakeSchema,
  handler: async (agent, input) => {
    const params = input as UnstakeInput;
    try {
      const result = await undelegateFromValidator(agent, {
        validatorId: params.validatorId,
        amount: params.amount,
      });
      return {
        status: "success",
        message: "Successfully undelegated tokens from validator",
        data: result.data,
      };
    } catch (error) {
      return {
        status: "error",
        message: "Failed to undelegate tokens",
        error: {
          code: "UNDELEGATION_ERROR",
          message:
            error instanceof Error ? error.message : "Unknown error occurred",
          details: error,
        },
      };
    }
  },
};
