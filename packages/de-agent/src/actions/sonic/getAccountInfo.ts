import { z } from "zod";
import type { Action } from "../../types/action.js";
import { getSonicAccountInfo } from "../../tools/sonic/index.js";
import { ACTION_NAMES } from "../actionNames.js";

// Schema for address validation
const addressSchema = z.string().regex(/^0x[a-fA-F0-9]{40}$/);
const networkSchema = z.enum(["mainnet", "testnet"]).default("mainnet");

export const getAccountInfoAction: Action = {
  name: ACTION_NAMES.SONIC_GET_ACCOUNT_INFO,
  similes: [
    "get sonic account balance",
    "check sonic wallet balance",
    "get sonic account info",
    "check sonic address balance",
  ],
  description: "Get account balance and information from Sonic chain",
  examples: [
    [
      {
        input: { address: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e" },
        output: { balance: "1000000000000000000" },
        explanation: "Gets the balance of an account on mainnet",
      },
    ],
  ],
  schema: z.object({
    address: addressSchema,
    network: networkSchema,
    tag: z.enum(["latest", "earliest", "pending"]).default("latest"),
  }),
  handler: async (agent, input) => {
    try {
      const result = await getSonicAccountInfo(
        input.address,
        input.network,
        input.tag
      );
      return {
        status: "success",
        message: `Successfully retrieved account info for ${input.address}`,
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
