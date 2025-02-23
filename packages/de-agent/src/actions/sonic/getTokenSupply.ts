import { z } from "zod";
import type { Action } from "../../types/action.js";
import { getSonicTokenSupply } from "../../tools/sonic/index.js";
import { ACTION_NAMES } from "../actionNames.js";

const addressSchema = z.string().regex(/^0x[a-fA-F0-9]{40}$/);
const networkSchema = z.enum(["mainnet", "testnet"]).default("mainnet");

export const getTokenSupplyAction: Action = {
  name: ACTION_NAMES.SONIC_GET_TOKEN_SUPPLY,
  similes: [
    "get sonic token supply",
    "check sonic token total supply",
    "get sonic token circulation",
    "check sonic token amount",
  ],
  description: "Get the total supply of an ERC20 token on Sonic chain",
  examples: [
    [
      {
        input: {
          contractAddress: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
        },
        output: { supply: "1000000000000000000000000" },
        explanation: "Gets the total supply of a token on mainnet",
      },
    ],
  ],
  schema: z.object({
    contractAddress: addressSchema,
    network: networkSchema,
  }),
  handler: async (agent, input) => {
    try {
      const result = await getSonicTokenSupply(
        input.contractAddress,
        input.network
      );
      return {
        status: "success",
        message: `Successfully retrieved token supply for ${input.contractAddress}`,
        data: result,
      };
    } catch (error) {
      return {
        status: "error",
        message: "Failed to get token supply",
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
