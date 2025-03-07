import { z } from "zod";
import type { Action } from "../../types/action.js";
import { ACTION_NAMES } from "../actionNames.js";
import { getTokenBalance } from "../../tools/sonic/getTokenBalance.js";
import { REITERATE_PROMPT } from "../../constants/reiterate.js";

const getTokenBalanceSchema = z.object({
  tokenAddress: z.string(),
  address: z.string().optional(),
});

export type GetTokenBalanceInput = z.infer<typeof getTokenBalanceSchema>;

export const getTokenBalanceAction: Action = {
  name: ACTION_NAMES.SONIC_GET_TOKEN_BALANCE,
  similes: [
    "get token balance",
    "check token balance",
    "view token balance",
    "get erc20 balance",
    "check erc20 token",
  ],
  description: "Get balance of any ERC20 token for a given address",
  examples: [
    [
      {
        input: {
          tokenAddress: "0x1234...",
          address: "0x5678...",
        },
        output: {
          address: "0x5678...",
          tokenAddress: "0x1234...",
          balance: "1000000000000000000",
          symbol: "TOKEN",
          name: "My Token",
          decimals: 18,
        },
        explanation: "Gets the token balance for a specific address",
      },
    ],
  ],
  schema: getTokenBalanceSchema,
  handler: async (agent, input) => {
    const params = input as GetTokenBalanceInput;
    try {
      const result = await getTokenBalance(
        agent,
        params.tokenAddress,
        params.address
      );
      return {
        status: "success",
        message: `Successfully retrieved balance of ${result.name} (${result.symbol}). ${REITERATE_PROMPT}`,
        data: result,
      };
    } catch (error) {
      return {
        status: "error",
        message: "Failed to get token balance",
        error: {
          code: "TOKEN_BALANCE_ERROR",
          message:
            error instanceof Error ? error.message : "Unknown error occurred",
          details: error,
        },
      };
    }
  },
};
