import {
  SiloMarket,
  SiloMarketDetail,
  SiloStats,
} from "@/components/tools/silo/types";
import api from "@/lib/axios";
import { SiloFinanceData } from "../types/tools";

export const siloClient = {
  /**
   * Fetch Silo Finance markets data
   */
  getMarkets: async (params?: {
    chainKey?: string;
    search?: string;
    excludeEmpty?: boolean;
  }): Promise<SiloMarket[]> => {
    const { data } = await api.get<SiloMarket[]>("/api/silo/markets", {
      params,
    });
    return data;
  },

  /**
   * Fetch Silo Finance stats
   */
  getStats: async (): Promise<SiloStats> => {
    const { data } = await api.get("/api/silo/stats");
    return data;
  },

  /**
   * Fetch both markets and stats in a single call
   */
  getSiloData: async (params?: {
    chainKey?: string;
    search?: string;
    excludeEmpty?: boolean;
  }): Promise<SiloFinanceData> => {
    const [markets, stats] = await Promise.all([
      siloClient.getMarkets(params),
      siloClient.getStats(),
    ]);

    return {
      markets,
      stats,
    };
  },

  /**
   * Fetch detailed data for a specific market
   */
  getMarketDetail: async (
    chainKey: string,
    marketId: string
  ): Promise<SiloMarketDetail> => {
    const { data } = await api.get<SiloMarketDetail>(
      `/api/silo/market/${chainKey}/${marketId}`
    );
    return data;
  },

  /**
   * Fetch detailed data for a specific market with user information
   */
  getMarketDetailForUser: async (
    chainKey: string,
    marketId: string,
    userAddress: string
  ): Promise<SiloMarketDetail> => {
    const { data } = await api.get<SiloMarketDetail>(
      `/api/silo/market/${chainKey}/${marketId}/user`,
      {
        params: { userAddress },
      }
    );
    return data;
  },

  /**
   * Execute a deposit transaction on Silo Finance protocol
   */
  executeDeposit: async (params: {
    siloAddress: string;
    tokenAddress: string;
    amount: string;
    userAddress: string;
    assetType?: number;
    isNative?: boolean;
  }): Promise<{
    success: boolean;
    approvalTxHash: string | null;
    approvalExplorerUrl: string | null;
    depositTxHash: string;
    depositExplorerUrl: string;
  }> => {
    const { data } = await api.post<{
      success: boolean;
      approvalTxHash: string | null;
      approvalExplorerUrl: string | null;
      depositTxHash: string;
      depositExplorerUrl: string;
    }>("/api/silo/deposit/execute", params);
    return data;
  },
};
