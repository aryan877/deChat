import { ACTION_NAMES } from "./actionNames.js";
import type { Action, ActionExample, Handler } from "../types/action.js";
import { getSupportedChainsAction } from "./debridge/index.js";
import { sonicActions } from "./sonic/index.js";
import askForConfirmationAction from "./confirmation/askForConfirmation.js";

export { ACTION_NAMES };

export const ACTIONS: Record<string, Action> = {
  [ACTION_NAMES.GET_SUPPORTED_CHAINS]: getSupportedChainsAction,
  [ACTION_NAMES.ASK_FOR_CONFIRMATION]: askForConfirmationAction,
  ...sonicActions,
};

export type { Action, ActionExample, Handler };
