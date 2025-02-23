import {
  SONIC_API_KEY,
  SONIC_MAINNET_API_URL,
  SONIC_TESTNET_API_URL,
} from "../../constants/sonic.js";

export type NetworkType = "mainnet" | "testnet";

interface ApiParams {
  [key: string]: string | number | boolean;
}

/**
 * Creates a URL for the Sonic API with the given parameters
 * @param network The network to use (mainnet or testnet)
 * @param module The API module to use
 * @param action The API action to perform
 * @param params Additional parameters for the API call
 * @returns URL string for the API call
 */
export function createSonicApiUrl(
  network: NetworkType,
  module: string,
  action: string,
  params: ApiParams = {}
): string {
  const baseUrl =
    network === "mainnet" ? SONIC_MAINNET_API_URL : SONIC_TESTNET_API_URL;
  const url = new URL(baseUrl);

  // Add required parameters
  url.searchParams.append("module", module);
  url.searchParams.append("action", action);
  url.searchParams.append("apikey", SONIC_API_KEY || "");

  // Add additional parameters
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value.toString());
  });

  return url.toString();
}

/**
 * Makes an API call to the Sonic API
 * @param network The network to use (mainnet or testnet)
 * @param module The API module to use
 * @param action The API action to perform
 * @param params Additional parameters for the API call
 * @returns The API response
 * @throws Error if the API call fails
 */
export async function callSonicApi<T>(
  network: NetworkType,
  module: string,
  action: string,
  params: ApiParams = {}
): Promise<T> {
  const url = createSonicApiUrl(network, module, action, params);
  const response = await fetch(url);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Sonic API Error: ${response.status} ${response.statusText}. ${errorText}`
    );
  }

  const data = await response.json();

  if (data.status === "0") {
    throw new Error(`Sonic API Error: ${data.message || "Unknown error"}`);
  }

  return data;
}

/**
 * Validates an address format
 * @param address The address to validate
 * @throws Error if the address is invalid
 */
export function validateAddress(address: string): void {
  if (!address || !address.startsWith("0x") || address.length !== 42) {
    throw new Error(
      "Invalid address format. Must be a 0x-prefixed hex string of length 42"
    );
  }
}

/**
 * Validates a transaction hash format
 * @param txHash The transaction hash to validate
 * @throws Error if the transaction hash is invalid
 */
export function validateTransactionHash(txHash: string): void {
  if (!txHash || !txHash.startsWith("0x") || txHash.length !== 66) {
    throw new Error(
      "Invalid transaction hash format. Must be a 0x-prefixed hex string of length 66"
    );
  }
}

/**
 * Validates a block number
 * @param blockNumber The block number to validate
 * @throws Error if the block number is invalid
 */
export function validateBlockNumber(blockNumber: string | number): void {
  const blockStr = blockNumber.toString();
  if (blockStr !== "latest" && !/^\d+$/.test(blockStr)) {
    throw new Error(
      'Invalid block number format. Must be a number or "latest"'
    );
  }
}
