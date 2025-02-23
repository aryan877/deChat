import { Cluster } from "@repo/de-agent";
import {
  ChainType,
  GetBalanceResponse,
  StoreWalletResponse,
} from "../types/api/wallet";
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

async function getBalance(
  address: string,
  cluster: Cluster = "sonicBlaze"
): Promise<GetBalanceResponse> {
  const { data } = await api.get<GetBalanceResponse>(
    `/api/wallet/balance?address=${address}`,
    {
      headers: {
        "x-solana-cluster": cluster,
      },
    }
  );
  return data;
}

export const walletClient = {
  storeWallet,
  getBalance,
};
