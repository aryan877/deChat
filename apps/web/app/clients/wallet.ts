import { ChainType, StoreWalletResponse } from "../types/api/wallet";
import api from "@/lib/axios";

async function storeWallet(
  address: string,
  chainType: ChainType
): Promise<StoreWalletResponse> {
  const { data } = await api.post<StoreWalletResponse>("/api/wallet/store", {
    address,
    chainType,
  });
  return data;
}

export const walletClient = {
  storeWallet,
};
