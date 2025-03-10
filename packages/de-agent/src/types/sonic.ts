// Base response type
export interface SonicBaseResponse {
  status: string;
  message: string;
}

// Account types
export interface SonicBalanceResponse extends SonicBaseResponse {
  result: string; // Balance in wei
}

export interface SonicMultiBalanceResponse extends SonicBaseResponse {
  result: Array<{
    account: string;
    balance: string;
  }>;
}

export interface SonicTransaction {
  blockHash: string;
  blockNumber: string;
  confirmations: string;
  contractAddress: string;
  cumulativeGasUsed: string;
  from: string;
  gas: string;
  gasPrice: string;
  gasUsed: string;
  hash: string;
  input: string;
  nonce: string;
  timeStamp: string;
  to: string;
  transactionIndex: string;
  value: string;
  isError?: string;
}

export interface SonicTransactionListResponse extends SonicBaseResponse {
  result: SonicTransaction[];
}

export interface SonicTokenTransfer extends SonicTransaction {
  tokenName: string;
  tokenSymbol: string;
  tokenDecimal: string;
  contractAddress: string;
}

export interface SonicTokenTransferResponse extends SonicBaseResponse {
  result: SonicTokenTransfer[];
}

export interface SonicNFTTransfer extends SonicTokenTransfer {
  tokenID: string;
}

export interface SonicNFTTransferResponse extends SonicBaseResponse {
  result: SonicNFTTransfer[];
}

// Block types
export interface SonicBlockReward extends SonicBaseResponse {
  result: {
    blockNumber: string;
    timeStamp: string;
    blockMiner: string;
    blockReward: string;
    uncles: Array<{
      miner: string;
      unclePosition: string;
      blockreward: string;
    }>;
  };
}

export interface SonicBlockCountdown extends SonicBaseResponse {
  result: {
    CurrentBlock: string;
    CountdownBlock: string;
    RemainingBlock: string;
    EstimateTimeInSec: string;
  };
}

// Contract types
export interface SonicContractABI extends SonicBaseResponse {
  result: string; // Contract ABI JSON string
}

export interface SonicContractSource extends SonicBaseResponse {
  result: Array<{
    SourceCode: string;
    ABI: string;
    ContractName: string;
    CompilerVersion: string;
    OptimizationUsed: string;
    Runs: string;
    ConstructorArguments: string;
    Library: string;
    LicenseType: string;
    Proxy: string;
    Implementation: string;
    SwarmSource: string;
  }>;
}

// Stats types
export interface SonicTokenSupply extends SonicBaseResponse {
  result: string;
}

export interface SonicPrice extends SonicBaseResponse {
  result: {
    ethbtc: string;
    ethbtc_timestamp: string;
    ethusd: string;
    ethusd_timestamp: string;
  };
}

// Log types
export interface SonicLog {
  address: string;
  topics: string[];
  data: string;
  blockNumber: string;
  timeStamp: string;
  gasPrice: string;
  gasUsed: string;
  logIndex: string;
  transactionHash: string;
  transactionIndex: string;
}

export interface SonicLogResponse extends SonicBaseResponse {
  result: SonicLog[];
}

// Staker types
export interface SonicStakerInfo {
  logoUrl?: string;
  name?: string;
}

export interface SonicStaker {
  id: string;
  isActive: boolean;
  stake: string;
  stakerAddress: string;
  stakerInfo: SonicStakerInfo | null;
  delegatedLimit: string;
  totalStake: string;
  totalDelegatedLimit: string;
}

export interface SonicStakersResponse {
  data: {
    stakers: SonicStaker[];
  };
}

// Staking types
export interface SonicDelegationResponse {
  status: "success" | "error";
  message: string;
  data?: {
    txHash: string;
    explorerUrl: string;
  };
  error?: {
    code: string;
    message: string;
    details: unknown;
  };
}

export interface SonicDelegationParams {
  validatorId: string;
  amount: string;
}

// Delegation by address types
export interface SonicDelegationByAddress {
  address: string;
  amount: string;
  amountDelegated: string;
  amountInWithdraw: string;
  createdTime: string;
  pendingRewards: {
    amount: string;
  };
  toStakerId: string;
  withdrawRequests: Array<{
    amount: string;
    createdTime: string;
    withdrawRequestID: string;
    withdrawTime: string | null;
  }>;
}

export interface SonicDelegationsByAddressResponse {
  data: {
    delegationsByAddress: {
      edges: Array<{
        delegation: SonicDelegationByAddress;
      }>;
    };
  };
}

// Trade types
export interface SonicTradeToken {
  tokenAddress: string;
  amount?: string;
  proportion?: number;
}

export interface TokenInfo {
  address: string;
  symbol: string;
  decimals: number;
}

export interface SonicTradeQuoteRequest {
  chainId: number;
  inputTokens: SonicTradeToken[];
  outputTokens: SonicTradeToken[];
  userAddr: string;
  slippageLimitPercent: number;
  sourceBlacklist: string[];
  simulate: boolean;
  pathId: boolean;
  referralCode: number;
  gasPrice: number;
}

export interface SonicTradeQuoteResponse {
  traceId: string;
  inTokens: string[];
  outTokens: string[];
  inAmounts: string[];
  outAmounts: string[];
  gasEstimate: number;
  dataGasEstimate: number;
  gweiPerGas: number;
  gasEstimateValue: number;
  inValues: number[];
  outValues: number[];
  netOutValue: number;
  priceImpact: number;
  percentDiff: number;
  partnerFeePercent: number;
  pathId: string;
  pathViz: any | null;
  blockNumber: number;
  inputToken: TokenInfo;
  outputToken: TokenInfo;
}

export interface SonicTradeQuoteResult {
  status: "success" | "error";
  message: string;
  data?: SonicTradeQuoteResponse;
  error?: {
    code: string;
    message: string;
    details: unknown;
  };
}

// Search types
export interface SonicSearchResult {
  title: string;
  img: string;
  rate: string;
  address: string;
  link: string;
  group: string;
  groupid: string;
  website: string;
  is_checked: string;
  desc: string;
  reputation: string;
  ps: boolean;
}

export interface SonicSearchResponse {
  status: "success" | "error";
  message: string;
  data?: SonicSearchResult[];
  error?: {
    code: string;
    message: string;
    details: unknown;
  };
}

// Sonic Points types
export interface SonicPointsResponse {
  user_activity_last_detected: string;
  wallet_address: string;
  sonic_points: number;
  loyalty_multiplier: number;
  ecosystem_points: number;
  passive_liquidity_points: number;
  active_liquidity_points: number;
  rank: number;
}

export interface SonicPointsResult {
  status: "success" | "error";
  message: string;
  data?: SonicPointsResponse;
  error?: {
    code: string;
    message: string;
    details: unknown;
  };
}

export interface SonicWithdrawParams {
  validatorId: string;
  wrId: string; // Withdrawal request ID
}

export interface SonicWithdrawResponse {
  status: "success" | "error";
  message: string;
  data?: {
    txHash: string;
    explorerUrl: string;
  };
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}
