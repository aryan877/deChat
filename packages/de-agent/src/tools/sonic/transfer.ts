import { ethers } from "ethers";
import { DeAgent } from "../../agent/index.js";
import { Cluster } from "../../types/cluster.js";
import { TransferResult } from "../../types/index.js";
import { validateAddress } from "./utils.js";

const ERC20_ABI = [
  "function transfer(address to, uint256 amount) returns (bool)",
  "function decimals() view returns (uint8)",
] as const;

// Block explorer URLs for different networks
const BLOCK_EXPLORER_URLS = {
  sonicBlaze: "https://testnet.sonicscan.org/tx/",
  sonicMainnet: "https://sonicscan.org/tx/",
};

/**
 * Get the block explorer URL for a transaction
 * @param txHash Transaction hash
 * @param cluster Network cluster
 * @returns Full block explorer URL
 */
function getExplorerUrl(txHash: string, cluster: Cluster): string {
  const baseUrl =
    BLOCK_EXPLORER_URLS[cluster] || BLOCK_EXPLORER_URLS.sonicMainnet;
  return `${baseUrl}${txHash}`;
}

/**
 * Transfer native SONIC tokens
 * @param agent DeAgent instance for transaction signing
 * @param to Recipient address
 * @param amount Amount to send in SONIC
 * @param cluster Network cluster (optional, will use agent's cluster if not provided)
 * @returns Transaction hash and explorer URL
 * @throws {Error} If the transfer fails
 */
export async function transferNative(
  agent: DeAgent,
  to: string,
  amount: string,
  cluster?: Cluster
): Promise<TransferResult> {
  validateAddress(to);

  const amountWei = ethers.utils.parseEther(amount);

  const tx: ethers.providers.TransactionRequest = {
    to,
    value: amountWei,
  };

  try {
    // Send the transaction
    const txResult = await agent.sendTransaction(tx, {
      confirmations: 1,
    });

    // Process transaction result
    if (!txResult.success) {
      throw new Error(
        `Transfer transaction failed: ${txResult.error || "Unknown error"}`
      );
    }

    const txHash = txResult.hash;
    const networkCluster = cluster || agent.cluster || "sonicMainnet";

    return {
      txHash,
      explorerUrl: getExplorerUrl(txHash, networkCluster),
    };
  } catch (error) {
    throw new Error(
      `Failed to transfer SONIC: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Transfer ERC20 tokens on Sonic chain
 * @param agent DeAgent instance for transaction signing
 * @param tokenAddress The ERC20 token contract address
 * @param to Recipient address
 * @param amount Amount to send in token units
 * @param cluster Network cluster (optional, will use agent's cluster if not provided)
 * @returns Transaction hash and explorer URL
 * @throws {Error} If the transfer fails
 */
export async function transferToken(
  agent: DeAgent,
  tokenAddress: string,
  to: string,
  amount: string,
  cluster?: Cluster
): Promise<TransferResult> {
  validateAddress(to);
  validateAddress(tokenAddress);

  const tokenContract = new ethers.Contract(
    tokenAddress,
    ERC20_ABI,
    agent.provider
  ) as ethers.Contract & {
    decimals(): Promise<number>;
    transfer(to: string, amount: bigint): Promise<ethers.ContractTransaction>;
  };

  try {
    const decimals = await tokenContract.decimals();
    const amountBigInt = ethers.utils.parseUnits(amount, decimals);

    const tx: ethers.providers.TransactionRequest = {
      to: tokenAddress,
      data: tokenContract.interface.encodeFunctionData("transfer", [
        to,
        amountBigInt,
      ]),
    };

    // Send the transaction
    const txResult = await agent.sendTransaction(tx, {
      confirmations: 1,
    });

    // Process transaction result
    if (!txResult.success) {
      throw new Error(
        `Token transfer transaction failed: ${txResult.error || "Unknown error"}`
      );
    }

    const txHash = txResult.hash;
    // Use provided cluster, agent's cluster, or default to mainnet
    const networkCluster = cluster || agent.cluster || "sonicMainnet";

    return {
      txHash,
      explorerUrl: getExplorerUrl(txHash, networkCluster),
    };
  } catch (error) {
    throw new Error(
      `Failed to transfer token: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}
