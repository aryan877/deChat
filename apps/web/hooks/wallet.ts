import { useMutation } from "@tanstack/react-query";
import { walletClient } from "@/app/clients/wallet";
import { ChainType } from "@/app/types/api/wallet";
/**
 * Hook to store a new wallet address for the user
 *
 * Uses hooks:
 * - useMutation
 *
 *
 * This hook saves a wallet address to our backend.
 * Uses React Query's mutation for handling the API call.
 * Default chain is Sonic Blaze but supports other chains too.
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
