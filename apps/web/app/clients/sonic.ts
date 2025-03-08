import {
  SonicBalancesResponse,
  SonicTransactionsResponse,
} from "../types/api/sonic";
import api from "@/lib/axios";

/**
 * Fetch token balances for a wallet on Sonic chain
 * @param address Wallet address to fetch balances for
 * @param chainId Chain ID (defaults to 146 for Sonic mainnet)
 * @returns Token balances data
 */
async function getSonicBalances(
  address: string,
  chainId: string = "146"
): Promise<SonicBalancesResponse> {
  const { data } = await api.get<SonicBalancesResponse>(
    `/api/sonic/balances?address=${address}&chainId=${chainId}`
  );
  return data;
}

/**
 * Fetch transactions for a wallet on Sonic chain
 * @param address Wallet address to fetch transactions for
 * @param options Optional parameters for pagination and filtering
 * @returns Transaction data with pagination info
 */
async function getSonicTransactions(
  address: string,
  options: {
    chainId?: string;
    limit?: number;
    offset?: string;
    decode?: boolean;
  } = {}
): Promise<SonicTransactionsResponse> {
  const { chainId = "146", limit = 10, offset, decode = true } = options;

  let url = `/api/sonic/transactions?address=${address}&chainId=${chainId}&limit=${limit}&decode=${decode}`;

  if (offset) {
    url += `&offset=${offset}`;
  }

  const { data } = await api.get<SonicTransactionsResponse>(url);
  return data;
}

/**
 * Transfer tokens on the Sonic chain
 * @param toAddress Recipient wallet address
 * @param amount Amount to transfer (in token units)
 * @param tokenAddress Optional ERC-20 token address (if not provided, transfers native SONIC)
 * @param cluster Network cluster (defaults to sonicMainnet)
 * @returns Transaction hash and explorer URL
 */
async function transferTokens(
  toAddress: string,
  amount: string,
  tokenAddress?: string,
  cluster: string = "sonicMainnet"
): Promise<{ txHash: string; explorerUrl: string }> {
  try {
    const { data } = await api.post("/api/sonic/transfer", {
      toAddress,
      amount,
      tokenAddress,
      cluster,
    });
    return data;
  } catch (error) {
    console.error("Transfer error:", error);
    throw new Error(error instanceof Error ? error.message : "Transfer failed");
  }
}

export const sonicClient = {
  getSonicBalances,
  getSonicTransactions,
  transferTokens,
};
