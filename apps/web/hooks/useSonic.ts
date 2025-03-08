import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { sonicClient } from "@/app/clients/sonic";
import { TokenBalance, Transaction } from "@/app/types/api/sonic";

/**
 * Query key factory for Sonic-related queries
 */
export const sonicKeys = {
  all: ["sonic"] as const,
  balances: (address: string, chainId: string) =>
    [...sonicKeys.all, "balances", address, chainId] as const,
  transactions: (address: string, chainId: string) =>
    [...sonicKeys.all, "transactions", address, chainId] as const,
};

/**
 * Hook to fetch and monitor Sonic chain token balances
 *
 * Uses hooks:
 * - useQuery
 *
 * This hook fetches token balances for a wallet on the Sonic chain.
 * Provides loading states and error handling.
 * Use refreshBalances() to manually update the balances.
 */
export function useSonicBalances(walletAddress: string | undefined) {
  const { data, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: sonicKeys.balances(walletAddress || "", "146"),
    queryFn: async () => {
      if (!walletAddress) throw new Error("No wallet address");
      return await sonicClient.getSonicBalances(walletAddress);
    },
    enabled: !!walletAddress,
  });

  // Calculate total portfolio value, excluding unreasonably large values
  const totalValue =
    data?.balances.reduce((sum: number, token: TokenBalance) => {
      // Skip tokens with unreasonably large values
      if (token.value_usd > 1e12) return sum;
      return sum + token.value_usd;
    }, 0) || 0;

  // Format the total value
  const formattedTotalValue =
    totalValue > 1e12
      ? "Value too large"
      : totalValue.toLocaleString(undefined, {
          style: "currency",
          currency: "USD",
          maximumFractionDigits: 2,
        });

  return {
    balances: data?.balances || [],
    totalValue: formattedTotalValue,
    isLoading,
    isRefetching,
    error,
    refreshBalances: () => refetch(),
  };
}

/**
 * Hook to fetch and paginate Sonic chain transactions
 *
 * Uses hooks:
 * - useInfiniteQuery
 *
 * This hook fetches transactions for a wallet on the Sonic chain with pagination.
 * Provides loading states, error handling, and pagination controls.
 */
export function useSonicTransactions(walletAddress: string | undefined) {
  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: sonicKeys.transactions(walletAddress || "", "146"),
    queryFn: async ({ pageParam }) => {
      if (!walletAddress) throw new Error("No wallet address");
      return await sonicClient.getSonicTransactions(walletAddress, {
        offset: pageParam,
        limit: 10,
      });
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.next_offset,
    enabled: !!walletAddress,
  });

  const transactions =
    data?.pages.flatMap((page) =>
      page.transactions.map((tx: Transaction) => {
        // Format the timestamp
        const date = new Date(tx.block_time);
        const formattedDate = date.toLocaleString();

        // Format the value (convert from hex to decimal and from wei to ETH)
        let valueInEth = "0";
        try {
          const valueInWei = parseInt(tx.value, 16);
          valueInEth = (valueInWei / 1e18).toFixed(6);
        } catch (e) {
          console.error("Error parsing transaction value:", e);
        }

        // Determine transaction type
        let txType = "Unknown";
        if (tx.from.toLowerCase() === walletAddress?.toLowerCase()) {
          txType = "Sent";
        } else if (tx.to.toLowerCase() === walletAddress?.toLowerCase()) {
          txType = "Received";
        }

        // Get method name if available
        const methodName =
          tx.decoded_call?.method_name ||
          tx.decoded_call?.method_id ||
          "Unknown";

        return {
          ...tx,
          formattedDate,
          valueInEth,
          txType,
          methodName,
        };
      })
    ) || [];

  return {
    transactions,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage: !!data?.pages[data.pages.length - 1]?.next_offset,
    isFetchingNextPage,
    refreshTransactions: () => refetch(),
  };
}
