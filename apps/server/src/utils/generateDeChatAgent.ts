import { DeAgent, Cluster } from "@repo/de-agent";
import { privyClient } from "../lib/privyClient.js";
import { ENV } from "../const/env.js";

interface GenerateDeChatAgentParams {
  address: string;
  cluster: Cluster;
}

export function generateDeChatAgent({
  address,
  cluster,
}: GenerateDeChatAgentParams): DeAgent {
  if (cluster !== "sonicBlaze") {
    throw new Error("Invalid cluster - must be sonicBlaze");
  }

  const rpcUrl = ENV.RPC.TESTNET;
  if (!rpcUrl) {
    throw new Error("RPC URL is undefined");
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

  return new DeAgent(
    rpcUrl,
    { OPENAI_API_KEY: ENV.OPENAI_API_KEY, PRIORITY_LEVEL: "high" },
    privyClient,
    address,
    PRIVY_APP_ID,
    PRIVY_APP_SECRET
  );
}
