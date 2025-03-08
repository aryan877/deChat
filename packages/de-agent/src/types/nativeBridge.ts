export interface SonicBridgeContracts {
  TOKEN_DEPOSIT: string;
  TOKEN_PAIRS: string;
  STATE_ORACLE: string;
}

export interface SonicL2Contracts {
  BRIDGE: string;
  TOKEN_PAIRS: string;
  STATE_ORACLE: string;
}

export interface SonicBridgeDepositResult {
  transactionHash: string;
  mintedToken: string;
  blockNumber: number;
  depositId: string;
}

export interface SonicBridgeWithdrawalResult {
  transactionHash: string;
  blockNumber: number;
  withdrawalId: string;
}

export interface SonicBridgeClaimResult {
  transactionHash: string;
  explorerUrl: string;
}

export interface SonicBridgeToSonicParams {
  tokenAddress: string;
  amount: string;
}

export interface SonicBridgeToEthereumParams {
  tokenAddress: string;
  amount: string;
}

export interface SonicClaimOnSonicParams {
  depositTxHash: string;
  depositBlockNumber: number;
  depositId: string;
}

export interface SonicClaimOnEthereumParams {
  withdrawalTxHash: string;
  withdrawalBlockNumber: number;
  withdrawalId: string;
}

export interface SonicBridgeResponse {
  status: "success" | "error";
  message: string;
  data?:
    | SonicBridgeDepositResult
    | SonicBridgeWithdrawalResult
    | SonicBridgeClaimResult;
  error?: {
    code: string;
    message: string;
    details: unknown;
  };
}
