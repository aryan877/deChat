import axios from "axios";
import { ethers } from "ethers";
import { DeAgent } from "../../agent/index.js";
import { DEBRIDGE_API } from "../../constants/index.js";
import { deBridgeOrderInput } from "../../types/index.js";

const REFERRAL_CODE = "21064";

const ERC20_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
];

// Chain ID to RPC mapping
const CHAIN_RPC_MAP: Record<string, string[]> = {
  "1": [
    "https://eth-mainnet.public.blastapi.io",
    "https://eth.llamarpc.com",
    "https://rpc.ankr.com/eth",
  ], // Ethereum
  "10": [
    "https://optimism-mainnet.public.blastapi.io",
    "https://rpc.ankr.com/optimism",
  ], // Optimism
  "56": ["https://bsc-mainnet.public.blastapi.io", "https://rpc.ankr.com/bsc"], // BSC
  "137": [
    "https://rpc.ankr.com/polygon",
    "https://polygon-mainnet.public.blastapi.io",
    "https://polygon.llamarpc.com",
  ], // Polygon
  "250": ["https://fantom-mainnet.public.blastapi.io"], // Fantom
  "8453": ["https://mainnet.base.org", "https://rpc.ankr.com/base"], // Base
  "42161": [
    "https://arb1.arbitrum.io/rpc",
    "https://arbitrum.llamarpc.com",
    "https://rpc.ankr.com/arbitrum",
  ], // Arbitrum
  "43114": [
    "https://api.avax.network/ext/bc/C/rpc",
    "https://rpc.ankr.com/avalanche",
  ], // Avalanche
  "59144": [
    "https://rpc.linea.build",
    "https://linea-rpc.publicnode.com",
    "https://1rpc.io/linea",
  ], // Linea
  "7565164": [
    "https://solana-rpc.debridge.finance",
    "https://solana-rpc2.debridge.finance",
  ], // Solana
  "100000001": [
    "https://neon-proxy-mainnet.solana.p2p.org",
    "https://neon-rpc.debridge.finance",
  ], // Neon
  "100000002": [
    "https://rpc.eu-central-2.gateway.fm/v4/gnosis/non-archival/mainnet",
  ], // Gnosis
  "100000004": [
    "https://andromeda.metis.io/?owner=1088",
    "https://metis-mainnet.public.blastapi.io",
  ], // Metis
  "100000005": ["https://connect.bit-rock.io"], // Bitrock
  "100000006": ["https://rpc.mainnet.ms"], // CrossFi
  "100000010": ["https://mainnet.zkevm.cronos.org"], // zkEvmCronos
  "100000013": ["https://Homer.storyrpc.io"], // Story
  "100000014": ["https://rpc.soniclabs.com"], // Sonic
  "100000015": ["https://zircuit-mainnet.drpc.org"], // Zirciut
  "100000017": ["https://abstract-rpc.debridge.finance"], // Abstract
  "100000020": ["https://rpc.berachain.com/"], // Berachain
  "100000022": ["https://rpc.hyperliquid.xyz/evm"], // HyperEVM
};

/**
 * Get RPC URL for a given chain ID
 * @param chainId The chain ID to get RPC URL for
 * @returns The RPC URL for the chain
 * @throws Error if no RPC URL is found for the chain
 */
function getRpcUrlForChain(chainId: string | number): string {
  const chainIdStr = chainId.toString();
  const rpcUrls = CHAIN_RPC_MAP[chainIdStr];
  if (!rpcUrls || rpcUrls.length === 0) {
    throw new Error(`No RPC URL found for chain ID ${chainIdStr}`);
  }
  // Return the first RPC URL from the list
  return rpcUrls[0] as string;
}

/**
 * Check and approve token for deBridge router if needed
 * @param agent DeAgent instance for transaction signing
 * @param tokenAddress The token address to approve
 * @param amount The amount to approve
 * @param routerAddress The router address to approve for
 * @returns Transaction hash of approval if needed, null if already approved
 */
async function checkAndApproveIfNeeded(
  agent: DeAgent,
  tokenAddress: string,
  amount: string,
  routerAddress: string
): Promise<string | null> {
  if (!agent.wallet_address) {
    throw new Error("Agent wallet address not available");
  }

  // Skip approval for native token
  if (tokenAddress === ethers.constants.AddressZero) {
    return null;
  }

  try {
    // Create contract interface
    const tokenContract = new ethers.Contract(
      tokenAddress,
      ERC20_ABI,
      agent.provider
    );

    // Check current allowance
    const allowanceFunc = tokenContract.allowance;
    if (typeof allowanceFunc !== "function") {
      throw new Error("Token contract does not have allowance method");
    }

    const currentAllowance = await allowanceFunc(
      agent.wallet_address,
      routerAddress
    );
    const requiredAmount = BigInt(amount);

    // If allowance is already sufficient, no need to approve again
    if (currentAllowance >= requiredAmount) {
      return null;
    }

    const MAX_UINT256 = BigInt(
      "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
    );

    // Encode the approve function call with unlimited amount
    const tokenInterface = new ethers.utils.Interface(ERC20_ABI);
    const approveData = tokenInterface.encodeFunctionData("approve", [
      routerAddress,
      MAX_UINT256,
    ]);

    // Send approval transaction with higher confirmations to ensure it's processed
    const txResult = await agent.sendTransaction(
      {
        to: tokenAddress,
        data: approveData,
        // Add a slightly higher gas limit to ensure the transaction goes through
        gasLimit: ethers.BigNumber.from(100000),
      },
      { confirmations: 2 }
    );

    // Check if transaction was successful
    if (!txResult.success) {
      throw new Error(
        `Approval transaction failed: ${txResult.error || "Unknown error"}`
      );
    }

    // Transaction was successful
    const txHash = txResult.hash;

    // Double-check the allowance after approval to make sure it worked
    const newAllowance = await allowanceFunc(
      agent.wallet_address,
      routerAddress
    );

    if (newAllowance < requiredAmount) {
      throw new Error(`Approval transaction completed but allowance is still insufficient. 
        Current: ${newAllowance.toString()}, Required: ${requiredAmount.toString()}`);
    }

    return txHash;
  } catch (error) {
    throw new Error(
      `Failed to approve token: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Type guard to check if a value is a non-empty string
 */
function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

/**
 * Process and execute a bridge transfer for cross-chain token movement
 *
 * @param agent DeAgent instance
 * @param params Bridge transfer parameters
 * @param params.srcChainId Source chain ID (e.g., '1' for Ethereum, '100000014' for Sonic)
 * @param params.srcChainTokenIn Token address on source chain (use "0x0000000000000000000000000000000000000000" for native tokens on EVM chains, "11111111111111111111111111111111" for Solana's native SOL)
 * @param params.srcChainTokenInAmount Amount to bridge (in token's smallest unit - e.g., 1.0 token with 18 decimals = 1000000000000000000)
 * @param params.dstChainId Destination chain ID (e.g., '7565164' for Solana, '100000014' for Sonic)
 * @param params.dstChainTokenOut Token address on destination chain (use "0x0000000000000000000000000000000000000000" for native tokens on EVM chains, "11111111111111111111111111111111" for Solana's native SOL)
 * @param params.dstChainTokenOutRecipient Recipient address on destination chain
 * @param params.account Sender's wallet address
 * @returns Transaction hash of the executed bridge transfer
 */
export async function processTransfer(
  agent: DeAgent,
  params: deBridgeOrderInput
): Promise<string> {
  // Validate required parameters
  if (!isNonEmptyString(params.srcChainId)) {
    throw new Error(
      "Source chain ID is required and must be a non-empty string"
    );
  }

  if (!isNonEmptyString(params.dstChainId)) {
    throw new Error(
      "Destination chain ID is required and must be a non-empty string"
    );
  }

  if (!isNonEmptyString(params.dstChainTokenOutRecipient)) {
    throw new Error(
      "Destination chain token recipient is required and must be a non-empty string"
    );
  }

  if (params.srcChainId === params.dstChainId) {
    throw new Error("Source and destination chains must be different");
  }

  // Get RPC URL for source chain
  const rpcUrl = getRpcUrlForChain(params.srcChainId!);

  // Always set dstChainTokenOutAmount to "auto" to get the best rate
  const dstChainTokenOutAmount = "auto";

  // Always set prependOperatingExpenses to "true" to include all fees
  const prependOperatingExpenses = "true";

  const queryParams = new URLSearchParams({
    srcChainId: params.srcChainId,
    srcChainTokenIn: params.srcChainTokenIn,
    srcChainTokenInAmount: params.srcChainTokenInAmount,
    dstChainId: params.dstChainId,
    dstChainTokenOut: params.dstChainTokenOut,
    dstChainTokenOutAmount: dstChainTokenOutAmount,
    dstChainTokenOutRecipient: params.dstChainTokenOutRecipient,
    senderAddress: params.account,
    srcChainOrderAuthorityAddress: params.account, // Always use sender's address
    srcChainRefundAddress: params.account, // Always use sender's address
    dstChainOrderAuthorityAddress: params.dstChainTokenOutRecipient, // Always use recipient's address
    referralCode: params.referralCode?.toString() || REFERRAL_CODE,
    prependOperatingExpenses: prependOperatingExpenses, // Always true
  });

  try {
    const response = await axios.get(
      `${DEBRIDGE_API}/dln/order/create-tx?${queryParams}`
    );

    const data = response.data;

    if (data.error) {
      throw new Error(`DeBridge API Error: ${data.error}`);
    }

    if (data.tx?.data) {
      data.tx.data = data.tx.data.toString();
    }

    // Check and approve token if needed (only for non-native tokens)
    if (params.srcChainTokenIn !== ethers.constants.AddressZero) {
      try {
        // Wait for the approval transaction to be confirmed
        const approvalTx = await checkAndApproveIfNeeded(
          agent,
          params.srcChainTokenIn,
          params.srcChainTokenInAmount,
          data.tx.to
        );

        // If an approval was needed, add a small delay to ensure blockchain state is updated
        if (approvalTx) {
          // Add a small delay to ensure the approval is fully processed
          await new Promise((resolve) => setTimeout(resolve, 5000));
        }
      } catch (error) {
        throw new Error(
          `Failed to approve token for bridge transfer: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    }

    // Create transaction object
    const transaction: ethers.providers.TransactionRequest = {
      data: data.tx.data,
      to: data.tx.to,
      value: data.tx.value,
    };

    const txResult = await agent.sendTransaction(transaction, {
      customRpcUrl: rpcUrl,
      confirmations: 1,
    });

    // Handle transaction result
    if (!txResult.success) {
      throw new Error(
        `Bridge transaction failed: ${txResult.error || "Unknown error"}`
      );
    }

    return txResult.hash;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        `Failed to execute bridge transfer: ${error.message}. ${error.response?.data}`
      );
    }
    throw error;
  }
}
