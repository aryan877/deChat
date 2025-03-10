import { config } from "dotenv";

config();

export const ENV = {
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  MONGODB: {
    TEST_URI: process.env.MONGODB_TEST_URI,
    PROD_URI: process.env.MONGODB_PROD_URI,
  },
  PRIVY: {
    DEV: {
      APP_ID: process.env.PRIVY_DEV_APP_ID,
      APP_SECRET: process.env.PRIVY_DEV_APP_SECRET,
      WALLET_AUTH_KEY: process.env.PRIVY_DEV_WALLET_AUTHORIZATION_KEY,
    },
    PROD: {
      APP_ID: process.env.PRIVY_PROD_APP_ID,
      APP_SECRET: process.env.PRIVY_PROD_APP_SECRET,
      WALLET_AUTH_KEY: process.env.PRIVY_PROD_WALLET_AUTHORIZATION_KEY,
    },
  },
  RPC: {
    TESTNET: process.env.SONIC_TESTNET_RPC_URL,
    MAINNET: process.env.SONIC_MAINNET_RPC_URL,
  },
  FRONTEND_URL: process.env.FRONTEND_URL,
  SONIC_API_KEY: process.env.SONIC_API_KEY,
  DUNE_API_KEY: process.env.DUNE_API_KEY,
  PORT: process.env.PORT ? parseInt(process.env.PORT) : 5000,
} as const;

// Type for environment configuration
export type EnvConfig = typeof ENV;
