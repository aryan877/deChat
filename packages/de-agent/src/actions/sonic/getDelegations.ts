import { z } from "zod";
import type { Action } from "../../types/action.js";
import { getSonicDelegationsByAddress } from "../../tools/sonic/getDelegations.js";
import { ACTION_NAMES } from "../actionNames.js";
import { REITERATE_PROMPT } from "../../constants/reiterate.js";

const getDelegationsSchema = z.object({
  address: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/)
    .optional()
    .describe(
      "Optional address to get delegations for. Will use agent's address if not provided."
    ),
});

export type GetDelegationsInput = z.infer<typeof getDelegationsSchema>;

export const getDelegationsAction: Action = {
  name: ACTION_NAMES.SONIC_GET_DELEGATIONS,
  similes: [
    "get my delegations",
    "show my staking delegations",
    "check my sonic delegations",
    "view my staking positions",
    "list my delegations",
  ],
  description:
    "Get list of delegations for an address (defaults to agent's address)",
  examples: [
    [
      {
        input: {},
        output: {
          data: {
            delegationsByAddress: {
              edges: [
                {
                  delegation: {
                    address: "0x4c1a59073e650549841345907f5ebac602341a9c",
                    amount: "0x1bc16d674ec80000",
                    amountDelegated: "0xde0b6b3a7640000",
                    pendingRewards: {
                      amount: "0xa87f003d60c",
                    },
                    toStakerId: "0x12",
                  },
                },
              ],
            },
          },
        },
        explanation: "Gets delegations for the agent's address",
      },
    ],
    [
      {
        input: {
          address: "0x4C1A59073E650549841345907f5EBAC602341A9C",
        },
        output: {
          data: {
            delegationsByAddress: {
              edges: [
                {
                  delegation: {
                    address: "0x4c1a59073e650549841345907f5ebac602341a9c",
                    amount: "0x1bc16d674ec80000",
                    amountDelegated: "0xde0b6b3a7640000",
                    pendingRewards: {
                      amount: "0xa87f003d60c",
                    },
                    toStakerId: "0x12",
                  },
                },
              ],
            },
          },
        },
        explanation: "Gets delegations for a specific address",
      },
    ],
  ],
  schema: getDelegationsSchema,
  handler: async (agent, input) => {
    const params = input as GetDelegationsInput;
    try {
      const result = await getSonicDelegationsByAddress(agent, params.address);
      return {
        status: "success",
        message: `Successfully retrieved delegations. ${REITERATE_PROMPT}`,
        data: result,
      };
    } catch (error) {
      return {
        status: "error",
        message: "Failed to get delegations",
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
