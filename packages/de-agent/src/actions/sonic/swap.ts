import { z } from "zod";
import type { Action } from "../../types/action.js";
import { executeSwap } from "../../tools/sonic/swap.js";
import { ACTION_NAMES } from "../actionNames.js";

const swapSchema = z.object({
  pathId: z.string(),
});

export type SwapInput = z.infer<typeof swapSchema>;

export const swapAction: Action = {
  name: ACTION_NAMES.SONIC_SWAP,
  similes: [
    "execute sonic swap",
    "perform sonic swap",
    "swap tokens on sonic",
    "execute token exchange",
  ],
  description:
    "Execute a token swap on Sonic using a previously obtained pathId",
  examples: [
    [
      {
        input: {
          pathId: "e339d1f632d6e404b2b9986b44c9bcc8",
        },
        output: { txHash: "0x...", explorerUrl: "https://..." },
        explanation: "Executes a swap using the provided pathId",
      },
    ],
  ],
  schema: swapSchema,
  handler: async (agent, input) => {
    const params = input as SwapInput;
    try {
      const result = await executeSwap(agent, params.pathId);
      return {
        status: "success",
        message: `Successfully executed swap with pathId ${params.pathId}`,
        data: result,
      };
    } catch (error) {
      return {
        status: "error",
        message: "Failed to execute swap",
        error: {
          code: "SWAP_ERROR",
          message:
            error instanceof Error ? error.message : "Unknown error occurred",
          details: error,
        },
      };
    }
  },
};
