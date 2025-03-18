import { BigNumber, ethers } from "ethers";
import { DeAgent } from "../../agent/index.js";
import { Cluster } from "../../types/cluster.js";
import {
  SonicDelegationParams,
  SonicDelegationResponse,
} from "../../types/sonic.js";
import { validateAddress } from "./utils.js";

const SFC_CONTRACT_ADDRESS = "0xFC00FACE00000000000000000000000000000000";
const DELEGATE_METHOD_ID = "0x9fa6dd35";

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
 * Delegate tokens to a validator
 * @param agent DeAgent instance for transaction signing
 * @param params Delegation parameters including validator ID and amount
 * @param cluster Network cluster (optional, will use agent's cluster if not provided)
 * @returns Transaction hash and explorer URL
 * @throws {Error} If the delegation fails
 */
export async function delegateToValidator(
  agent: DeAgent,
  params: SonicDelegationParams,
  cluster?: Cluster
): Promise<SonicDelegationResponse> {
  try {
    if (!params.validatorId || !params.amount) {
      throw new Error("Missing required parameters: validatorId or amount");
    }

    validateAddress(SFC_CONTRACT_ADDRESS);

    const amountWei = ethers.utils.parseEther(params.amount);

    // Format validator ID as uint256
    const validatorIdHex = ethers.utils
      .hexZeroPad(ethers.utils.hexlify(BigNumber.from(params.validatorId)), 32)
      .slice(2);

    // Use raw transaction data with method ID for exact matching with explorer
    const data = `${DELEGATE_METHOD_ID}${validatorIdHex}`;

    const tx: ethers.providers.TransactionRequest = {
      to: SFC_CONTRACT_ADDRESS,
      value: amountWei,
      data: data,
    };

    const txHash = await agent.sendTransaction(tx, { confirmations: 1 });
    const networkCluster = cluster || agent.cluster || "sonicMainnet";

    return {
      status: "success",
      message: "Successfully delegated tokens",
      data: {
        txHash,
        explorerUrl: getExplorerUrl(txHash, networkCluster),
      },
    };
  } catch (error) {
    return {
      status: "error",
      message: "Failed to delegate tokens",
      error: {
        code: "DELEGATION_ERROR",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
        details: error,
      },
    };
  }
}
