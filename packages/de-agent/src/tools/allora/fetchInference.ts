import { AlloraAPIClient } from "@alloralabs/allora-sdk";
import {
  ChainSlug,
  GetInferenceByTopicIDParams,
  SignatureFormat,
} from "../../types/allora.js";

/**
 * Fetches inference data for a specific topic from the Allora API
 * @param params - Parameters for fetching inference data
 * @returns Promise resolving to inference data
 */
export async function fetchInference(params: GetInferenceByTopicIDParams) {
  try {
    const {
      topicId,
      signatureFormat = SignatureFormat.ETHEREUM_SEPOLIA,
      network = ChainSlug.TESTNET,
    } = params;

    // Create Allora client
    const client = new AlloraAPIClient({
      chainSlug: network,
      apiKey: process.env.ALLORA_API_KEY || "UP-d33e797de5134909854be2b7",
      baseAPIUrl: process.env.ALLORA_API_URL || "",
    });

    // Fetch inference data
    const inference = await client.getInferenceByTopicID(
      topicId,
      signatureFormat
    );

    return inference;
  } catch (error: any) {
    console.error(
      `Error fetching inference for topic ${params.topicId}: ${error.message}`
    );
    throw error;
  }
}
