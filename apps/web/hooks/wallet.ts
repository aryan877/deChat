import { useMutation, useQuery } from "@tanstack/react-query";
import { walletClient } from "@/app/clients/wallet";
import { ChainType } from "@/app/types/api/wallet";
import { useClusterStore } from "@/app/store/clusterStore";

/**
 * Query key factory for wallet-related queries
 */
export const walletKeys = {
  all: ["wallets"] as const,
  balance: (address: string, cluster: string) =>
    [...walletKeys.all, "balance", address, cluster] as const,
};

/**
 * Hook to fetch and monitor wallet balance
 *
 * Uses hooks:
 * - useQuery
 * - useClusterStore
 *
 * This hook keeps track of a wallet's SONIC balance.
 * Provides loading states and error handling.
 * Use refreshBalance() to manually update the balance.
 *
 * Note: SONIC token has 18 decimal places
 */
export function useWalletBalance(walletAddress: string | undefined) {
  const { selectedCluster } = useClusterStore();

  const {
    data: balance,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: walletKeys.balance(walletAddress || "", selectedCluster),
    queryFn: async () => {
      if (!walletAddress) throw new Error("No wallet address");
      const response = await walletClient.getBalance(
        walletAddress,
        selectedCluster
      );
      // Format balance considering 18 decimals for SONIC token
      const formattedBalance = Number(response.balance) / 10 ** 18;
      return {
        balance: Number(formattedBalance).toFixed(4),
      };
    },
    enabled: !!walletAddress,
  });

  return {
    balance: balance?.balance,
    isLoading,
    isRefetching,
    error,
    refreshBalance: () => refetch(),
  };
}

/**
 * Hook to store a new wallet address for the user
 *
 * Uses hooks:
 * - useMutation
 *
 * This hook saves a wallet address to our backend.
 * Uses React Query's mutation for handling the API call.
 * Default chain is Ethereum but supports other chains too.
 */
export function useStoreWallet() {
  return useMutation({
    mutationFn: ({
      address,
      chainType = "ethereum",
    }: {
      address: string;
      chainType?: ChainType;
    }) => walletClient.storeWallet(address, chainType),
    onSuccess: () => {},
  });
}
