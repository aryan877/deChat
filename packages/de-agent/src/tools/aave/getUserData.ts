import {
  ChainId,
  UiIncentiveDataProvider,
  UiPoolDataProvider,
} from "@aave/contract-helpers";
import {
  formatReservesAndIncentives,
  formatUserSummaryAndIncentives,
} from "@aave/math-utils";
import dayjs from "dayjs";
import ethers5 from "ethers";
import { AaveV3Sonic } from "../../constants/aave.js";
import {
  AaveUserDataResponse,
  GetAaveUserDataParams,
} from "../../types/aave.js";

/**
 * Format a number to a string with specified decimals
 */
const formatNumber = (num: number | string, decimals = 2): string => {
  return (typeof num === "string" ? parseFloat(num) : num).toFixed(decimals);
};

/**
 * Calculate Net APY for a user
 * This considers both supply and borrow positions to calculate net yield
 */
const calculateNetAPY = (userSummary: any): number => {
  let totalSupplyAPY = 0;
  let totalBorrowAPY = 0;
  let totalSupplyUSD = 0;
  let totalBorrowUSD = 0;

  userSummary.userReservesData.forEach((reserve: any) => {
    const supplyUSD = parseFloat(reserve.underlyingBalanceUSD);
    const borrowUSD = parseFloat(reserve.variableBorrowsUSD);

    if (supplyUSD > 0) {
      const apy = parseFloat(reserve.reserve.supplyAPY) * 100;
      totalSupplyAPY += supplyUSD * (apy / 100);
      totalSupplyUSD += supplyUSD;
    }

    if (borrowUSD > 0) {
      const apy = parseFloat(reserve.reserve.variableBorrowAPY) * 100;
      totalBorrowAPY += borrowUSD * (apy / 100);
      totalBorrowUSD += borrowUSD;
    }
  });

  const netWorthUSD = parseFloat(userSummary.netWorthUSD);

  // Return 0 if no supply or negative net worth
  if (netWorthUSD <= 0 || totalSupplyUSD === 0) {
    return 0;
  }

  // If we have both supply and borrow positions, calculate weighted net APY
  if (totalSupplyUSD > 0 && totalBorrowUSD > 0) {
    return (totalSupplyAPY - totalBorrowAPY) / netWorthUSD;
  }

  // Only supply positions
  return totalSupplyAPY / netWorthUSD;
};

/**
 * Calculate borrow power used
 * This shows what percentage of available borrowing capacity is being used
 */
const calculateBorrowPowerUsed = (userSummary: any): number => {
  const totalBorrowsUSD = parseFloat(userSummary.totalBorrowsUSD);
  const availableBorrowsUSD = parseFloat(userSummary.availableBorrowsUSD);

  if (totalBorrowsUSD === 0 && availableBorrowsUSD === 0) {
    return 0;
  }

  const totalBorrowingPower = totalBorrowsUSD + availableBorrowsUSD;
  return (totalBorrowsUSD / totalBorrowingPower) * 100;
};

/**
 * Get Aave user data from Sonic network
 *
 * This comprehensive tool fetches a user's complete position on Aave,
 * including:
 * - Total collateral and debt in USD
 * - Health factor and liquidation threshold
 * - Net APY across all positions
 * - Borrow power utilization
 * - Detailed breakdown of each supplied/borrowed asset
 *
 * @param params Parameters for fetching user data
 * @param params.userAddress Address of the user to fetch data for
 * @returns Formatted user position data
 */
export async function getUserData(
  params: GetAaveUserDataParams
): Promise<AaveUserDataResponse> {
  try {
    // Create custom provider using ethers5
    const provider = new ethers5.providers.JsonRpcProvider(
      process.env.SONIC_MAINNET_RPC_URL || "https://rpc.ankr.com/sonic_mainnet"
    );

    // Initialize contract instances
    const poolDataProviderContract = new UiPoolDataProvider({
      uiPoolDataProviderAddress: AaveV3Sonic.UI_POOL_DATA_PROVIDER,
      provider,
      chainId: ChainId.sonic,
    });

    const incentiveDataProviderContract = new UiIncentiveDataProvider({
      uiIncentiveDataProviderAddress: AaveV3Sonic.UI_INCENTIVE_DATA_PROVIDER,
      provider,
      chainId: ChainId.sonic,
    });

    const poolAddressesProvider = AaveV3Sonic.POOL_ADDRESSES_PROVIDER;

    // Fetch all required data
    const reserves = await poolDataProviderContract.getReservesHumanized({
      lendingPoolAddressProvider: poolAddressesProvider,
    });

    const userReserves =
      await poolDataProviderContract.getUserReservesHumanized({
        lendingPoolAddressProvider: poolAddressesProvider,
        user: params.userAddress,
      });

    const reserveIncentives =
      await incentiveDataProviderContract.getReservesIncentivesDataHumanized({
        lendingPoolAddressProvider: poolAddressesProvider,
      });

    const userIncentives =
      await incentiveDataProviderContract.getUserReservesIncentivesDataHumanized(
        {
          lendingPoolAddressProvider: poolAddressesProvider,
          user: params.userAddress,
        }
      );

    const currentTimestamp = dayjs().unix();

    // Process and format data
    const formattedPoolReserves = formatReservesAndIncentives({
      reserves: reserves.reservesData,
      currentTimestamp,
      marketReferenceCurrencyDecimals:
        reserves.baseCurrencyData.marketReferenceCurrencyDecimals,
      marketReferencePriceInUsd:
        reserves.baseCurrencyData.marketReferenceCurrencyPriceInUsd,
      reserveIncentives,
    });

    console.log(formattedPoolReserves);

    const rawUserSummary = formatUserSummaryAndIncentives({
      currentTimestamp,
      marketReferencePriceInUsd:
        reserves.baseCurrencyData.marketReferenceCurrencyPriceInUsd,
      marketReferenceCurrencyDecimals:
        reserves.baseCurrencyData.marketReferenceCurrencyDecimals,
      userReserves: userReserves.userReserves,
      formattedReserves: formattedPoolReserves,
      userEmodeCategoryId: userReserves.userEmodeCategoryId,
      reserveIncentives,
      userIncentives,
    });

    // Calculate additional metrics
    const netAPY = calculateNetAPY(rawUserSummary);
    const borrowPowerUsed = calculateBorrowPowerUsed(rawUserSummary);

    // Format the active reserves for display
    const activeReserves = rawUserSummary.userReservesData
      .filter((reserve: any) => {
        return (
          Number(reserve.scaledATokenBalance) > 0 ||
          Number(reserve.scaledVariableDebt) > 0
        );
      })
      .map((reserve: any) => {
        return {
          symbol: reserve.reserve.symbol,
          supplied: formatNumber(reserve.underlyingBalance, 6),
          borrowed: formatNumber(reserve.variableBorrows, 6),
          supplyAPY: formatNumber(reserve.reserve.supplyAPY * 100, 4) + "%",
          borrowAPY:
            formatNumber(reserve.reserve.variableBorrowAPY * 100, 4) + "%",
        };
      });

    // Check if user has any position
    const hasActivePosition = activeReserves.length > 0;

    // Format the summary data
    const formattedSummary = {
      totalCollateralUSD: formatNumber(rawUserSummary.totalCollateralUSD, 4),
      totalDebtUSD: formatNumber(rawUserSummary.totalBorrowsUSD, 4),
      availableBorrowsUSD: formatNumber(rawUserSummary.availableBorrowsUSD, 4),
      liquidationThreshold: formatNumber(
        rawUserSummary.currentLiquidationThreshold,
        4
      ),
      healthFactor:
        parseFloat(rawUserSummary.totalBorrowsUSD) === 0
          ? "∞" // When no borrows, health factor is infinite
          : formatNumber(rawUserSummary.healthFactor, 4),
      netAPY: formatNumber(netAPY * 100, 4) + "%",
      borrowPowerUsed: formatNumber(borrowPowerUsed, 2) + "%",
      userReserves: activeReserves,
    };

    return {
      userSummary: formattedSummary,
      hasActivePosition,
    };
  } catch (error) {
    throw new Error(
      `Failed to get Aave user data: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}
