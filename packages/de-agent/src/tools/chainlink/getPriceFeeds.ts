import { DeAgent } from "../../agent/index.js";
import {
  CHAINLINK_SONIC_MAINNET_FEEDS,
  CHAINLINK_SONIC_BLAZE_TESTNET_FEEDS,
} from "../../constants/index.js";
import {
  ChainlinkPriceFeedInfo,
  ChainlinkSonicNetwork,
} from "../../types/index.js";

/**
 * Get Chainlink price feeds for a specific network
 * @param agent DeAgent instance
 * @param network Network to get price feeds for (mainnet or testnet)
 * @param pair Optional trading pair to filter results
 * @returns Array of price feed information
 */
export async function getChainlinkPriceFeeds(
  agent: DeAgent,
  network: ChainlinkSonicNetwork,
  pair?: string
): Promise<ChainlinkPriceFeedInfo[]> {
  try {
    // Select the appropriate feed data based on the network
    const feedData =
      network === ChainlinkSonicNetwork.MAINNET
        ? CHAINLINK_SONIC_MAINNET_FEEDS
        : CHAINLINK_SONIC_BLAZE_TESTNET_FEEDS;

    // Convert the feed data to an array of ChainlinkPriceFeedInfo objects
    const feeds = Object.entries(feedData).map(([feedPair, address]) => {
      // Basic feed info
      const feedInfo: ChainlinkPriceFeedInfo = {
        pair: feedPair,
        address,
        network,
        status: "active",
      };

      // Add additional metadata for known feeds
      if (feedPair === "BTC/USD") {
        feedInfo.assetName = "Bitcoin";
        feedInfo.assetType = "Crypto";
        feedInfo.marketHours = "Crypto";
      } else if (feedPair === "ETH/USD") {
        feedInfo.assetName = "Ethereum";
        feedInfo.assetType = "Crypto";
        feedInfo.marketHours = "Crypto";
      } else if (feedPair === "LINK/USD") {
        feedInfo.assetName = "Chainlink";
        feedInfo.assetType = "Crypto";
        feedInfo.marketHours = "Crypto";
      } else if (feedPair === "USDC/USD") {
        feedInfo.assetName = "Circle USD";
        feedInfo.assetType = "Crypto";
        feedInfo.marketHours = "Crypto";
      } else if (feedPair === "DAI/USD") {
        feedInfo.assetName = "DAI";
        feedInfo.assetType = "Crypto";
        feedInfo.marketHours = "Crypto";
      }

      return feedInfo;
    });

    // Filter by pair if provided
    if (pair) {
      const normalizedPair = pair.toUpperCase().replace("/", "/");
      return feeds.filter((feed) =>
        feed.pair.toUpperCase().includes(normalizedPair)
      );
    }

    return feeds;
  } catch (error: any) {
    throw new Error(`Error fetching Chainlink price feeds: ${error.message}`);
  }
}
