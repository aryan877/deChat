import { API_MODULES, API_ACTIONS } from "../../constants/sonic.js";
import { SonicBalanceResponse } from "../../types/sonic.js";
import { NetworkType, callSonicApi, validateAddress } from "./utils.js";
import { DeAgent } from "../../agent/index.js";

/**
 * Get account balance and other information from Sonic chain
 * @param agent DeAgent instance (used for default address)
 * @param address Optional wallet address to check (defaults to agent's address)
 * @param network The network to use (mainnet or testnet)
 * @param tag Block parameter - 'latest', 'earliest', or 'pending'
 * @returns Account information including balance
 * @throws {Error} If the API request fails or returns an error
 */
export async function getSonicAccountInfo(
  agent: DeAgent,
  address?: string,
  network: NetworkType = "mainnet",
  tag: string = "latest"
): Promise<SonicBalanceResponse> {
  // Use provided address or fall back to agent's address
  const targetAddress = address || agent.wallet_address;

  if (!targetAddress) {
    throw new Error("No address provided and agent address not available");
  }

  validateAddress(targetAddress);

  if (!["latest", "earliest", "pending"].includes(tag)) {
    throw new Error('Invalid tag. Must be "latest", "earliest", or "pending"');
  }

  return callSonicApi<SonicBalanceResponse>(
    network,
    API_MODULES.ACCOUNT,
    API_ACTIONS.BALANCE,
    {
      address: targetAddress,
      tag,
    }
  );
}

/**
 * Get account balances for multiple addresses in a single call
 * @param agent DeAgent instance (used for default address if addresses array is empty)
 * @param addresses Array of wallet addresses to check (max 20)
 * @param network The network to use (mainnet or testnet)
 * @param tag Block parameter - 'latest', 'earliest', or 'pending'
 * @returns Array of account balances
 * @throws {Error} If the API request fails or returns an error
 */
export async function getSonicMultiAccountInfo(
  agent: DeAgent,
  addresses: string[] = [],
  network: NetworkType = "mainnet",
  tag: string = "latest"
): Promise<SonicBalanceResponse> {
  // If no addresses provided, use agent's address
  if (addresses.length === 0) {
    const agentAddress = agent.wallet_address;
    if (!agentAddress) {
      throw new Error("No addresses provided and agent address not available");
    }
    addresses = [agentAddress];
  }

  if (addresses.length > 20) {
    throw new Error("Maximum of 20 addresses allowed per call");
  }

  addresses.forEach(validateAddress);

  if (!["latest", "earliest", "pending"].includes(tag)) {
    throw new Error('Invalid tag. Must be "latest", "earliest", or "pending"');
  }

  return callSonicApi<SonicBalanceResponse>(
    network,
    API_MODULES.ACCOUNT,
    API_ACTIONS.BALANCE_MULTI,
    {
      address: addresses.join(","),
      tag,
    }
  );
}

/**
 * Get list of normal transactions for an address
 * @param agent DeAgent instance (used for default address)
 * @param address Optional wallet address to check (defaults to agent's address)
 * @param network The network to use (mainnet or testnet)
 * @param startBlock Starting block number
 * @param endBlock Ending block number
 * @param page Page number
 * @param offset Number of records per page (max 10000)
 * @param sort Sort direction ('asc' or 'desc')
 * @returns List of transactions
 */
export async function getSonicAccountTransactions(
  agent: DeAgent,
  address?: string,
  network: NetworkType = "mainnet",
  startBlock: number = 0,
  endBlock: number = 99999999,
  page: number = 1,
  offset: number = 10,
  sort: "asc" | "desc" = "desc"
) {
  // Use provided address or fall back to agent's address
  const targetAddress = address || agent.wallet_address;

  if (!targetAddress) {
    throw new Error("No address provided and agent address not available");
  }

  validateAddress(targetAddress);

  if (offset > 10000) {
    throw new Error("Maximum offset is 10000 records");
  }

  return callSonicApi(network, API_MODULES.ACCOUNT, API_ACTIONS.TX_LIST, {
    address: targetAddress,
    startblock: startBlock,
    endblock: endBlock,
    page,
    offset,
    sort,
  });
}

/**
 * Get list of internal transactions for an address
 * @param agent DeAgent instance (used for default address)
 * @param address Optional wallet address to check (defaults to agent's address)
 * @param network The network to use (mainnet or testnet)
 * @param startBlock Starting block number
 * @param endBlock Ending block number
 * @param page Page number
 * @param offset Number of records per page (max 10000)
 * @param sort Sort direction ('asc' or 'desc')
 * @returns List of internal transactions
 */
export async function getSonicAccountInternalTransactions(
  agent: DeAgent,
  address?: string,
  network: NetworkType = "mainnet",
  startBlock: number = 0,
  endBlock: number = 99999999,
  page: number = 1,
  offset: number = 10,
  sort: "asc" | "desc" = "desc"
) {
  // Use provided address or fall back to agent's address
  const targetAddress = address || agent.wallet_address;

  if (!targetAddress) {
    throw new Error("No address provided and agent address not available");
  }

  validateAddress(targetAddress);

  if (offset > 10000) {
    throw new Error("Maximum offset is 10000 records");
  }

  return callSonicApi(
    network,
    API_MODULES.ACCOUNT,
    API_ACTIONS.TX_LIST_INTERNAL,
    {
      address: targetAddress,
      startblock: startBlock,
      endblock: endBlock,
      page,
      offset,
      sort,
    }
  );
}
