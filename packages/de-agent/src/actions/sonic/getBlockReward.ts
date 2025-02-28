import { z } from "zod";
import type { Action } from "../../types/action.js";
import { getSonicBlockReward } from "../../tools/sonic/index.js";
import { ACTION_NAMES } from "../actionNames.js";

const getBlockRewardSchema = z.object({
  blockNumber: z.union([z.number(), z.literal("latest")]),
  network: z.enum(["mainnet", "testnet"]).default("mainnet"),
});

export type GetBlockRewardInput = z.infer<typeof getBlockRewardSchema>;

export const getBlockRewardAction: Action = {
  name: ACTION_NAMES.SONIC_GET_BLOCK_REWARD,
  similes: [
    "get sonic block reward",
    "check sonic block rewards",
    "get sonic block mining reward",
    "check sonic block miner payment",
  ],
  description: "Get block rewards and uncle blocks from Sonic chain",
  examples: [
    [
      {
        input: { blockNumber: 12345 },
        output: {
          blockReward: "2000000000000000000",
          uncleInclusionReward: "0",
          uncles: [],
        },
        explanation: "Gets the rewards for a specific block on mainnet",
      },
    ],
  ],
  schema: getBlockRewardSchema,
  handler: async (agent, input) => {
    const params = input as GetBlockRewardInput;
    try {
      const result = await getSonicBlockReward(
        params.blockNumber,
        params.network
      );
      return {
        status: "success",
        message: `Successfully retrieved block rewards for block ${params.blockNumber}`,
        data: result,
      };
    } catch (error) {
      return {
        status: "error",
        message: "Failed to get block rewards",
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
