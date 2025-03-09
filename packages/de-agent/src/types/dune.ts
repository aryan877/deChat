export interface DuneTokenBalance {
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

export interface DuneBalancesResponse {
  request_time: string;
  response_time: string;
  wallet_address: string;
  balances: DuneTokenBalance[];
}
