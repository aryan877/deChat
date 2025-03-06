import { ACTION_NAMES } from "./actionNames.js";
import type { Action, ActionExample, Handler } from "../types/action.js";
import { getSupportedChainsAction } from "./debridge/index.js";
import { sonicActions } from "./sonic/index.js";
import askForConfirmationAction from "./confirmation/askForConfirmation.js";
import { getPriceDataAction } from "./chainlink/getPriceData.js";
import { getPriceFeedsAction } from "./chainlink/getPriceFeeds.js";
import { delegateAction } from "./sonic/stake.js";
import { getDelegationsAction } from "./sonic/getDelegations.js";
import { unstakeAction } from "./sonic/unstake.js";
import { tradeQuoteAction } from "./sonic/trade.js";
import { searchAction } from "./sonic/search.js";

export { ACTION_NAMES };

export const ACTIONS: Record<string, Action> = {
  [ACTION_NAMES.GET_SUPPORTED_CHAINS]: getSupportedChainsAction,
  [ACTION_NAMES.ASK_FOR_CONFIRMATION]: askForConfirmationAction,
  ...sonicActions,
  [ACTION_NAMES.CHAINLINK_GET_PRICE_DATA]: getPriceDataAction,
  [ACTION_NAMES.CHAINLINK_GET_PRICE_FEEDS]: getPriceFeedsAction,
  [ACTION_NAMES.SONIC_STAKE]: delegateAction,
  [ACTION_NAMES.SONIC_GET_DELEGATIONS]: getDelegationsAction,
  [ACTION_NAMES.SONIC_UNSTAKE]: unstakeAction,
  [ACTION_NAMES.SONIC_TRADE_QUOTE]: tradeQuoteAction,
  [ACTION_NAMES.SONIC_SEARCH]: searchAction,
};

export type { Action, ActionExample, Handler };
