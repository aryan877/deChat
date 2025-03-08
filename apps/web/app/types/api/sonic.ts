// Token balance type from Dune API
export interface TokenBalance {
  chain: string;
  chain_id: number;
  address: string;
  amount: string;
  symbol: string;
  name?: string;
  decimals: number;
  price_usd: number;
  value_usd: number;
  pool_size?: number;
  low_liquidity?: boolean;
}

// Response from Dune API for balances
export interface SonicBalancesResponse {
  request_time: string;
  response_time: string;
  wallet_address: string;
  balances: TokenBalance[];
}

// Transaction type from Dune API
export interface Transaction {
  address: string;
  block_hash: string;
  block_number: string;
  block_time: string;
  block_version: number;
  chain: string;
  from: string;
  to: string;
  data: string;
  gas_price: string;
  hash: string;
  index: string;
  max_fee_per_gas?: string;
  max_priority_fee_per_gas?: string;
  nonce: string;
  transaction_type: string;
  value: string;
  // Decoded fields if decode=true
  decoded_call?: {
    method_id: string;
    method_name: string;
    parameters?: {
      name: string;
      type: string;
      value: any;
    }[];
  };
  decoded_logs?: {
    address: string;
    topics: string[];
    data: string;
    event_name: string;
    parameters?: {
      name: string;
      type: string;
      value: any;
      indexed: boolean;
    }[];
  }[];
}

// Response from Dune API for transactions
export interface SonicTransactionsResponse {
  transactions: Transaction[];
  next_offset?: string;
}
