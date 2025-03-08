import { DeAgent } from "../../agent/index.js";
import { ethers } from "ethers";
import { TransferResult } from "../../types/index.js";

const ODOS_API_URL = "https://api.odos.xyz/sor/assemble";
const EXPLORER_URL = "https://sonicscan.org";
const ODOS_ROUTER = "0xaC041Df48dF9791B0654f1Dbbf2CC8450C5f2e9D";

// Maximum uint256 value for unlimited token approvals
const MAX_UINT256 = ethers.MaxUint256;

const ERC20_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
];

/**
 * Check and approve token for Odos router if needed
 * @param agent DeAgent instance for transaction signing
 * @param tokenAddress The token address to approve
 * @param amount The amount to approve
 * @returns Transaction hash of approval if needed, null if already approved
 */
async function checkAndApproveIfNeeded(
  agent: DeAgent,
  tokenAddress: string,
  amount: string
): Promise<string | null> {
  if (!agent.wallet_address) {
    throw new Error("Agent wallet address not available");
  }

  try {
    // Create contract interface
    const tokenContract = new ethers.Contract(
      tokenAddress,
      ERC20_ABI,
      agent.provider
    );

    // Check current allowance - handle possible undefined with a type guard
    const allowanceFunc = tokenContract.allowance;
    if (typeof allowanceFunc !== "function") {
      throw new Error("Token contract does not have allowance method");
    }

    const currentAllowance = await allowanceFunc(
      agent.wallet_address,
      ODOS_ROUTER
    );
    const requiredAmount = BigInt(amount);

    // If allowance is already sufficient, no need to approve again
    if (currentAllowance >= requiredAmount) {
      return null;
    }

    // Encode the approve function call
    const approveData = ethers.Interface.from(ERC20_ABI).encodeFunctionData(
      "approve",
      [
        ODOS_ROUTER,
        MAX_UINT256, // Always approve max to avoid future approvals
      ]
    );

    // Send approval transaction
    const tx = await agent.sendTransaction(
      {
        to: tokenAddress,
        data: approveData,
      },
      { confirmations: 1 }
    );

    return tx;
  } catch (error) {
    throw new Error(
      `Failed to approve token: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

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

    // Check if we need to approve input tokens
    if (data.inputTokens && data.inputTokens.length > 0) {
      for (const inputToken of data.inputTokens) {
        if (inputToken.tokenAddress !== ethers.ZeroAddress) {
          try {
            await checkAndApproveIfNeeded(
              agent,
              inputToken.tokenAddress,
              inputToken.amount
            );
          } catch (error) {
            throw new Error(
              `Failed to approve token: ${error instanceof Error ? error.message : "Unknown error"}`
            );
          }
        }
      }
    }

    // Extract transaction details from the response
    const tx: ethers.TransactionRequest = {
      to: data.transaction.to,
      data: data.transaction.data,
      value: data.transaction.value,
      gasLimit: data.transaction.gas,
    };

    // Send the swap transaction
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
