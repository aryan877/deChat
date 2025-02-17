export interface Wallet {
  address: string;
  chainType: "ethereum";
  isActive: boolean;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
}
