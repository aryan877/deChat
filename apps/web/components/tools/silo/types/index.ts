export interface SiloToken {
  symbol: string;
  name: string;
  decimals: number;
  priceUsd: string;
  tvl: string;
  liquidity: string;
  maxLtv: string;
  lt: string;
  collateralBaseApr: string;
  debtBaseApr: string;
  collateralPrograms: {
    apr: string;
    rewardTokenSymbol?: string;
  }[];
  debtPrograms: { apr: string }[];
  oracleLabel: string;
  isNonBorrowable: boolean;
  collateralPoints?: Array<{
    _tag: string;
    basePoints?: number;
    multiplier?: number;
  }>;
  debtPoints?: Array<{
    _tag: string;
    basePoints?: number;
    multiplier?: number;
  }>;
  logos?: {
    trustWallet: null | { small?: string; large?: string };
    coinMarketCap: null | { small?: string; large?: string };
    coinGecko: null | { small?: string; large?: string };
  };
  tokenAddress?: string;
}

export interface SiloMarket {
  id: string;
  chainKey: string;
  boostedContentKey: string | null;
  silo0?: SiloToken;
  silo1?: SiloToken;
}

export interface SiloStats {
  tvlUsd: string;
}
