import { z } from "zod";
import { REITERATE_PROMPT } from "../../constants/reiterate.js";
import { getUserData } from "../../tools/aave/getUserData.js";
import type { Action } from "../../types/action.js";
import { ACTION_NAMES } from "../actionNames.js";

// Schema for the action input
const getUserDataSchema = z.object({
  userAddress: z
    .string()
    .describe("User wallet address to fetch Aave data for"),
});

export type GetUserDataInput = z.infer<typeof getUserDataSchema>;

export const getUserDataAction: Action = {
  name: ACTION_NAMES.AAVE_GET_USER_DATA,
  similes: [
    "get aave position",
    "check aave balance",
    "view lending position",
    "fetch aave account",
    "show aave portfolio",
    "show health factor",
    "check borrow power",
    "view supplied assets",
    "view borrowed assets",
    "calculate APY",
  ],
  description:
    "Fetch a user's complete Aave position on Sonic including supplied assets, borrowed assets, health factor, APY, and available borrow power",
  examples: [
    [
      {
        input: {
          userAddress: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
        },
        output: {
          userSummary: {
            totalCollateralUSD: "1000.00",
            totalDebtUSD: "500.00",
            availableBorrowsUSD: "300.00",
            liquidationThreshold: "0.7295",
            healthFactor: "2.0",
            netAPY: "0.35%",
            borrowPowerUsed: "62.50%",
            userReserves: [
              {
                symbol: "USDC.e",
                supplied: "100.00",
                borrowed: "50.00",
                supplyAPY: "0.75%",
                borrowAPY: "2.5%",
              },
            ],
          },
          hasActivePosition: true,
        },
        explanation: "Gets a user's complete Aave lending position on Sonic",
      },
    ],
  ],
  schema: getUserDataSchema,
  handler: async (agent, input) => {
    const params = input as GetUserDataInput;
    try {
      const userData = await getUserData({
        userAddress: params.userAddress,
      });

      return {
        status: "success",
        message: userData.hasActivePosition
          ? `Successfully retrieved Aave user data ${REITERATE_PROMPT}`
          : "User doesn't have any active Aave positions",
        data: userData,
      };
    } catch (error) {
      return {
        status: "error",
        message: "Failed to get Aave user data",
        error: {
          code: "AAVE_DATA_ERROR",
          message:
            error instanceof Error ? error.message : "Unknown error occurred",
          details: error,
        },
      };
    }
  },
};
