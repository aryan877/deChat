import { BigNumber, ethers } from "ethers";
import { DeAgent } from "../../agent/index.js";
import { Cluster } from "../../types/cluster.js";
import { SonicDelegationResponse } from "../../types/sonic.js";
import { validateAddress } from "./utils.js";

const SFC_CONTRACT_ADDRESS = "0xFC00FACE00000000000000000000000000000000";
const UNDELEGATE_METHOD_ID = "0x4f864df4";

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

export interface SonicUnstakeParams {
  validatorId: string;
  amount: string;
}

/**
 * Undelegate (unstake) tokens from a validator
 * @param agent DeAgent instance for transaction signing
 * @param params Undelegation parameters including validator ID and amount
 * @param cluster Network cluster (optional, will use agent's cluster if not provided)
 * @returns Transaction hash and explorer URL
 * @throws {Error} If the undelegation fails
 */
export async function undelegateFromValidator(
  agent: DeAgent,
  params: SonicUnstakeParams,
  cluster?: Cluster
): Promise<SonicDelegationResponse> {
  try {
    if (!params.validatorId || !params.amount) {
      throw new Error("Missing required parameters: validatorId or amount");
    }

    if (!agent.wallet_address) {
      throw new Error("Agent wallet address not available");
    }

    validateAddress(SFC_CONTRACT_ADDRESS);

    // Generate a withdrawal request ID that matches the format in the successful transaction
    // Example from successful transaction: 174124237453618
    // Looking at the contract code, this appears to be a unique identifier
    // Generate a similar format but with current timestamp to ensure uniqueness
    const currentTimestamp = Math.floor(Date.now() / 1000); // Current epoch time in seconds
    const randomDigits = Math.floor(10000 + Math.random() * 90000); // 5 random digits (10000-99999)

    // Format: first 8-9 digits + 5 random digits (similar to the successful transaction)
    // But avoid the multiplication that caused overflow
    const wrIdStr = `${currentTimestamp}${randomDigits}`;
    const wrId = BigInt(wrIdStr);

    const amountWei = ethers.utils.parseEther(params.amount);

    // Format validator ID as uint256
    const validatorIdHex = ethers.utils
      .hexZeroPad(ethers.utils.hexlify(BigNumber.from(params.validatorId)), 32)
      .slice(2);

    // Format withdrawal request ID as uint256
    const withdrawalRequestIdHex = ethers.utils
      .hexZeroPad(ethers.utils.hexlify(BigNumber.from(wrId)), 32)
      .slice(2);

    // Format amount as uint256
    const amountHex = ethers.utils
      .hexZeroPad(ethers.utils.hexlify(amountWei), 32)
      .slice(2);

    // Use raw transaction data with method ID for exact matching with explorer
    // Function: undelegate(uint256 toValidatorID, uint256 wrID, uint256 amount)
    // MethodID: 0x4f864df4
    const data = `${UNDELEGATE_METHOD_ID}${validatorIdHex}${withdrawalRequestIdHex}${amountHex}`;

    const tx: ethers.providers.TransactionRequest = {
      to: SFC_CONTRACT_ADDRESS,
      data: data,
    };

    const txHash = await agent.sendTransaction(tx, { confirmations: 1 });
    const networkCluster = cluster || agent.cluster || "sonicMainnet";

    return {
      status: "success",
      message: "Successfully undelegated tokens",
      data: {
        txHash,
        explorerUrl: getExplorerUrl(txHash, networkCluster),
      },
    };
  } catch (error) {
    return {
      status: "error",
      message: "Failed to undelegate tokens",
      error: {
        code: "UNDELEGATION_ERROR",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
        details: error,
      },
    };
  }
}
