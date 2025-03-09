import { z } from "zod";
import type { Action } from "../../types/action.js";
import { ACTION_NAMES } from "../actionNames.js";
import { getBalances } from "../../tools/dune/getBalances.js";
import { REITERATE_PROMPT } from "../../constants/reiterate.js";

const getBalancesSchema = z.object({
  address: z.string().optional(),
  chainId: z.string().optional(),
});

export type GetBalancesInput = z.infer<typeof getBalancesSchema>;

export const getBalancesAction: Action = {
  name: ACTION_NAMES.SONIC_GET_BALANCES,
  similes: [
    "get token balances",
    "check wallet balances",
    "view all tokens",
    "list all tokens",
    "show wallet assets",
  ],
  description: "Get all token balances for a wallet address using Dune API",
  examples: [
    [
      {
        input: {
          address: "0x1234...",
          chainId: "146",
        },
        output: {
          request_time: "2023-01-01T00:00:00Z",
          response_time: "2023-01-01T00:00:01Z",
          wallet_address: "0x1234...",
          balances: [
            {
              chain: "sonic",
              chain_id: 146,
              address: "0x5678...",
              amount: "1000000000000000000",
              symbol: "TOKEN",
              name: "My Token",
              decimals: 18,
              price_usd: 1.0,
              value_usd: 1.0,
            },
          ],
        },
        explanation: "Gets all token balances for a specific address",
      },
    ],
  ],
  schema: getBalancesSchema,
  handler: async (agent, input) => {
    const params = input as GetBalancesInput;
    try {
      const result = await getBalances(agent, params.address, params.chainId);

      const totalTokens = result.balances.length;
      const totalValue = result.balances.reduce(
        (sum, token) => sum + token.value_usd,
        0
      );

      return {
        status: "success",
        message: `Successfully retrieved ${totalTokens} token balances with a total value of $${totalValue.toFixed(2)}. ${REITERATE_PROMPT}`,
        data: result,
      };
    } catch (error) {
      return {
        status: "error",
        message: "Failed to get token balances",
        error: {
          code: "TOKEN_BALANCES_ERROR",
          message:
            error instanceof Error ? error.message : "Unknown error occurred",
          details: error,
        },
      };
    }
  },
};
