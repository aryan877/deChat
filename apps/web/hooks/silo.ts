import { siloClient } from "@/app/clients/silo";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SiloDepositTransactionData } from "../components/tools/silo/types";

export const siloKeys = {
  all: ["silo"] as const,
  markets: () => [...siloKeys.all, "markets"] as const,
  stats: () => [...siloKeys.all, "stats"] as const,
  data: () => [...siloKeys.all, "data"] as const,
  market: (chainKey: string, marketId: string) =>
    [...siloKeys.all, "market", chainKey, marketId] as const,
  userMarket: (chainKey: string, marketId: string, userAddress: string) =>
    [...siloKeys.all, "userMarket", chainKey, marketId, userAddress] as const,
  marketData: (chainKey: string, marketId: string) =>
    [...siloKeys.all, "marketData", chainKey, marketId] as const,
  userMarketData: (chainKey: string, marketId: string, userAddress: string) =>
    [
      ...siloKeys.all,
      "userMarketData",
      chainKey,
      marketId,
      userAddress,
    ] as const,
  tokenBalance: (
    walletAddress: string,
    tokenAddress: string,
    cluster: string
  ) =>
    [
      ...siloKeys.all,
      "tokenBalance",
      walletAddress,
      tokenAddress,
      cluster,
    ] as const,
};

export function useSiloMarkets(params?: {
  chainKey?: string;
  search?: string;
  excludeEmpty?: boolean;
}) {
  return useQuery({
    queryKey: siloKeys.markets(),
    queryFn: () => siloClient.getMarkets(params),
  });
}

export function useSiloStats() {
  return useQuery({
    queryKey: siloKeys.stats(),
    queryFn: () => siloClient.getStats(),
  });
}

export function useSiloData(params?: {
  chainKey?: string;
  search?: string;
  excludeEmpty?: boolean;
}) {
  return useQuery({
    queryKey: siloKeys.data(),
    queryFn: () => siloClient.getSiloData(params),
  });
}

/**
 * Hook to fetch detailed market data
 */
export function useSiloMarketDetail(chainKey: string, marketId: string) {
  return useQuery({
    queryKey: siloKeys.market(chainKey, marketId),
    queryFn: () => siloClient.getMarketDetail(chainKey, marketId),
  });
}

/**
 * Hook to fetch detailed market data for a specific user
 */
export function useSiloMarketDetailForUser(
  chainKey: string,
  marketId: string,
  userAddress: string
) {
  return useQuery({
    queryKey: siloKeys.userMarket(chainKey, marketId, userAddress),
    queryFn: () =>
      siloClient.getMarketDetailForUser(chainKey, marketId, userAddress),
    enabled: Boolean(userAddress),
  });
}

/**
 * Hook to execute Silo deposit transaction
 */
export function useExecuteDeposit() {
  const queryClient = useQueryClient();

  return useMutation<
    SiloDepositTransactionData,
    Error,
    {
      siloAddress: string;
      tokenAddress: string;
      amount: string;
      userAddress: string;
      assetType?: number;
      isNative?: boolean;
    }
  >({
    mutationFn: (params) => siloClient.executeDeposit(params),
    onSuccess: () => {
      // Invalidate all user-related market queries to force a refresh
      queryClient.invalidateQueries({ queryKey: siloKeys.all });
    },
  });
}
