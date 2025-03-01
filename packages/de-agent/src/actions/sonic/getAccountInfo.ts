import { z } from "zod";
import type { Action } from "../../types/action.js";
import { getSonicAccountInfo } from "../../tools/sonic/index.js";
import { ACTION_NAMES } from "../actionNames.js";

const getAccountInfoSchema = z.object({
  address: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/)
    .optional()
    .describe(
      "Optional address to check. Will use agent's address if not provided."
    ),
  network: z.enum(["mainnet", "testnet"]).default("mainnet"),
  tag: z.enum(["latest", "earliest", "pending"]).default("latest"),
});

export type GetAccountInfoInput = z.infer<typeof getAccountInfoSchema>;

export const getAccountInfoAction: Action = {
  name: ACTION_NAMES.SONIC_GET_ACCOUNT_INFO,
  similes: [
    "get sonic account balance",
    "check sonic wallet balance",
    "get sonic account info",
    "check sonic address balance",
    "get my sonic balance",
    "check my sonic account",
  ],
  description:
    "Get account balance and information from Sonic chain (defaults to agent's address if none provided)",
  examples: [
    [
      {
        input: {},
        output: { balance: "1000000000000000000" },
        explanation: "Gets the balance of the agent's account on mainnet",
      },
    ],
    [
      {
        input: { address: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e" },
        output: { balance: "1000000000000000000" },
        explanation: "Gets the balance of a specific account on mainnet",
      },
    ],
  ],
  schema: getAccountInfoSchema,
  handler: async (agent, input) => {
    const params = input as GetAccountInfoInput;
    try {
      const result = await getSonicAccountInfo(
        agent,
        params.address,
        params.network,
        params.tag
      );
      const displayAddress = params.address || agent.wallet_address;
      return {
        status: "success",
        message: `Successfully retrieved account info for ${displayAddress}`,
        data: result,
      };
    } catch (error) {
      return {
        status: "error",
        message: "Failed to get account info",
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
