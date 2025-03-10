export * from "./input.js";
export * from "./cluster.js";
export * from "./action.js";
export * from "./sonic.js";
export * from "./chainlink.js";
export * from "./dune.js";
export * from "./debridge.js";
export * from "./knowledge.js";
export * from "./allora.js";

export interface Config {
  OPENAI_API_KEY?: string;
  PRIORITY_LEVEL?: string;
  GAS_MULTIPLIER?: number;
  MAX_FEE_PER_GAS_MULTIPLIER?: number;
  MAX_PRIORITY_FEE_PER_GAS_MULTIPLIER?: number;
}

export interface TransferResult {
  txHash: string;
  explorerUrl: string;
}
