import { DeAgent, Cluster } from "@repo/de-agent";
import { privyClient } from "../lib/privyClient.js";
import { ENV } from "../const/env.js";

const RPC_ENDPOINTS = {
  // Sonic Blaze testnet endpoints
  sonicBlaze: {
    default: ENV.RPC.TESTNET,
    backups: [],
  },
  // Sonic Mainnet endpoints
  sonicMainnet: {
    default: ENV.RPC.MAINNET,
    backups: [],
  },
};

interface GenerateDeChatAgentParams {
  address: string;
  cluster: Cluster;
  customRpcUrl?: string;
  // Add options for gas configuration
  gasOptions?: {
    gasMultiplier?: number;
    maxFeePerGasMultiplier?: number;
    maxPriorityFeePerGasMultiplier?: number;
  };
}

/**
 * Creates a DeAgent instance configured for the specified address and network
 *
 * @param params Configuration parameters for the DeAgent
 * @returns Configured DeAgent instance
 */
export function generateDeChatAgent({
  address,
  cluster,
  customRpcUrl,
  gasOptions = {},
}: GenerateDeChatAgentParams): DeAgent {
  // Validate cluster is supported
  if (!Object.keys(RPC_ENDPOINTS).includes(cluster)) {
    throw new Error(
      `Invalid cluster - must be one of: ${Object.keys(RPC_ENDPOINTS).join(", ")}`
    );
  }

  const rpcUrl = customRpcUrl || RPC_ENDPOINTS[cluster].default;

  // Validate address format before passing to DeAgent
  if (!address || !address.startsWith("0x") || address.length !== 42) {
    throw new Error(
      "Invalid address format. Must be a 0x-prefixed hex string of length 42"
    );
  }

  if (!rpcUrl) {
    throw new Error(`RPC URL is undefined for cluster: ${cluster}`);
  }

  const PRIVY_APP_ID =
    process.env.NODE_ENV === "production"
      ? ENV.PRIVY.PROD.APP_ID
      : ENV.PRIVY.DEV.APP_ID;
  const PRIVY_APP_SECRET =
    process.env.NODE_ENV === "production"
      ? ENV.PRIVY.PROD.APP_SECRET
      : ENV.PRIVY.DEV.APP_SECRET;

  if (!ENV.OPENAI_API_KEY || !PRIVY_APP_ID || !PRIVY_APP_SECRET) {
    throw new Error(
      `Missing required environment variables: ${[
        !ENV.OPENAI_API_KEY && "OPENAI_API_KEY",
        !PRIVY_APP_ID && "PRIVY_APP_ID",
        !PRIVY_APP_SECRET && "PRIVY_APP_SECRET",
      ]
        .filter(Boolean)
        .join(", ")}`
    );
  }

  // Create the DeAgent with the specified configuration
  const agent = new DeAgent(
    rpcUrl,
    {
      OPENAI_API_KEY: ENV.OPENAI_API_KEY,
      PRIORITY_LEVEL: "high",
      // Add gas configuration options
      GAS_MULTIPLIER: gasOptions.gasMultiplier || 1.5,
      MAX_FEE_PER_GAS_MULTIPLIER: gasOptions.maxFeePerGasMultiplier || 1.5,
      MAX_PRIORITY_FEE_PER_GAS_MULTIPLIER:
        gasOptions.maxPriorityFeePerGasMultiplier || 1.5,
    },
    privyClient,
    address,
    PRIVY_APP_ID,
    PRIVY_APP_SECRET
  );

  // Log the configuration for debugging
  console.log(
    `DeAgent created for address ${address} on ${cluster} using RPC: ${rpcUrl}`
  );

  return agent;
}
