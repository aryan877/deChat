import { ACTION_NAMES } from "../actionNames.js";
import type { Action } from "../../types/action.js";

// Import individual actions
import { fetchTopicsAction } from "./fetchTopics.js";
import { fetchInferenceAction } from "./fetchInference.js";
import { fetchPriceInferenceAction } from "./fetchPriceInference.js";

// Export individual actions
export { fetchTopicsAction } from "./fetchTopics.js";
export { fetchInferenceAction } from "./fetchInference.js";
export { fetchPriceInferenceAction } from "./fetchPriceInference.js";

// Export all actions
export const alloraActions: Record<string, Action> = {
  [ACTION_NAMES.ALLORA_FETCH_TOPICS]: fetchTopicsAction,
  [ACTION_NAMES.ALLORA_FETCH_INFERENCE]: fetchInferenceAction,
  [ACTION_NAMES.ALLORA_FETCH_PRICE_INFERENCE]: fetchPriceInferenceAction,
} as const;
