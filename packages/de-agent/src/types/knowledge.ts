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

/**
 * Sonic docs search result interface
 */
export interface SonicDocsResult {
  id: string;
  title: string;
  url: string;
  content: string;
  similarity?: number;
}

/**
 * Sonic docs search response interface
 */
export interface SonicDocsSearchResponse {
  success: boolean;
  count: number;
  data: SonicDocsResult[];
  answer?: string;
  sources?: Array<{
    title: string;
    url: string;
  }>;
}
