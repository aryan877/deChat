import { DEBRIDGE_API } from "../../constants/index.js";
import axios from "axios";
import {
  deBridgeTokensInfoResponse,
  GetDebridgeTokensInfoParams,
} from "../../types/index.js";

/**
 * Get token information from a chain. Chain ID must be specified (e.g., '1' for Ethereum, '56' for BSC, '137' for Polygon, '100000014' for Sonic).
 * Sonic uses chain ID '100000014' in the deBridge protocol.
 * For EVM chains: use 0x-prefixed address. For Solana: use base58 token address.
 * Default chainId is "100000014" which is used by Sonic.
 * Returns up to 3 exact matching tokens by symbol.
 *
 * @param params - Parameters for getting token info
 * @param params.chainId - Chain ID to get token information for (e.g., '1' for Ethereum, '56' for BSC). Defaults to "100000014" (Sonic's chain)
 * @param params.tokenAddress - Optional specific token address to query information for
 * @param params.search - Optional search term to filter tokens by exact symbol match
 * @returns Token information including name, symbol, and decimals (up to 3 matches)
 * @throws {Error} If the API request fails or returns an error
 *
 * @example
 * ```typescript
 * // Get USDC on Ethereum
 * const ethUSDC = await getDebridgeTokensInfo({
 *   chainId: "1",
 *   search: "USDC"
 * });
 *
 * // Get USDC on Sonic (using default chainId)
 * const sonicUSDC = await getDebridgeTokensInfo({
 *   search: "USDC"
 * });
 * ```
 */
export async function fetchTokenData(
  parameters: GetDebridgeTokensInfoParams
): Promise<deBridgeTokensInfoResponse> {
  // Use "100000014" as the default chainId (Sonic's chain ID)
  const chainId = parameters.chainId || "100000014";
  const url = `${DEBRIDGE_API}/token-list?chainId=${chainId}`;

  try {
    const response = await axios.get(url);
    const data = response.data.tokens;

    // Define token data type
    type TokenData = {
      name: string;
      symbol: string;
      decimals: number;
    };

    // If a specific token address is provided, return just that token's info
    if (parameters.tokenAddress) {
      const tokenInfo = data[parameters.tokenAddress];
      if (!tokenInfo) {
        throw new Error(
          `Token ${parameters.tokenAddress} not found on chain ${chainId}`
        );
      }

      return {
        tokens: {
          [parameters.tokenAddress]: {
            name: tokenInfo.name,
            symbol: tokenInfo.symbol,
            address: parameters.tokenAddress,
            decimals: tokenInfo.decimals,
          },
        },
      };
    }
    // Filter tokens by exact symbol match and limit to top 3
    const searchTerm = parameters.search?.toUpperCase() || "";
    const tokens = Object.entries(data as Record<string, TokenData>)
      .filter(([, token]) => {
        if (!searchTerm) {
          return true;
        }
        // Exact match first, then starts with, then includes
        const tokenSymbol = token.symbol.toUpperCase();
        if (tokenSymbol === searchTerm) {
          return true;
        }
        if (tokenSymbol.startsWith(searchTerm)) {
          return true;
        }
        return tokenSymbol.includes(searchTerm);
      })
      .sort(([, a], [, b]) => {
        if (!searchTerm) {
          return 0;
        }
        const aSymbol = a.symbol.toUpperCase();
        const bSymbol = b.symbol.toUpperCase();
        // Sort exact matches first, then starts with, then includes
        if (aSymbol === searchTerm && bSymbol !== searchTerm) {
          return -1;
        }
        if (bSymbol === searchTerm && aSymbol !== searchTerm) {
          return 1;
        }
        if (aSymbol.startsWith(searchTerm) && !bSymbol.startsWith(searchTerm)) {
          return -1;
        }
        if (bSymbol.startsWith(searchTerm) && !aSymbol.startsWith(searchTerm)) {
          return 1;
        }
        return 0;
      })
      .slice(0, 3) // Limit to top 3 matches
      .reduce(
        (acc, [address, token]) => {
          acc[address] = {
            name: token.name,
            symbol: token.symbol,
            address: address,
            decimals: token.decimals,
          };
          return acc;
        },
        {} as Record<
          string,
          {
            name: string;
            symbol: string;
            address: string;
            decimals: number;
          }
        >
      );

    return { tokens };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        `HTTP error! status: ${error.response?.status}, body: ${JSON.stringify(error.response?.data)}`
      );
    }
    throw error;
  }
}
