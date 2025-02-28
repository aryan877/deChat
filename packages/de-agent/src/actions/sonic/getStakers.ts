import { z } from "zod";
import type { Action } from "../../types/action.js";
import { getSonicStakers } from "../../tools/sonic/index.js";
import { ACTION_NAMES } from "../actionNames.js";
import { REITERATE_PROMPT } from "../../constants/reiterate.js";

export const getStakersAction: Action = {
  name: ACTION_NAMES.SONIC_GET_STAKERS,
  similes: [
    "get sonic stakers",
    "get sonic validators",
    "list sonic stakers",
    "check sonic validators",
    "view sonic staking participants",
  ],
  description:
    "Get list of stakers/validators on the Sonic platform with their stakes and information",
  examples: [
    [
      {
        input: {},
        output: {
          data: {
            stakers: [
              {
                id: "0x12",
                isActive: true,
                stake: "0x14adf4b7320334b9000000",
                stakerAddress: "0x62e6c2d4c75aeb7f82d2ff192932ef89b0a8cbdb",
                stakerInfo: {
                  name: "Sonic Goat 1 - MAX APR",
                  logoUrl:
                    "https://repository.sonic.soniclabs.com/validator/goat1.jpg",
                },
              },
            ],
          },
        },
        explanation: "Gets the list of stakers",
      },
    ],
  ],
  schema: z.object({}),
  handler: async () => {
    try {
      const result = await getSonicStakers();
      return {
        status: "success",
        message: `Successfully retrieved stakers list. ${REITERATE_PROMPT}`,
        data: result,
      };
    } catch (error) {
      return {
        status: "error",
        message: "Failed to get stakers",
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
