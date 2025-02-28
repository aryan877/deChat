import { ChainlinkSonicNetwork } from "@repo/de-agent";

// Block explorer base URLs for Sonic networks
export const EXPLORER_URLS = {
  mainnet: "https://sonicscan.org",
  testnet: "https://testnet.sonicscan.org",
} as const;

export type ExplorerType = "transaction" | "address" | "block" | "token";

export const explorerUtils = {
  /**
   * Get the block explorer URL for any Sonic network entity
   * @param identifier Address, transaction hash, or other identifier
   * @param type Type of explorer URL
   * @param network Network (mainnet or testnet)
   * @returns Full block explorer URL
   */
  getExplorerUrl: (
    identifier: string,
    type: ExplorerType = "address",
    network: "mainnet" | "testnet" = "mainnet"
  ): string => {
    const baseUrl = EXPLORER_URLS[network];

    switch (type) {
      case "transaction":
        return `${baseUrl}/tx/${identifier}`;
      case "block":
        return `${baseUrl}/block/${identifier}`;
      case "token":
        return `${baseUrl}/token/${identifier}`;
      case "address":
      default:
        return `${baseUrl}/address/${identifier}`;
    }
  },

  /**
   * Get network name for display
   * @param network Network enum from Chainlink Sonic
   * @returns Human-readable network name
   */
  getNetworkName: (network: ChainlinkSonicNetwork): string => {
    return network === ChainlinkSonicNetwork.MAINNET
      ? "Sonic Mainnet"
      : "Sonic Blaze Testnet";
  },

  /**
   * Format an address for display (shortens it)
   * @param address Full address
   * @param prefixLength Number of characters to show at the beginning
   * @param suffixLength Number of characters to show at the end
   * @returns Shortened address with ellipsis
   */
  formatAddress: (
    address: string,
    prefixLength: number = 6,
    suffixLength: number = 4
  ): string => {
    if (!address || address.length < prefixLength + suffixLength + 3) {
      return address;
    }
    return `${address.substring(0, prefixLength)}...${address.substring(
      address.length - suffixLength
    )}`;
  },
};
