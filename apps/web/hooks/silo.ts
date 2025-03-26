import { siloClient } from "@/app/clients/silo";
import { useQuery } from "@tanstack/react-query";

export const siloKeys = {
  all: ["silo"] as const,
  markets: () => [...siloKeys.all, "markets"] as const,
  stats: () => [...siloKeys.all, "stats"] as const,
  data: () => [...siloKeys.all, "data"] as const,
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
