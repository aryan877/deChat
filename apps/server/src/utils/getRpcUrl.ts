import { Cluster } from "@repo/de-agent";
import { ENV } from "../const/env.js";

export function getRpcUrl(cluster: Cluster): string {
  if (cluster !== "sonicBlaze") {
    throw new Error(`Invalid cluster ${cluster}`);
  }

  const rpcUrl = ENV.RPC.TESTNET;
  if (!rpcUrl) {
    throw new Error(`RPC URL not configured for cluster ${cluster}`);
  }

  return rpcUrl;
}
