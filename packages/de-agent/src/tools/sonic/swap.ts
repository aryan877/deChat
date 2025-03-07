import { DeAgent } from "../../agent/index.js";
import { ethers } from "ethers";
import { TransferResult } from "../../types/index.js";

const ODOS_API_URL = "https://api.odos.xyz/sor/assemble";
const EXPLORER_URL = "https://sonicscan.org";

/**
 * Execute a token swap using the pathId from a previous quote
 * @param agent DeAgent instance for transaction signing
 * @param pathId The pathId received from the quote
 * @returns Transaction hash and explorer URL
 * @throws {Error} If the swap fails
 */
export async function executeSwap(
  agent: DeAgent,
  pathId: string
): Promise<TransferResult> {
  if (!agent.wallet_address) {
    throw new Error("Agent wallet address not available");
  }

  try {
    // Get the chain ID from the provider
    const network = await agent.provider.getNetwork();
    const chainId = Number(network.chainId);

    // Construct the assemble request
    const assembleRequest = {
      chainId: chainId,
      pathId: pathId,
      userAddr: agent.wallet_address,
    };

    // Make the API request to get the transaction data
    const response = await fetch(ODOS_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(assembleRequest),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed: ${errorText}`);
    }

    const data = await response.json();

    // Extract transaction details from the response
    const tx: ethers.TransactionRequest = {
      to: data.transaction.to,
      data: data.transaction.data,
      value: data.transaction.value,
      gasLimit: data.transaction.gas,
    };

    // Send the transaction
    const txHash = await agent.sendTransaction(tx, { confirmations: 1 });

    return {
      txHash,
      explorerUrl: getExplorerUrl(txHash),
    };
  } catch (error) {
    throw new Error(
      `Failed to execute swap: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Get the explorer URL for a transaction
 * @param txHash Transaction hash
 * @returns Explorer URL
 */
function getExplorerUrl(txHash: string): string {
  return `${EXPLORER_URL}/tx/${txHash}`;
}
