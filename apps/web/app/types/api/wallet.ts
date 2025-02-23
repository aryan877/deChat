export type ChainType = "ethereum";

export type StoreWalletResponse = {
  address: string;
  chainType: ChainType;
};

export type GetBalanceResponse = {
  balance: string;
  formatted: string;
};
