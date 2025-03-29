import { z } from "zod";
import { executeSwap } from "../../tools/sonic/swap.js";
import type { Action } from "../../types/action.js";
import { ACTION_NAMES } from "../actionNames.js";

const swapSchema = z.object({
  pathId: z.string(),
  provider: z.enum(["odos", "magpie"]).optional(),
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
    "Execute a token swap on Sonic using a previously obtained pathId. Can use either ODOS or Magpie as providers.",
  examples: [
    [
      {
        input: {
          pathId: "e339d1f632d6e404b2b9986b44c9bcc8",
        },
        output: {
          txHash: "0x...",
          explorerUrl: "https://...",
          provider: "odos",
        },
        explanation:
          "Executes a swap using the provided pathId with automatic provider detection",
      },
      {
        input: {
          pathId: "99528e08-0481-46b1-accf-2b65202ff45a",
          provider: "magpie",
        },
        output: {
          txHash: "0x...",
          explorerUrl: "https://...",
          provider: "magpie",
        },
        explanation: "Executes a swap using Magpie as the provider",
      },
    ],
  ],
  schema: swapSchema,
  handler: async (agent, input) => {
    const params = input as SwapInput;
    try {
      const result = await executeSwap(agent, params.pathId, params.provider);
      return {
        status: "success",
        message: `Successfully executed swap with ${result.provider} (pathId: ${params.pathId})`,
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
