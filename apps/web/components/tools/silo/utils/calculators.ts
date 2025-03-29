import { ethers } from "ethers";
import { SiloMarket, SiloToken, SiloTokenDetail } from "../types";

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

/**
 * Always return full token decimals precision
 * @param tokenValue The USD value of one token unit (unused, kept for API consistency)
 * @param tokenDecimals The token's decimals
 * @returns Full token decimals
 */
export const calculateTokenPrecision = (
  tokenValue: number,
  tokenDecimals: number = 18
): number => {
  return tokenDecimals;
};

/**
 * Format token balance with full precision using BigInt operations
 * @param balance Raw token balance (in smallest units)
 * @param decimals Token decimals
 * @returns Exact token balance string with full precision
 */
export const formatTokenBalance = (
  balance: string,
  decimals: number = 18
): string => {
  if (!balance || balance === "0") return "0";

  try {
    // Using ethers to properly parse the token amount with full precision
    return ethers.formatUnits(balance, decimals);
  } catch (e) {
    console.error("Error formatting token balance:", e);
    // Fallback to direct division if ethers fails
    return (
      (BigInt(balance) * BigInt(1e6)) / BigInt(10 ** decimals) / BigInt(1e6) +
      ""
    );
  }
};

/**
 * Calculate token value in USD
 * @param amount Token amount (in human-readable form)
 * @param priceUsd Token price in microdollars (1e6)
 * @returns USD value
 */
export const calculateTokenValueUSD = (
  amount: string | number,
  priceUsd?: string
): number => {
  if (!amount || !priceUsd) return 0;
  const amountNum = typeof amount === "string" ? parseFloat(amount) : amount;
  return amountNum * (parseInt(priceUsd) / 1e6);
};

/**
 * Calculate shares for withdrawal based on token amount with high precision
 * @param amount Token amount to withdraw
 * @param tokenDetail Token details with balances and shares
 * @param decimals Token decimals
 * @returns Calculated shares as string
 */
export const calculateWithdrawShares = (
  amount: string,
  tokenDetail: SiloTokenDetail | null,
  decimals: number = 18
): string => {
  if (!amount || !tokenDetail || parseFloat(amount) <= 0) return "0";

  const suppliedAssets = tokenDetail.collateralBalance || "0";
  const shareBalance = tokenDetail.collateralShares || "0";

  try {
    // Parse token amount using ethers for maximum precision
    const tokenAmountBigInt = BigInt(
      ethers.parseUnits(amount, decimals).toString()
    );
    const totalTokensBigInt = BigInt(suppliedAssets);

    if (totalTokensBigInt <= 0n) return "0";

    // If withdrawing everything (or very close to it), return all shares
    // Add a small buffer for potential floating point issues (99.99% of balance)
    const nearFullWithdrawal =
      tokenAmountBigInt * 10000n >= totalTokensBigInt * 9999n;
    if (tokenAmountBigInt >= totalTokensBigInt || nearFullWithdrawal) {
      return shareBalance;
    }

    // Calculate shares with maximum precision using BigInt
    const shareBalanceBigInt = BigInt(shareBalance);

    // Use a high precision factor (10^36) to avoid precision loss in division
    const PRECISION = 10n ** 36n;

    // Calculate with maximum precision: shares = (tokenAmount / totalTokens) * totalShares
    const scaledTokenAmount = tokenAmountBigInt * PRECISION;
    const sharesToWithdraw =
      (scaledTokenAmount * shareBalanceBigInt) / totalTokensBigInt;

    return (sharesToWithdraw / PRECISION).toString();
  } catch (e) {
    console.error("Error calculating withdraw shares:", e);
    return "0";
  }
};
