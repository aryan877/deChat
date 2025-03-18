import { z } from "zod";

// User Reserve Detail
export interface AaveUserReserveDetail {
  symbol: string;
  supplied: string;
  borrowed: string;
  supplyAPY: string;
  borrowAPY: string;
}

// User Account Summary
export interface AaveUserSummary {
  totalCollateralUSD: string;
  totalDebtUSD: string;
  availableBorrowsUSD: string;
  liquidationThreshold: string;
  healthFactor: string;
  netAPY: string;
  borrowPowerUsed: string;
  userReserves: AaveUserReserveDetail[];
}

// Main response interface
export interface AaveUserDataResponse {
  userSummary: AaveUserSummary;
  hasActivePosition: boolean;
}

// Schema for getUserData
export const getAaveUserDataSchema = z.object({
  userAddress: z.string().describe("User address to get Aave data for"),
});

export type GetAaveUserDataParams = z.infer<typeof getAaveUserDataSchema>;
