import { ACTION_NAMES } from "../actionNames.js";
import { getBalancesAction } from "./getBalances.js";

export const duneActions = {
  [ACTION_NAMES.SONIC_GET_BALANCES]: getBalancesAction,
};

export * from "./getBalances.js";
