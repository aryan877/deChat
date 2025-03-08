import { ACTION_NAMES } from "../actionNames.js";
import type { Action } from "../../types/action.js";

// Import individual actions
import { getAccountInfoAction } from "./getAccountInfo.js";
import { getBlockRewardAction } from "./getBlockReward.js";
import { getTokenSupplyAction } from "./getTokenSupply.js";
import { getTransactionStatusAction } from "./getTransactionStatus.js";
import { sonicTransferAction } from "./transfer.js";
import { getStakersAction } from "./getStakers.js";
import { getTokenBalanceAction } from "./getTokenBalance.js";

// Export individual actions
export { getAccountInfoAction } from "./getAccountInfo.js";
export { getBlockRewardAction } from "./getBlockReward.js";
export { getTokenSupplyAction } from "./getTokenSupply.js";
export { getTransactionStatusAction } from "./getTransactionStatus.js";
export { getStakersAction } from "./getStakers.js";
export { getTokenBalanceAction } from "./getTokenBalance.js";

// Export all actions
export const sonicActions: Record<string, Action> = {
  [ACTION_NAMES.SONIC_GET_ACCOUNT_INFO]: getAccountInfoAction,
  [ACTION_NAMES.SONIC_GET_BLOCK_REWARD]: getBlockRewardAction,
  [ACTION_NAMES.SONIC_GET_TOKEN_SUPPLY]: getTokenSupplyAction,
  [ACTION_NAMES.SONIC_GET_TRANSACTION_STATUS]: getTransactionStatusAction,
  [ACTION_NAMES.SONIC_TRANSFER]: sonicTransferAction,
  [ACTION_NAMES.SONIC_GET_STAKERS]: getStakersAction,
  [ACTION_NAMES.SONIC_GET_TOKEN_BALANCE]: getTokenBalanceAction,
} as const;
