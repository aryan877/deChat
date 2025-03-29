import { ethers } from "ethers";
import { DeAgent } from "../../agent/index.js";
import { TransferResult } from "../../types/index.js";

const ODOS_API_URL = "https://api.odos.xyz/sor/assemble";
const MAGPIE_TRANSACTION_API_URL =
  "https://api.magpiefi.xyz/aggregator/transaction";
const MAGPIE_ALLOWANCE_API_URL =
  "https://api.magpiefi.xyz/balance-manager/allowance";

const EXPLORER_URL = "https://sonicscan.org";
const ODOS_ROUTER = "0xaC041Df48dF9791B0654f1Dbbf2CC8450C5f2e9D";
const MAGPIE_ROUTER = "0xba7bac71a8ee550d89b827fe6d67bc3dca07b104";

// Maximum uint256 value for unlimited token approvals
const MAX_UINT256 = ethers.constants.MaxUint256;

const ERC20_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
];

/**
 * Check allowance using Magpie API
 * @param walletAddress The wallet address
 * @param tokenAddress The token address to check
 * @param spenderAddress The spender address
 * @returns Current allowance as string
 */
async function checkMagpieAllowance(
  walletAddress: string,
  tokenAddress: string,
  spenderAddress: string
): Promise<string> {
  try {
    const url = new URL(MAGPIE_ALLOWANCE_API_URL);
    url.searchParams.append("networkName", "sonic");
    url.searchParams.append("walletAddress", walletAddress);
    url.searchParams.append("tokenAddress", tokenAddress);
    url.searchParams.append("spenderAddress", spenderAddress);

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get allowance: ${response.statusText}`);
    }

    const data = await response.json();
    return data.allowance || "0";
  } catch (error) {
    console.error("Error checking Magpie allowance:", error);
    return "0"; // Return 0 allowance in case of error to trigger approval
  }
}

/**
 * Check and approve token for a specific router if needed
 * @param agent DeAgent instance for transaction signing
 * @param tokenAddress The token address to approve
 * @param routerAddress The router address to approve tokens for
 * @param amount The amount to approve
 * @param useExternalAPI Whether to use an external API for allowance check
 * @returns Transaction hash of approval if needed, null if already approved
 */
async function checkAndApproveIfNeeded(
  agent: DeAgent,
  tokenAddress: string,
  routerAddress: string,
  amount: string,
  useExternalAPI: boolean = false
): Promise<string | null> {
  if (!agent.wallet_address) {
    throw new Error("Agent wallet address not available");
  }

  try {
    // Skip approval for native token
    if (tokenAddress === ethers.constants.AddressZero) {
      return null;
    }

    // Check current allowance
    let currentAllowance: ethers.BigNumberish;

    if (useExternalAPI) {
      // Use Magpie allowance API
      const allowanceStr = await checkMagpieAllowance(
        agent.wallet_address,
        tokenAddress,
        routerAddress
      );
      currentAllowance = ethers.BigNumber.from(allowanceStr);
    } else {
      // Use contract call
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

      currentAllowance = await allowanceFunc(
        agent.wallet_address,
        routerAddress
      );
    }

    const requiredAmount = BigInt(amount);

    // If allowance is already sufficient, no need to approve again
    if (BigInt(currentAllowance.toString()) >= requiredAmount) {
      return null;
    }

    // Encode the approve function call
    const tokenInterface = new ethers.utils.Interface(ERC20_ABI);
    const approveData = tokenInterface.encodeFunctionData("approve", [
      routerAddress,
      MAX_UINT256, // Always approve max to avoid future approvals
    ]);

    // Send approval transaction
    const txResult = await agent.sendTransaction(
      {
        to: tokenAddress,
        data: approveData,
        gasLimit: ethers.BigNumber.from(100000),
      },
      { confirmations: 1 }
    );

    // Process transaction result
    if (!txResult.success) {
      throw new Error(
        `Approval transaction failed: ${txResult.error || "Unknown error"}`
      );
    }

    return txResult.hash;
  } catch (error) {
    throw new Error(
      `Failed to approve token: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Execute a token swap using ODOS API
 * @param agent DeAgent instance for transaction signing
 * @param pathId The pathId received from the ODOS quote
 * @returns Transaction hash and explorer URL
 */
async function executeOdosSwap(
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
      throw new Error(`ODOS API request failed: ${errorText}`);
    }

    const data = await response.json();

    // Check if we need to approve input tokens
    if (data.inputTokens && data.inputTokens.length > 0) {
      for (const inputToken of data.inputTokens) {
        if (inputToken.tokenAddress !== ethers.constants.AddressZero) {
          try {
            await checkAndApproveIfNeeded(
              agent,
              inputToken.tokenAddress,
              ODOS_ROUTER,
              inputToken.amount
            );
          } catch (error) {
            throw new Error(
              `Failed to approve token for ODOS: ${error instanceof Error ? error.message : "Unknown error"}`
            );
          }
        }
      }
    }

    // Extract transaction details from the response
    const tx: ethers.providers.TransactionRequest = {
      to: data.transaction.to,
      data: data.transaction.data,
      value: data.transaction.value,
      gasLimit: data.transaction.gas,
    };

    // Send the swap transaction
    const txResult = await agent.sendTransaction(tx, {
      confirmations: 1,
    });

    // Process transaction result
    if (!txResult.success) {
      throw new Error(
        `ODOS swap transaction failed: ${txResult.error || "Unknown error"}`
      );
    }

    const txHash = txResult.hash;
    return {
      txHash,
      explorerUrl: getExplorerUrl(txHash),
      provider: "odos",
    };
  } catch (error) {
    throw new Error(
      `Failed to execute ODOS swap: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Execute a token swap using Magpie API
 * @param agent DeAgent instance for transaction signing
 * @param quoteId The quoteId received from the Magpie quote
 * @returns Transaction hash and explorer URL
 */
async function executeMagpieSwap(
  agent: DeAgent,
  quoteId: string
): Promise<TransferResult> {
  if (!agent.wallet_address) {
    throw new Error("Agent wallet address not available");
  }

  try {
    // Get transaction data from Magpie API
    const txUrl = `${MAGPIE_TRANSACTION_API_URL}?quoteId=${quoteId}`;
    const txResponse = await fetch(txUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!txResponse.ok) {
      const errorText = await txResponse.text();
      throw new Error(`Magpie transaction API request failed: ${errorText}`);
    }

    const txData = await txResponse.json();

    // Check if we need to approve tokens (only for non-native tokens)
    if (txData.to && txData.from && txData.value && txData.data) {
      // Extract token address from the data - this is from fromAsset in the typedData
      const fromAssetMatch = txData.data.match(
        /000000000000000000000000([a-fA-F0-9]{40})/
      );
      const fromAsset = fromAssetMatch ? `0x${fromAssetMatch[1]}` : null;

      // If it's not the native token (address not 0x000...00) and we found a token address in the data
      if (
        fromAsset &&
        fromAsset !== "0x0000000000000000000000000000000000000000" &&
        txData.to
      ) {
        try {
          // Use Magpie's router address
          await checkAndApproveIfNeeded(
            agent,
            fromAsset,
            MAGPIE_ROUTER,
            txData.value || "0",
            true // Use Magpie's allowance API
          );
        } catch (error) {
          throw new Error(
            `Failed to approve token for Magpie: ${error instanceof Error ? error.message : "Unknown error"}`
          );
        }
      }
    }

    // Extract transaction details from the response
    const tx: ethers.providers.TransactionRequest = {
      to: txData.to,
      data: txData.data,
      value: txData.value || "0",
      gasLimit: txData.gasLimit
        ? ethers.BigNumber.from(txData.gasLimit)
        : undefined,
      maxFeePerGas: txData.maxFeePerGas
        ? ethers.BigNumber.from(txData.maxFeePerGas)
        : undefined,
      maxPriorityFeePerGas: txData.maxPriorityFeePerGas
        ? ethers.BigNumber.from(txData.maxPriorityFeePerGas)
        : undefined,
      type: txData.type,
      chainId: txData.chainId,
    };

    // Send the swap transaction
    const txResult = await agent.sendTransaction(tx, {
      confirmations: 1,
    });

    // Process transaction result
    if (!txResult.success) {
      throw new Error(
        `Magpie swap transaction failed: ${txResult.error || "Unknown error"}`
      );
    }

    const txHash = txResult.hash;
    return {
      txHash,
      explorerUrl: getExplorerUrl(txHash),
      provider: "magpie",
    };
  } catch (error) {
    throw new Error(
      `Failed to execute Magpie swap: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Determine and execute the correct swap based on pathId format
 * @param agent DeAgent instance for transaction signing
 * @param pathId The pathId received from either quote provider
 * @param provider Optional provider specification
 * @returns Transaction hash and explorer URL
 * @throws {Error} If the swap fails
 */
export async function executeSwap(
  agent: DeAgent,
  pathId: string,
  provider?: "odos" | "magpie"
): Promise<TransferResult> {
  try {
    // Determine which provider to use based on the pathId format or explicit provider
    if (provider === "odos" || (!provider && /^[a-f0-9]{32}$/.test(pathId))) {
      // ODOS pathIds are typically 32 character hex strings
      return await executeOdosSwap(agent, pathId);
    } else if (
      provider === "magpie" ||
      (!provider &&
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(
          pathId
        ))
    ) {
      // Magpie pathIds are UUIDs
      return await executeMagpieSwap(agent, pathId);
    } else {
      throw new Error(
        `Unable to determine swap provider from pathId format: ${pathId}`
      );
    }
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
