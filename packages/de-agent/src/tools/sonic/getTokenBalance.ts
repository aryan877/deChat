import { DeAgent } from "../../agent/index.js";
import { ethers } from "ethers";
import { validateAddress } from "./utils.js";

const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function name() view returns (string)",
] as const;

export interface TokenBalanceResponse {
  address: string;
  tokenAddress: string;
  balance: string;
  symbol: string;
  name: string;
  decimals: number;
}

/**
 * Get token balance for a specific ERC20 token
 * @param agent DeAgent instance
 * @param tokenAddress The token contract address
 * @param address Optional wallet address to check (defaults to agent's address)
 * @returns Token balance and information
 */
export async function getTokenBalance(
  agent: DeAgent,
  tokenAddress: string,
  address?: string
): Promise<TokenBalanceResponse> {
  // Use provided address or fall back to agent's address
  const targetAddress = address || agent.wallet_address;

  if (!targetAddress) {
    throw new Error("No address provided and agent address not available");
  }

  validateAddress(targetAddress);
  validateAddress(tokenAddress);

  try {
    // Create contract instance with the ERC20 ABI
    const tokenContract = new ethers.Contract(
      tokenAddress,
      ERC20_ABI,
      agent.provider
    );

    // Default values
    let balance = "0";
    let decimals = 18;
    let symbol = "UNKNOWN";
    let name = "Unknown Token";

    // Get balance and token info with safe access
    try {
      const balanceResult = await tokenContract.balanceOf?.(targetAddress);
      if (balanceResult) {
        balance = balanceResult.toString();
      }
    } catch (error) {
      console.error("Error getting balance:", error);
    }

    try {
      const decimalsResult = await tokenContract.decimals?.();
      if (decimalsResult !== undefined) {
        decimals = Number(decimalsResult);
      }
    } catch (error) {
      console.error("Error getting decimals:", error);
    }

    try {
      const symbolResult = await tokenContract.symbol?.();
      if (symbolResult) {
        symbol = symbolResult;
      }
    } catch (error) {
      console.error("Error getting symbol:", error);
    }

    try {
      const nameResult = await tokenContract.name?.();
      if (nameResult) {
        name = nameResult;
      }
    } catch (error) {
      console.error("Error getting name:", error);
    }

    return {
      address: targetAddress,
      tokenAddress,
      balance,
      symbol,
      name,
      decimals,
    };
  } catch (error) {
    console.error("Token balance error:", error);
    throw new Error(
      `Failed to get token balance: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}
