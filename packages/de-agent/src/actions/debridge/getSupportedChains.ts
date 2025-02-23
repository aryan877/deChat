import { z } from "zod";
import type { Action } from "../../types/action.js";
import { getDebridgeSupportedChains } from "../../tools/debridge/getSupportedChains.js";
import { ACTION_NAMES } from "../actionNames.js";

export const getSupportedChainsAction: Action = {
  name: ACTION_NAMES.GET_SUPPORTED_CHAINS,
  similes: [
    "get supported chains",
    "list supported chains",
    "show chain support",
  ],
  description: "Get a list of all chains supported by the deBridge protocol",
  examples: [
    [
      {
        input: {},
        output: { chains: ["Ethereum", "BSC", "Arbitrum", "etc..."] },
        explanation: "Returns a list of all supported blockchain networks",
      },
    ],
  ],
  schema: z.object({}),
  handler: async () => {
    try {
      const supportedChains = await getDebridgeSupportedChains();
      return {
        status: "success",
        message:
          "Successfully retrieved supported chains. The chains are shown in the UI do not re-iterate them.",
        data: supportedChains,
      };
    } catch (error) {
      return {
        status: "error",
        message: "Failed to get supported chains",
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
