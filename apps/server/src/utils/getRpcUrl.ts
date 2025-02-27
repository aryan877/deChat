import { Cluster } from "@repo/de-agent";
import { ENV } from "../const/env.js";

export function getRpcUrl(cluster: Cluster): string {
  // Map clusters to their respective RPC URLs
  const rpcUrls = {
    sonicBlaze: ENV.RPC.TESTNET,
    sonicMainnet: ENV.RPC.MAINNET,
  };

  // Check if the cluster is valid
  if (!(cluster in rpcUrls)) {
    throw new Error(`Invalid cluster ${cluster}`);
  }

  const rpcUrl = rpcUrls[cluster];
  if (!rpcUrl) {
    throw new Error(`RPC URL not configured for cluster ${cluster}`);
  }

  return rpcUrl;
}
