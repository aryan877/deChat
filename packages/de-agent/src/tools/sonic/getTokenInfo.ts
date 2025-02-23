import { API_MODULES, API_ACTIONS } from "../../constants/sonic.js";
import {
  SonicTokenTransferResponse,
  SonicNFTTransferResponse,
  SonicTokenSupply,
} from "../../types/sonic.js";
import { NetworkType, callSonicApi, validateAddress } from "./utils.js";

/**
 * Get ERC20 token total supply
 * @param contractAddress Token contract address
 * @param network The network to use (mainnet or testnet)
 * @returns Total supply of the token
 * @throws {Error} If the API request fails or returns an error
 */
export async function getSonicTokenSupply(
  contractAddress: string,
  network: NetworkType = "mainnet"
): Promise<SonicTokenSupply> {
  validateAddress(contractAddress);

  return callSonicApi<SonicTokenSupply>(
    network,
    API_MODULES.STATS,
    API_ACTIONS.TOKEN_SUPPLY,
    {
      contractaddress: contractAddress,
    }
  );
}

/**
 * Get ERC20 token transfers for an address
 * @param params Parameters for the token transfer query
 * @returns List of token transfers
 * @throws {Error} If the API request fails or returns an error
 */
export async function getSonicTokenTransfers(
  params: {
    address?: string;
    contractAddress?: string;
    network?: NetworkType;
    startBlock?: number;
    endBlock?: number;
    page?: number;
    offset?: number;
    sort?: "asc" | "desc";
  } = {}
): Promise<SonicTokenTransferResponse> {
  const {
    address,
    contractAddress,
    network = "mainnet",
    startBlock = 0,
    endBlock = 99999999,
    page = 1,
    offset = 10,
    sort = "desc",
  } = params;

  if (!address && !contractAddress) {
    throw new Error("Must provide either address or contractAddress");
  }

  if (address) {
    validateAddress(address);
  }

  if (contractAddress) {
    validateAddress(contractAddress);
  }

  if (offset > 10000) {
    throw new Error("Maximum offset is 10000 records");
  }

  return callSonicApi<SonicTokenTransferResponse>(
    network,
    API_MODULES.ACCOUNT,
    API_ACTIONS.TOKEN_TX,
    {
      ...(address && { address }),
      ...(contractAddress && { contractaddress: contractAddress }),
      startblock: startBlock,
      endblock: endBlock,
      page,
      offset,
      sort,
    }
  );
}

/**
 * Get ERC721 (NFT) token transfers for an address
 * @param params Parameters for the NFT transfer query
 * @returns List of NFT transfers
 * @throws {Error} If the API request fails or returns an error
 */
export async function getSonicNFTTransfers(
  params: {
    address?: string;
    contractAddress?: string;
    network?: NetworkType;
    startBlock?: number;
    endBlock?: number;
    page?: number;
    offset?: number;
    sort?: "asc" | "desc";
  } = {}
): Promise<SonicNFTTransferResponse> {
  const {
    address,
    contractAddress,
    network = "mainnet",
    startBlock = 0,
    endBlock = 99999999,
    page = 1,
    offset = 10,
    sort = "desc",
  } = params;

  if (!address && !contractAddress) {
    throw new Error("Must provide either address or contractAddress");
  }

  if (address) {
    validateAddress(address);
  }

  if (contractAddress) {
    validateAddress(contractAddress);
  }

  if (offset > 10000) {
    throw new Error("Maximum offset is 10000 records");
  }

  return callSonicApi<SonicNFTTransferResponse>(
    network,
    API_MODULES.ACCOUNT,
    API_ACTIONS.TOKEN_NFT_TX,
    {
      ...(address && { address }),
      ...(contractAddress && { contractaddress: contractAddress }),
      startblock: startBlock,
      endblock: endBlock,
      page,
      offset,
      sort,
    }
  );
}

/**
 * Get ERC1155 token transfers for an address
 * @param params Parameters for the ERC1155 transfer query
 * @returns List of ERC1155 transfers
 * @throws {Error} If the API request fails or returns an error
 */
export async function getSonicERC1155Transfers(
  params: {
    address?: string;
    contractAddress?: string;
    network?: NetworkType;
    startBlock?: number;
    endBlock?: number;
    page?: number;
    offset?: number;
    sort?: "asc" | "desc";
  } = {}
): Promise<SonicNFTTransferResponse> {
  const {
    address,
    contractAddress,
    network = "mainnet",
    startBlock = 0,
    endBlock = 99999999,
    page = 1,
    offset = 10,
    sort = "desc",
  } = params;

  if (!address && !contractAddress) {
    throw new Error("Must provide either address or contractAddress");
  }

  if (address) {
    validateAddress(address);
  }

  if (contractAddress) {
    validateAddress(contractAddress);
  }

  if (offset > 10000) {
    throw new Error("Maximum offset is 10000 records");
  }

  return callSonicApi<SonicNFTTransferResponse>(
    network,
    API_MODULES.ACCOUNT,
    API_ACTIONS.TOKEN_1155_TX,
    {
      ...(address && { address }),
      ...(contractAddress && { contractaddress: contractAddress }),
      startblock: startBlock,
      endblock: endBlock,
      page,
      offset,
      sort,
    }
  );
}
