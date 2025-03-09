import { z } from "zod";
import type { Action } from "../../types/action.js";
import axios from "axios";

const getSonicPointsSchema = z.object({
  walletAddress: z.string().optional(),
});

export type GetSonicPointsParams = z.infer<typeof getSonicPointsSchema>;

export const getSonicPointsAction: Action = {
  name: "getSonicPoints",
  similes: ["getPoints", "fetchSonicPoints", "checkPoints"],
  description: "Get Sonic Points statistics for a wallet address",
  schema: getSonicPointsSchema,
  examples: [
    [
      {
        input: {},
        output: {
          status: "success",
          message: "Successfully retrieved Sonic Points data",
          data: {
            user_activity_last_detected: "2025-03-09T06:00:00+00:00",
            wallet_address: "0x4c1a59073e650549841345907f5ebac602341a9c",
            sonic_points: 2405.495587507472,
            loyalty_multiplier: 1,
            ecosystem_points: 2405.495587507472,
            passive_liquidity_points: 2405.495587507472,
            active_liquidity_points: 0,
            rank: 112710,
          },
        },
        explanation: "Fetches Sonic Points for the agent's wallet address",
      },
      {
        input: {
          walletAddress: "0x4c1a59073e650549841345907f5ebac602341a9c",
        },
        output: {
          status: "success",
          message: "Successfully retrieved Sonic Points data",
          data: {
            user_activity_last_detected: "2025-03-09T06:00:00+00:00",
            wallet_address: "0x4c1a59073e650549841345907f5ebac602341a9c",
            sonic_points: 2405.495587507472,
            loyalty_multiplier: 1,
            ecosystem_points: 2405.495587507472,
            passive_liquidity_points: 2405.495587507472,
            active_liquidity_points: 0,
            rank: 112710,
          },
        },
        explanation: "Fetches Sonic Points for a specific wallet address",
      },
    ],
  ],
  requiresConfirmation: false,
  handler: async (agent, input) => {
    try {
      // Use provided wallet address or default to agent wallet
      const { walletAddress } = input as GetSonicPointsParams;
      const address = walletAddress || agent.wallet_address;

      if (!address) {
        throw new Error(
          "No wallet address provided and agent wallet address not available"
        );
      }

      // Fetch data from the API using axios
      const response = await axios.get(
        `https://www.data-openblocklabs.com/sonic/user-points-stats?wallet_address=${address}`
      );

      return {
        status: "success",
        message: "Successfully retrieved Sonic Points data",
        data: response.data,
      };
    } catch (error) {
      return {
        status: "error",
        message: `Failed to get Sonic Points: ${error instanceof Error ? error.message : String(error)}`,
        error: {
          code: "SONIC_POINTS_ERROR",
          message: "Failed to fetch Sonic Points data",
          details: error,
        },
      };
    }
  },
};
