import { z } from "zod";
import { ACTION_NAMES } from "../actionNames.js";
import type { Action } from "../../types/action.js";
import {
  bridgeToSonic,
  bridgeToEthereum,
  claimOnSonic,
  claimOnEthereum,
} from "../../tools/sonic/nativeBridge.js";
import {
  SonicBridgeToSonicParams,
  SonicBridgeToEthereumParams,
  SonicClaimOnSonicParams,
  SonicClaimOnEthereumParams,
} from "../../types/nativeBridge.js";

// Schema for bridging to Sonic
const bridgeToSonicSchema = z.object({
  tokenAddress: z.string().describe("The address of the token to bridge"),
  amount: z.string().describe("The amount of tokens to bridge"),
});

// Schema for claiming on Sonic
const claimOnSonicSchema = z.object({
  depositTxHash: z.string().describe("The transaction hash of the deposit"),
  depositBlockNumber: z.number().describe("The block number of the deposit"),
  depositId: z.string().describe("The ID of the deposit"),
});

// Schema for bridging to Ethereum
const bridgeToEthereumSchema = z.object({
  tokenAddress: z.string().describe("The address of the token to bridge"),
  amount: z.string().describe("The amount of tokens to bridge"),
});

// Schema for claiming on Ethereum
const claimOnEthereumSchema = z.object({
  withdrawalTxHash: z
    .string()
    .describe("The transaction hash of the withdrawal"),
  withdrawalBlockNumber: z
    .number()
    .describe("The block number of the withdrawal"),
  withdrawalId: z.string().describe("The ID of the withdrawal"),
});

// Bridge to Sonic action
export const bridgeToSonicAction: Action = {
  name: ACTION_NAMES.SONIC_BRIDGE_TO_SONIC,
  similes: [
    "bridge to sonic",
    "transfer to sonic",
    "deposit to sonic",
    "send tokens to sonic",
    "bridge from ethereum to sonic",
  ],
  description: "Bridge tokens from Ethereum to Sonic L2 network",
  schema: bridgeToSonicSchema,
  examples: [
    [
      {
        input: {
          tokenAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC on Ethereum
          amount: "100000000", // 100 USDC (6 decimals)
        },
        output: {
          status: "success",
          message:
            "Successfully bridged 100000000 of token 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48 to Sonic",
          data: {
            transactionHash:
              "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
            mintedToken: "0x29219dd400f2Bf60E5a23d13Be72B486D4038894",
            blockNumber: 12345678,
            depositId: "123456",
          },
        },
        explanation: "Bridging 100 USDC from Ethereum to Sonic",
      },
    ],
  ],
  handler: async (agent, input) => {
    return bridgeToSonic(agent, input as SonicBridgeToSonicParams);
  },
};

// Claim on Sonic action
export const claimOnSonicAction: Action = {
  name: ACTION_NAMES.SONIC_CLAIM_ON_SONIC,
  similes: [
    "claim on sonic",
    "claim tokens on sonic",
    "finalize bridge to sonic",
    "complete transfer to sonic",
  ],
  description: "Claim tokens on Sonic after bridging from Ethereum",
  schema: claimOnSonicSchema,
  examples: [
    [
      {
        input: {
          depositTxHash:
            "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
          depositBlockNumber: 12345678,
          depositId: "123456",
        },
        output: {
          status: "success",
          message: "Successfully claimed tokens on Sonic from deposit 123456",
          data: {
            transactionHash:
              "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
            explorerUrl:
              "https://explorer.soniclabs.com/tx/0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
          },
        },
        explanation: "Claiming tokens on Sonic after bridging from Ethereum",
      },
    ],
  ],
  handler: async (agent, input) => {
    return claimOnSonic(agent, input as SonicClaimOnSonicParams);
  },
};

// Bridge to Ethereum action
export const bridgeToEthereumAction: Action = {
  name: ACTION_NAMES.SONIC_BRIDGE_TO_ETHEREUM,
  similes: [
    "bridge to ethereum",
    "transfer to ethereum",
    "withdraw to ethereum",
    "send tokens to ethereum",
    "bridge from sonic to ethereum",
  ],
  description: "Bridge tokens from Sonic to Ethereum",
  schema: bridgeToEthereumSchema,
  examples: [
    [
      {
        input: {
          tokenAddress: "0x29219dd400f2Bf60E5a23d13Be72B486D4038894", // USDC on Sonic
          amount: "100000000", // 100 USDC (6 decimals)
        },
        output: {
          status: "success",
          message:
            "Successfully initiated withdrawal of 100000000 of token 0x29219dd400f2Bf60E5a23d13Be72B486D4038894 to Ethereum",
          data: {
            transactionHash:
              "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
            blockNumber: 12345678,
            withdrawalId: "123456",
          },
        },
        explanation: "Bridging 100 USDC from Sonic to Ethereum",
      },
    ],
  ],
  handler: async (agent, input) => {
    return bridgeToEthereum(agent, input as SonicBridgeToEthereumParams);
  },
};

// Claim on Ethereum action
export const claimOnEthereumAction: Action = {
  name: ACTION_NAMES.SONIC_CLAIM_ON_ETHEREUM,
  similes: [
    "claim on ethereum",
    "claim tokens on ethereum",
    "finalize bridge to ethereum",
    "complete transfer to ethereum",
  ],
  description: "Claim tokens on Ethereum after bridging from Sonic",
  schema: claimOnEthereumSchema,
  examples: [
    [
      {
        input: {
          withdrawalTxHash:
            "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
          withdrawalBlockNumber: 12345678,
          withdrawalId: "123456",
        },
        output: {
          status: "success",
          message:
            "Successfully claimed tokens on Ethereum from withdrawal 123456",
          data: {
            transactionHash:
              "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
            explorerUrl:
              "https://etherscan.io/tx/0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
          },
        },
        explanation: "Claiming tokens on Ethereum after bridging from Sonic",
      },
    ],
  ],
  handler: async (agent, input) => {
    return claimOnEthereum(agent, input as SonicClaimOnEthereumParams);
  },
};
