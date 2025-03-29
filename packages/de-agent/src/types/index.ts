export * from "./aave.js";
export * from "./action.js";
export * from "./allora.js";
export * from "./chainlink.js";
export * from "./cluster.js";
export * from "./debridge.js";
export * from "./dune.js";
export * from "./input.js";
export * from "./knowledge.js";
export * from "./sonic.js";

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
  provider?: "odos" | "magpie";
}
