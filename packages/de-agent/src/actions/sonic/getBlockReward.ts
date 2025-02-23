import { z } from "zod";
import type { Action } from "../../types/action.js";
import { getSonicBlockReward } from "../../tools/sonic/index.js";
import { ACTION_NAMES } from "../actionNames.js";

const networkSchema = z.enum(["mainnet", "testnet"]).default("mainnet");
const blockNumberSchema = z.union([z.number(), z.literal("latest")]);

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
  schema: z.object({
    blockNumber: blockNumberSchema,
    network: networkSchema,
  }),
  handler: async (agent, input) => {
    try {
      const result = await getSonicBlockReward(
        input.blockNumber,
        input.network
      );
      return {
        status: "success",
        message: `Successfully retrieved block rewards for block ${input.blockNumber}`,
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
