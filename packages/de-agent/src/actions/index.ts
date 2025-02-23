import { ACTION_NAMES } from "./actionNames.js";
import { z } from "zod";
import type { Action, ActionExample, Handler } from "../types/action.js";
import { getSupportedChainsAction } from "./debridge/index.js";
import { sonicActions } from "./sonic/index.js";
import askForConfirmationAction from "./confirmation/askForConfirmation.js";

export { ACTION_NAMES };

export const ACTIONS: Record<string, Action> = {
  hello: {
    name: "hello",
    similes: ["hi", "greet"],
    description: "A simple greeting action that says hello",
    examples: [
      [
        {
          input: { name: "Alice" },
          output: { message: "Hello Alice!" },
          explanation: "Greets the user with their name",
        },
      ],
    ],
    schema: z.object({
      name: z.string().optional(),
    }),
    handler: async (agent, input) => {
      const name = input.name || "World";
      return {
        status: "success",
        message: `Hello ${name}!`,
      };
    },
  },
  [ACTION_NAMES.GET_SUPPORTED_CHAINS]: getSupportedChainsAction,
  [ACTION_NAMES.ASK_FOR_CONFIRMATION]: askForConfirmationAction,
  ...sonicActions,
};

export type { Action, ActionExample, Handler };
