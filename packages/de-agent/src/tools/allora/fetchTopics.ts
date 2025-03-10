import { AlloraAPIClient } from "@alloralabs/allora-sdk";
import { ChainSlug, GetAllTopicsParams } from "../../types/allora.js";

/**
 * Fetches all topics from the Allora API
 * @param params - Parameters for fetching topics
 * @returns Promise resolving to an array of Allora topics
 */
export async function fetchTopics(params: GetAllTopicsParams) {
  try {
    const { network = ChainSlug.TESTNET } = params;

    // Create Allora client
    const client = new AlloraAPIClient({
      chainSlug: network,
      apiKey: process.env.ALLORA_API_KEY || "UP-d33e797de5134909854be2b7",
      baseAPIUrl: process.env.ALLORA_API_URL || "",
    });

    // Fetch topics
    const topics = await client.getAllTopics();
    return topics;
  } catch (error: any) {
    console.error(`Error fetching topics from Allora: ${error.message}`);
    throw error;
  }
}
