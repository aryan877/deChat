/**
 * Token data interface
 */
export interface ShadowToken {
  name: string;
  address: string;
  symbol: string;
  decimals: number;
  logo?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Token search response interface
 */
export interface ShadowTokenSearchResponse {
  success: boolean;
  count: number;
  data: ShadowToken[];
}
