import { PrivyClient } from "@privy-io/server-auth";
import { config } from "dotenv";

config();

const PRIVY_APP_ID =
  process.env.NODE_ENV === "production"
    ? process.env.PRIVY_PROD_APP_ID
    : process.env.PRIVY_DEV_APP_ID;

const PRIVY_APP_SECRET =
  process.env.NODE_ENV === "production"
    ? process.env.PRIVY_PROD_APP_SECRET
    : process.env.PRIVY_DEV_APP_SECRET;

const PRIVY_WALLET_AUTHORIZATION_KEY =
  process.env.NODE_ENV === "production"
    ? process.env.PRIVY_PROD_WALLET_AUTHORIZATION_KEY
    : process.env.PRIVY_DEV_WALLET_AUTHORIZATION_KEY;

if (!PRIVY_APP_ID) {
  throw new Error("Missing Privy App ID for current environment");
}

if (!PRIVY_APP_SECRET) {
  throw new Error("Missing Privy App Secret for current environment");
}

export const privyClient = new PrivyClient(PRIVY_APP_ID, PRIVY_APP_SECRET, {
  walletApi: {
    authorizationPrivateKey: PRIVY_WALLET_AUTHORIZATION_KEY,
  },
});
