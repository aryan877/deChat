import { DeAgent } from "../../agent/index.js";
import { DuneBalancesResponse } from "../../types/dune.js";
import axios from "axios";

/**
 * Get token balances for a wallet address using Dune API
 * @param agent DeAgent instance
 * @param address Optional wallet address to check (defaults to agent's address)
 * @param chainId Optional chain ID to filter balances (defaults to 146 for Sonic)
 * @returns Token balances information
 */
export async function getBalances(
  agent: DeAgent,
  address?: string,
  chainId: string = "146"
): Promise<DuneBalancesResponse> {
  // Use provided address or fall back to agent's address
  const targetAddress = address || agent.wallet_address;

  if (!targetAddress) {
    throw new Error("No address provided and agent address not available");
  }

  try {
    // Get the API key from environment variables
    const apiKey = process.env.DUNE_API_KEY;

    if (!apiKey) {
      throw new Error("Dune API key not found in environment variables");
    }

    // Make the API request to Dune
    const response = await axios.get(
      `https://api.dune.com/api/echo/v1/balances/evm/${targetAddress}?chain_ids=${chainId}`,
      {
        headers: {
          "X-Dune-Api-Key": apiKey,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error fetching token balances:", error);
    throw new Error(
      `Failed to get token balances: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}
