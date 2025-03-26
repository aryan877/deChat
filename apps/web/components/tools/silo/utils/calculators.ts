import { SiloMarket, SiloToken } from "../types";

/**
 * Calculate the deposit APR for a given Silo token
 */
export const calculateDepositAPR = (silo?: SiloToken): number => {
  if (!silo) return 0;

  let baseApr = parseFloat(silo.collateralBaseApr || "0") / 1e18;

  // Add rewards from programs
  if (silo.collateralPrograms && silo.collateralPrograms.length > 0) {
    silo.collateralPrograms.forEach((program) => {
      if (program.apr) {
        baseApr += parseFloat(program.apr) / 1e18;
      }
    });
  }

  return baseApr;
};

/**
 * Calculate the base deposit APR (without programs) for a given Silo token
 */
export const calculateBaseDepositAPR = (silo?: SiloToken): number => {
  if (!silo) return 0;
  return parseFloat(silo.collateralBaseApr || "0") / 1e18;
};

/**
 * Calculate the rewards APR from collateral programs
 */
export const calculateRewardsAPR = (silo?: SiloToken): number => {
  if (!silo || !silo.collateralPrograms || silo.collateralPrograms.length === 0)
    return 0;

  let rewardsApr = 0;
  silo.collateralPrograms.forEach((program) => {
    if (program.apr) {
      rewardsApr += parseFloat(program.apr) / 1e18;
    }
  });

  return rewardsApr;
};

/**
 * Calculate the borrow APR for a given Silo token
 */
export const calculateBorrowAPR = (silo?: SiloToken): number => {
  if (!silo) return 0;
  if (silo.isNonBorrowable) return 0;

  let baseApr = parseFloat(silo.debtBaseApr || "0") / 1e18;

  // Add costs from programs
  if (silo.debtPrograms && silo.debtPrograms.length > 0) {
    silo.debtPrograms.forEach((program) => {
      if (program.apr) {
        baseApr += parseFloat(program.apr) / 1e18;
      }
    });
  }

  return baseApr;
};

/**
 * Calculate the TVL in USD for a given Silo token
 */
export const calculateTVLInUSD = (silo?: SiloToken): number => {
  if (!silo || !silo.tvl) return 0;

  // Use default decimals of 18 if not specified
  const divisor = 10 ** (silo.decimals || 18);
  const tvlRaw = parseFloat(silo.tvl) / divisor;

  // Price is usually in microdollars (1e6)
  const priceInUsd = parseFloat(silo.priceUsd || "0") / 1e6;

  return tvlRaw * priceInUsd;
};

/**
 * Calculate available liquidity in USD for a given Silo token
 */
export const calculateAvailableLiquidity = (silo?: SiloToken): number => {
  if (!silo || !silo.liquidity || silo.isNonBorrowable) return 0;

  // Use default decimals of 18 if not specified
  const divisor = 10 ** (silo.decimals || 18);
  const liquidityRaw = parseFloat(silo.liquidity) / divisor;

  // Price is usually in microdollars (1e6)
  const priceInUsd = parseFloat(silo.priceUsd || "0") / 1e6;

  return liquidityRaw * priceInUsd;
};

/**
 * Calculate the total TVL for a market (sum of all tokens)
 */
export const calculateTotalMarketTVL = (market: SiloMarket): number => {
  if (!market) return 0;

  let tvl = 0;

  if (market.silo0) {
    tvl += calculateTVLInUSD(market.silo0);
  }

  if (market.silo1) {
    tvl += calculateTVLInUSD(market.silo1);
  }

  return tvl;
};

/**
 * Check if a token has premium Silo points
 */
export const hasPremiumSiloPoints = (silo?: SiloToken): boolean => {
  if (!silo || !silo.collateralPoints) return false;

  for (const point of silo.collateralPoints) {
    if (
      point._tag === "silo" &&
      ((point.basePoints && point.basePoints > 1) ||
        (point.basePoints === 1 && point.multiplier && point.multiplier > 1))
    ) {
      return true;
    }
  }

  return false;
};
