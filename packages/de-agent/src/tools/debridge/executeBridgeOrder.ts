import { DeAgent } from "../../agent/index.js";
import { ethers } from "ethers";
import { deBridgeOrderResponse } from "../../types/index.js";

/**
 * Execute a bridge transaction on EVM chain.
 * @param agent DeAgent instance
 * @param transactionData Transaction data from deBridge API
 * @returns Transaction hash
 */
export async function executeDebridgeBridgeOrder(
  agent: DeAgent,
  transactionData: deBridgeOrderResponse
): Promise<string> {
  // Create transaction object
  const transaction: ethers.TransactionRequest = {
    data: transactionData.tx.data,
    to: transactionData.tx.to,
    value: transactionData.tx.value,
  };

  // Send transaction and wait for confirmation
  const txHash = await agent.sendTransaction(transaction, {
    confirmations: 1,
  });

  return txHash;
}
