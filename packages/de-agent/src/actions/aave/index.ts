import { ACTION_NAMES } from "../actionNames.js";
import { getUserDataAction } from "./getUserData.js";

export * from "./getUserData.js";

export const aaveActions = {
  [ACTION_NAMES.AAVE_GET_USER_DATA]: getUserDataAction,
};
