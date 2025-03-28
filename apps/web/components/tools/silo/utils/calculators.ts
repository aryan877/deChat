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
 * Calculate the appropriate decimal precision based on token value
 * @param tokenValue The USD value of one token unit
 * @param tokenDecimals The token's decimals
 * @returns The appropriate number of decimal places to display
 */
export const calculateTokenPrecision = (
  tokenValue: number,
  tokenDecimals: number = 18
): number => {
  // Higher value tokens need more precision
  if (tokenValue >= 10000) return 8;
  if (tokenValue >= 1000) return 6;
  if (tokenValue >= 100) return 4;
  if (tokenValue >= 10) return 3;
  // For lower value tokens, use at least 2 decimals but no more than the token's native precision
  return Math.max(2, Math.min(tokenDecimals, 6));
};

/**
 * Format token balance to appropriate precision
 * @param balance Raw token balance (in smallest units)
 * @param decimals Token decimals
 * @param precision Display precision
 * @returns Formatted balance string
 */
export const formatTokenBalance = (
  balance: string,
  decimals: number = 18,
  precision: number = 6
): string => {
  if (!balance) return `0.${"0".repeat(precision)}`;
  return (parseFloat(balance) / 10 ** decimals).toFixed(precision);
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

  // Get formatted balance for comparison
  const formattedBalance = formatTokenBalance(suppliedAssets, decimals);

  if (parseFloat(amount) > parseFloat(formattedBalance)) return "0";

  try {
    // Convert string values to numbers for calculation
    const tokenAmountToWithdraw = parseFloat(amount);
    const totalTokens = parseFloat(suppliedAssets) / 10 ** decimals;

    if (totalTokens <= 0) return "0";

    // Calculate the proportion of tokens to withdraw (tokenAmount / totalTokens)
    const proportion = tokenAmountToWithdraw / totalTokens;

    // If we're withdrawing everything (or very close to it), return all shares to avoid dust
    if (proportion > 0.999) {
      return shareBalance;
    }

    // For precise calculation, use BigInt to avoid floating point issues
    try {
      // Convert to BigInt for maximum precision
      const shareBalanceBigInt = BigInt(shareBalance);

      // Use a high precision factor (10^18) to avoid floating point issues
      const PRECISION = 10n ** 18n;

      // Calculate proportion with high precision
      // First convert proportion to a scaled integer
      const proportionScaled = BigInt(
        Math.floor(proportion * Number(PRECISION))
      );

      // Calculate shares = shareBalance * proportion
      const calculatedSharesBigInt =
        (shareBalanceBigInt * proportionScaled) / PRECISION;

      // Round down to ensure we don't exceed available shares
      return calculatedSharesBigInt.toString();
    } catch (e) {
      console.error("BigInt calculation failed:", e);

      // Fallback calculation if BigInt fails
      // Calculate using standard math but ensure we round down
      const sharesToWithdraw = Math.floor(
        parseFloat(shareBalance) * proportion
      );
      return sharesToWithdraw.toString();
    }
  } catch (e) {
    console.error("Error calculating shares:", e);
    return "0";
  }
};
