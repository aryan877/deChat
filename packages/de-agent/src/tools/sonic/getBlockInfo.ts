import { API_MODULES, API_ACTIONS } from "../../constants/sonic.js";
import {
  SonicBlockReward,
  SonicBlockCountdown,
  SonicBaseResponse,
} from "../../types/sonic.js";
import {
  NetworkType,
  callSonicApi,
  validateBlockNumber,
  validateAddress,
} from "./utils.js";

/**
 * Get block rewards and uncle blocks
 * @param blockNumber Block number to get rewards for
 * @param network The network to use (mainnet or testnet)
 * @returns Block reward information including uncle rewards
 * @throws {Error} If the API request fails or returns an error
 */
export async function getSonicBlockReward(
  blockNumber: number | string,
  network: NetworkType = "mainnet"
): Promise<SonicBlockReward> {
  validateBlockNumber(blockNumber);

  return callSonicApi<SonicBlockReward>(
    network,
    API_MODULES.BLOCK,
    API_ACTIONS.GET_BLOCK_REWARD,
    {
      blockno: blockNumber,
    }
  );
}

/**
 * Get estimated time until a block is mined
 * @param blockNumber Target block number
 * @param network The network to use (mainnet or testnet)
 * @returns Estimated countdown information
 * @throws {Error} If the API request fails or returns an error
 */
export async function getSonicBlockCountdown(
  blockNumber: number,
  network: NetworkType = "mainnet"
): Promise<SonicBlockCountdown> {
  validateBlockNumber(blockNumber);

  return callSonicApi<SonicBlockCountdown>(
    network,
    API_MODULES.BLOCK,
    API_ACTIONS.GET_BLOCK_COUNTDOWN,
    {
      blockno: blockNumber,
    }
  );
}

interface SonicBlockByTimeResponse extends SonicBaseResponse {
  result: {
    blockNumber: string;
  };
}

/**
 * Get block number by timestamp
 * @param timestamp Unix timestamp in seconds
 * @param closest Whether to get the block before or after the timestamp
 * @param network The network to use (mainnet or testnet)
 * @returns Block number closest to the timestamp
 * @throws {Error} If the API request fails or returns an error
 */
export async function getSonicBlockByTimestamp(
  timestamp: number,
  closest: "before" | "after" = "before",
  network: NetworkType = "mainnet"
): Promise<SonicBlockByTimeResponse> {
  if (timestamp < 0) {
    throw new Error("Timestamp must be positive");
  }

  return callSonicApi<SonicBlockByTimeResponse>(
    network,
    API_MODULES.BLOCK,
    API_ACTIONS.GET_BLOCK_BY_TIME,
    {
      timestamp,
      closest,
    }
  );
}

/**
 * Get list of blocks validated by an address
 * @param address Validator/miner address
 * @param network The network to use (mainnet or testnet)
 * @param blockType Type of blocks to get (blocks or uncles)
 * @param page Page number
 * @param offset Number of records per page
 * @returns List of blocks validated by the address
 * @throws {Error} If the API request fails or returns an error
 */
export async function getSonicValidatedBlocks(
  address: string,
  network: NetworkType = "mainnet",
  blockType: "blocks" | "uncles" = "blocks",
  page: number = 1,
  offset: number = 10
): Promise<SonicBaseResponse> {
  validateAddress(address);

  if (offset > 10000) {
    throw new Error("Maximum offset is 10000 records");
  }

  return callSonicApi<SonicBaseResponse>(
    network,
    API_MODULES.ACCOUNT,
    API_ACTIONS.MINED_BLOCKS,
    {
      address,
      blocktype: blockType,
      page,
      offset,
    }
  );
}
