import { BigNumber, ethers } from "ethers";
import { DeAgent } from "../../agent/index.js";
import { Cluster } from "../../types/cluster.js";
import {
  SonicWithdrawParams,
  SonicWithdrawResponse,
} from "../../types/sonic.js";

const SFC_CONTRACT_ADDRESS = "0xFC00FACE00000000000000000000000000000000";
const WITHDRAW_METHOD_ID = "0x441a3e70";

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
 * Withdraws previously undelegated stake from a validator after the lock period has ended
 * @param agent The DeAgent instance
 * @param params The withdraw parameters (validatorId and wrId)
 * @param cluster Optional cluster override
 * @returns Response with transaction details or error
 */
export async function withdrawFromValidator(
  agent: DeAgent,
  params: SonicWithdrawParams,
  cluster?: Cluster
): Promise<SonicWithdrawResponse> {
  try {
    const { validatorId, wrId } = params;

    if (!validatorId || !wrId) {
      throw new Error("Missing required parameters: validatorId or wrId");
    }

    if (!agent.wallet_address) {
      throw new Error("Agent wallet address not available");
    }

    // Format validator ID as uint256
    const validatorIdHex = ethers.utils
      .hexZeroPad(ethers.utils.hexlify(BigNumber.from(validatorId)), 32)
      .slice(2);

    // Format withdrawal request ID as uint256
    const wrIdHex = ethers.utils
      .hexZeroPad(ethers.utils.hexlify(BigNumber.from(wrId)), 32)
      .slice(2);

    // Use raw transaction data with method ID for exact matching with explorer
    // Function: withdraw(uint256 toValidatorID, uint256 wrID)
    // MethodID: 0x441a3e70
    const data = `${WITHDRAW_METHOD_ID}${validatorIdHex}${wrIdHex}`;

    const tx: ethers.providers.TransactionRequest = {
      to: SFC_CONTRACT_ADDRESS,
      data: data,
    };

    const txHash = await agent.sendTransaction(tx, { confirmations: 1 });
    const networkCluster = cluster || agent.cluster || "sonicMainnet";

    return {
      status: "success",
      message: "Successfully withdrew staked tokens",
      data: {
        txHash,
        explorerUrl: getExplorerUrl(txHash, networkCluster),
      },
    };
  } catch (error) {
    return {
      status: "error",
      message: "Failed to withdraw staked tokens",
      error: {
        code: "WITHDRAWAL_ERROR",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
        details: error,
      },
    };
  }
}
