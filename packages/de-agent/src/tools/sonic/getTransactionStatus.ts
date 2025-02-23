import { API_MODULES, API_ACTIONS } from "../../constants/sonic.js";
import { SonicBaseResponse } from "../../types/sonic.js";
import { NetworkType, callSonicApi, validateTransactionHash } from "./utils.js";

interface SonicTxStatusResponse extends SonicBaseResponse {
  result: {
    isError: string;
    errDescription: string;
  };
}

interface SonicTxReceiptResponse extends SonicBaseResponse {
  result: {
    status: string; // 0 = Fail, 1 = Pass
  };
}

/**
 * Get the execution status and error message of a transaction
 * @param txHash Transaction hash to check
 * @param network The network to use (mainnet or testnet)
 * @returns Transaction status and error description if any
 * @throws {Error} If the API request fails or returns an error
 */
export async function getSonicTransactionStatus(
  txHash: string,
  network: NetworkType = "mainnet"
): Promise<SonicTxStatusResponse> {
  validateTransactionHash(txHash);

  return callSonicApi<SonicTxStatusResponse>(
    network,
    API_MODULES.TRANSACTION,
    API_ACTIONS.GET_TX_STATUS,
    {
      txhash: txHash,
    }
  );
}

/**
 * Get the receipt status of a transaction (post Byzantium fork only)
 * @param txHash Transaction hash to check
 * @param network The network to use (mainnet or testnet)
 * @returns Transaction receipt status (0 = Fail, 1 = Pass)
 * @throws {Error} If the API request fails or returns an error
 */
export async function getSonicTransactionReceiptStatus(
  txHash: string,
  network: NetworkType = "mainnet"
): Promise<SonicTxReceiptResponse> {
  validateTransactionHash(txHash);

  return callSonicApi<SonicTxReceiptResponse>(
    network,
    API_MODULES.TRANSACTION,
    API_ACTIONS.GET_TX_RECEIPT_STATUS,
    {
      txhash: txHash,
    }
  );
}

/**
 * Get internal transactions by transaction hash
 * @param txHash Transaction hash to check
 * @param network The network to use (mainnet or testnet)
 * @returns List of internal transactions
 * @throws {Error} If the API request fails or returns an error
 */
export async function getSonicInternalTransactionsByHash(
  txHash: string,
  network: NetworkType = "mainnet"
): Promise<SonicTxReceiptResponse> {
  validateTransactionHash(txHash);

  return callSonicApi<SonicTxReceiptResponse>(
    network,
    API_MODULES.ACCOUNT,
    API_ACTIONS.TX_LIST_INTERNAL,
    {
      txhash: txHash,
    }
  );
}
