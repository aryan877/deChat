import { ethers } from "ethers";
import { DeAgent } from "../../agent/index.js";
import { Cluster } from "../../types/cluster.js";
import { ChainlinkPriceFeedResponse } from "../../types/index.js";
import { CHAINLINK_PRICE_FEED_ABI } from "./chainlinkPriceFeedABI.js";

/**
 * Get price data from a Chainlink price feed
 * @param agent DeAgent instance
 * @param feedAddress Address of the Chainlink price feed contract
 * @param cluster Network cluster (optional, will use agent's network if not provided)
 * @returns Price feed data including latest answer, timestamp, and decimals
 * @throws {Error} If the contract call fails
 */
export async function getChainlinkPriceData(
  agent: DeAgent,
  feedAddress: string,
  cluster?: Cluster
): Promise<ChainlinkPriceFeedResponse> {
  try {
    // Validate the address format
    if (!ethers.utils.isAddress(feedAddress)) {
      throw new Error(`Invalid feed address format: ${feedAddress}`);
    }

    // Use provided cluster, agent's cluster, or default to mainnet
    const networkCluster = cluster || agent.cluster || "sonicMainnet";

    // Check if the contract exists at the address
    const code = await agent.provider.getCode(feedAddress);
    if (code === "0x" || code === "") {
      throw new Error(
        `No contract found at address: ${feedAddress} on network: ${networkCluster}`
      );
    }

    // Create a contract instance for the price feed
    const priceFeed = new ethers.Contract(
      feedAddress,
      CHAINLINK_PRICE_FEED_ABI,
      agent.provider
    );

    // Try multiple approaches to get the data
    let decimals: number;
    let answer: string;
    let timestamp: number;
    let roundId: string = "0";

    // First try the standard approach with latestRoundData
    try {
      // Get the decimals
      if (typeof priceFeed.decimals === "function") {
        decimals = await priceFeed.decimals();
      } else {
        throw new Error("decimals method not found on contract");
      }

      // Get the latest round data
      if (typeof priceFeed.latestRoundData === "function") {
        const roundData = await priceFeed.latestRoundData();
        if (roundData) {
          [roundId, answer, , timestamp] = roundData;
        } else {
          throw new Error("latestRoundData returned null or undefined");
        }
      } else {
        throw new Error("latestRoundData method not found on contract");
      }
    } catch (error: any) {
      console.warn(`Failed with standard approach: ${error.message}`);

      // Fallback to individual calls
      try {
        // Try to get decimals
        try {
          if (typeof priceFeed.decimals === "function") {
            decimals = await priceFeed.decimals();
          } else {
            console.warn("decimals method not found on contract");
            decimals = 8; // Default to 8 decimals as a fallback
          }
        } catch (decimalError) {
          console.warn(`Failed to get decimals: ${decimalError}`);
          decimals = 8; // Default to 8 decimals as a fallback
        }

        // Try to get latest answer directly
        try {
          if (typeof priceFeed.latestAnswer === "function") {
            const latestAnswerResult = await priceFeed.latestAnswer();
            answer = latestAnswerResult.toString();
          } else {
            throw new Error("latestAnswer method not found on contract");
          }
        } catch (answerError: any) {
          throw new Error(`Failed to get latestAnswer: ${answerError.message}`);
        }

        // Try to get latest timestamp directly
        try {
          if (typeof priceFeed.latestTimestamp === "function") {
            const latestTimestampResult = await priceFeed.latestTimestamp();
            timestamp = Number(latestTimestampResult.toString());
          } else {
            console.warn("latestTimestamp method not found on contract");
            timestamp = Math.floor(Date.now() / 1000); // Use current time as fallback
          }
        } catch (timestampError: any) {
          timestamp = Math.floor(Date.now() / 1000); // Use current time as fallback
          console.warn(
            `Failed to get timestamp, using current time: ${timestampError.message}`
          );
        }
      } catch (fallbackError: any) {
        throw new Error(
          `Failed with fallback approach: ${fallbackError.message}`
        );
      }
    }

    return {
      decimals: Number(decimals),
      latestAnswer: answer.toString(),
      latestTimestamp: Number(timestamp),
      latestRound: roundId.toString(),
      network: networkCluster,
    };
  } catch (error: any) {
    throw new Error(
      `Error fetching Chainlink price data on network ${cluster || "default"}: ${error.message}`
    );
  }
}
