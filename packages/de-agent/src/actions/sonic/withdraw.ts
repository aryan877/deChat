import { z } from "zod";
import type { Action } from "../../types/action.js";
import { withdrawFromValidator } from "../../tools/sonic/withdraw.js";
import { ACTION_NAMES } from "../actionNames.js";

// Schema for withdraw parameters
const withdrawSchema = z.object({
  validatorId: z.string().min(1, "Validator ID is required"),
  wrId: z.string().min(1, "Withdrawal request ID is required"),
});

export type WithdrawInput = z.infer<typeof withdrawSchema>;

/**
 * Action to withdraw previously undelegated stake from a validator after the lock period
 */
export const withdrawAction: Action = {
  name: ACTION_NAMES.SONIC_WITHDRAW,
  description:
    "Withdraw previously undelegated stake from a validator after the lock period has ended",
  similes: [
    "withdraw stake",
    "claim undelegated tokens",
    "withdraw from validator",
  ],
  examples: [
    [
      {
        input: {
          validatorId: "18",
          wrId: "174124237453618",
        },
        output: {
          status: "success",
          data: {
            txHash: "0xae10b8...",
            explorerUrl: "https://explorer.sonic.soniclabs.com/tx/0xae10b8...",
          },
        },
        explanation:
          "Withdraws previously undelegated stake from validator #18 with withdrawal request ID 174124237453618",
      },
    ],
  ],
  schema: withdrawSchema,
  handler: async (agent, input) => {
    const params = input as WithdrawInput;
    try {
      const result = await withdrawFromValidator(agent, params);
      return {
        status: "success",
        message: "Successfully withdrew tokens from validator",
        data: result.data,
      };
    } catch (error) {
      return {
        status: "error",
        message: "Failed to withdraw tokens",
        error: {
          code: "WITHDRAWAL_ERROR",
          message:
            error instanceof Error ? error.message : "Unknown error occurred",
          details: error,
        },
      };
    }
  },
};
