import { z } from "zod";
import { Action } from "../../types/action.js";
import { ACTION_NAMES } from "../actionNames.js";

export type SiloFinanceInput = z.infer<typeof siloFinanceSchema>;

const siloFinanceSchema = z.object({
  function: z
    .enum(["getMarkets", "getStats"])
    .describe("The function to execute (getMarkets, getStats)"),
  chainKey: z
    .string()
    .optional()
    .describe(
      "Chain key (e.g., 'sonic', 'ethereum'). Defaults to 'sonic'. Only used for getMarkets function."
    ),
  search: z
    .string()
    .optional()
    .describe(
      "Optional search term to filter markets. Only used for getMarkets function."
    ),
});

const siloFinanceAction: Action = {
  name: ACTION_NAMES.SILO_FINANCE,
  similes: [
    "silo markets",
    "get silo finance markets",
    "show silo markets",
    "silo stats",
    "get silo finance tvl",
    "show silo metrics",
  ],
  description:
    "Interacts with Silo Finance protocol to fetch markets, TVL, and other metrics",
  examples: [
    [
      {
        input: {
          function: "getMarkets",
          chainKey: "sonic",
        },
        output: {
          status: "success",
          data: {
            markets: [
              {
                id: "Market-1",
                chainKey: "sonic",
                silo0: {
                  symbol: "SONIC",
                  name: "Sonic Token",
                  tvl: "1000000000000000000000",
                  decimals: 18,
                },
              },
            ],
          },
          message: "Successfully fetched Silo Finance markets",
        },
        explanation: "Fetch Silo Finance markets for Sonic chain",
      },
    ],
    [
      {
        input: {
          function: "getStats",
        },
        output: {
          status: "success",
          data: {
            tvlUsd: 516.1,
            formattedTvl: "$516.1M",
            deploymentDays: 146,
          },
          message: "Successfully fetched Silo Finance metrics",
        },
        explanation: "Fetch current Silo Finance TVL and metrics",
      },
    ],
  ],
  schema: siloFinanceSchema,
};

export default siloFinanceAction;
