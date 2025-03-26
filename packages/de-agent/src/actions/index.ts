import type { Action, ActionExample, Handler } from "../types/action.js";
import { aaveActions } from "./aave/index.js";
import { ACTION_NAMES } from "./actionNames.js";
import { alloraActions } from "./allora/index.js";
import { getPriceDataAction } from "./chainlink/getPriceData.js";
import { getPriceFeedsAction } from "./chainlink/getPriceFeeds.js";
import askForConfirmationAction from "./confirmation/askForConfirmation.js";
import {
  fetchBridgeQuoteAction,
  fetchTokenDataAction,
  getSupportedChainsAction,
  processTransferAction,
  verifyTxStatusAction,
} from "./debridge/index.js";
import { duneActions } from "./dune/index.js";
import { shadowTokenSearchAction } from "./knowledge/shadowTokenSearch.js";
import { sonicDocsSearchAction } from "./knowledge/sonicDocsSearch.js";
import siloFinanceAction from "./silo/siloFinance.js";
import { getDelegationsAction } from "./sonic/getDelegations.js";
import { sonicActions } from "./sonic/index.js";
import { searchAction } from "./sonic/search.js";
import { delegateAction } from "./sonic/stake.js";
import { swapAction } from "./sonic/swap.js";
import { tradeQuoteAction } from "./sonic/trade.js";
import { unstakeAction } from "./sonic/unstake.js";
import { withdrawAction } from "./sonic/withdraw.js";

export { ACTION_NAMES };

export const ACTIONS: Record<string, Action> = {
  [ACTION_NAMES.ASK_FOR_CONFIRMATION]: askForConfirmationAction,

  // Include action groups
  ...sonicActions,
  ...duneActions,
  ...alloraActions,
  ...aaveActions,

  // Silo Finance action
  [ACTION_NAMES.SILO_FINANCE]: siloFinanceAction,

  // Chainlink actions
  [ACTION_NAMES.CHAINLINK_GET_PRICE_DATA]: getPriceDataAction,
  [ACTION_NAMES.CHAINLINK_GET_PRICE_FEEDS]: getPriceFeedsAction,

  // Sonic individual actions
  [ACTION_NAMES.SONIC_STAKE]: delegateAction,
  [ACTION_NAMES.SONIC_GET_DELEGATIONS]: getDelegationsAction,
  [ACTION_NAMES.SONIC_UNSTAKE]: unstakeAction,
  [ACTION_NAMES.SONIC_WITHDRAW]: withdrawAction,
  [ACTION_NAMES.SONIC_TRADE_QUOTE]: tradeQuoteAction,
  [ACTION_NAMES.SONIC_SWAP]: swapAction,
  [ACTION_NAMES.SONIC_SEARCH]: searchAction,

  // deBridge actions
  [ACTION_NAMES.DEBRIDGE_VERIFY_TX_STATUS]: verifyTxStatusAction,
  [ACTION_NAMES.GET_SUPPORTED_CHAINS]: getSupportedChainsAction,
  [ACTION_NAMES.DEBRIDGE_EXECUTE_BRIDGE_TRANSFER]: processTransferAction,
  [ACTION_NAMES.DEBRIDGE_FETCH_BRIDGE_QUOTE]: fetchBridgeQuoteAction,
  [ACTION_NAMES.DEBRIDGE_FETCH_TOKEN_DATA]: fetchTokenDataAction,

  // Knowledge actions
  [ACTION_NAMES.SHADOW_TOKEN_SEARCH]: shadowTokenSearchAction,
  [ACTION_NAMES.SONIC_DOCS_SEARCH]: sonicDocsSearchAction,
};

export type { Action, ActionExample, Handler };
