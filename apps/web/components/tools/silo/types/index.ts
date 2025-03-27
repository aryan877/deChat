// Common interfaces
export interface SiloLogo {
  small?: string;
  large?: string;
}

export interface SiloLogos {
  trustWallet: null | SiloLogo;
  coinMarketCap: null | SiloLogo;
  coinGecko: null | SiloLogo;
}

export interface SiloOracle {
  address: string;
  oracleKey: string;
  baseToken: string | null;
  quoteToken: string | null;
  name: string | null;
}

export interface SiloPoint {
  _tag: string;
  basePoints?: number;
  multiplier?: number;
}

export interface SiloProgram {
  apr: string;
  rewardTokenSymbol?: string;
}

// IRMCurveData interface
export interface IRMCurveDataPoint {
  utilization: string;
  debtBaseApr: string;
}

export interface IRMCurveData {
  actual: IRMCurveDataPoint[];
  floor: IRMCurveDataPoint[];
}

// AccruedConfig interface
export interface AccruedConfig {
  uopt: string;
  ucrit: string;
  ulow: string;
  ki: string;
  kcrit: string;
  klow: string;
  klin: string;
  beta: string;
  ri: string;
  Tcrit: string;
}

// Projections interface
export interface SiloProjections {
  collateralBaseApr: string;
  collateralBaseApr1d: string;
  collateralBaseApr3d: string;
  debtBaseApr: string;
  debtBaseApr1d: string;
  debtBaseApr3d: string;
}

// Base token interface for simplified market listings
export interface SiloToken {
  tokenAddress?: string;
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
  collateralPrograms: SiloProgram[];
  debtPrograms: SiloProgram[];
  protectedPrograms?: SiloProgram[];
  oracleLabel: string | null;
  oracleContentKey?: string;
  isNonBorrowable: boolean;
  collateralPoints?: SiloPoint[];
  protectedPoints?: SiloPoint[];
  debtPoints?: SiloPoint[];
  logos?: SiloLogos;
  solvencyOracle?: SiloOracle;
  maxLtvOracle?: SiloOracle;
}

// Simple market interface for market listings
export interface SiloMarket {
  id: string;
  chainKey: string;
  protocolKey?: string;
  isVerified?: boolean;
  configAddress?: string;
  boostedContentKey: string | null;
  silo0?: SiloToken;
  silo1?: SiloToken;
}

// Stats interface
export interface SiloStats {
  tvlUsd: string;
}

// Detailed token information for specific market view
export interface SiloTokenDetail extends SiloToken {
  protocolKey: string;
  siloIndex: string;
  siloAddress: string;
  liquidationFee: string;
  irm: string;
  siloTvlUsdCap: string | null;
  lendingQuote: string | null;
  solvencyQuote: string | null;
  user: string | null;
  collateralBalance: string;
  collateralShares: string;
  protectedBalance: string;
  protectedShares: string;
  debtBalance: string;
  debtShares: string;
  projectedDebtBalance: string;
  depositLiquidationPrice: string | null;
  debtLiquidationPrice: string | null;
  aprState: string;
  collateralStoredAssets: string;
  collateralAccruedAssets: string;
  protectedAssets: string;
  debtStoredAssets: string;
  debtAccruedAssets: string;
  utilization: string;
  utilizationState: string;
  accruedConfig: AccruedConfig;
  irmCurveData: IRMCurveData;
  projections: SiloProjections;
  projectionsState: string;
  chainKey: string;
  rawSymbol: string;
  isWrappedNative: boolean;
  tokenBalance: string;
  routerWithExecuteAllowance: string;
  routerWithMulticallAllowance: string;
  nativeBalance: string;
  collateralShareToken: string;
  collateralShareTokenSymbol: string;
  collateralShareTokenAllowance: string;
  protectedShareToken: string;
  protectedShareTokenSymbol: string;
  protectedShareTokenAllowance: string;
  debtShareToken: string;
  debtShareTokenSymbol: string;
  debtShareTokenAllowance: string;
}

// Detailed market interface for specific market view
export interface SiloMarketDetail {
  chainKey: string;
  protocolKey: string;
  id: string;
  configAddress: string;
  deployedTimestamp: number;
  deployerAddress: string;
  daoFee: string;
  deployerFee: string;
  collateralSiloAddress: string | null;
  debtSiloAddress: string | null;
  healthFactor: string;
  borrowPowerUsed: string;
  isAtRiskOfLiquidation: boolean;
  isVerified: boolean;
  riskReportLink: string;
  enableLiquidationPrice: boolean;
  boostedContentKey: string | null;
  silo0: SiloTokenDetail;
  silo1: SiloTokenDetail;
}
