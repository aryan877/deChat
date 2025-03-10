import { AlloraAPIClient } from "@alloralabs/allora-sdk";
import {
  ChainSlug,
  GetPriceInferenceParams,
  SignatureFormat,
} from "../../types/allora.js";

/**
 * Fetches price inference data for a specific asset and timeframe from the Allora API
 * @param params - Parameters for fetching price inference data
 * @returns Promise resolving to price inference data
 */
export async function fetchPriceInference(params: GetPriceInferenceParams) {
  try {
    const {
      asset,
      timeframe,
      signatureFormat = SignatureFormat.ETHEREUM_SEPOLIA,
      network = ChainSlug.TESTNET,
    } = params;

    // Create Allora client
    const client = new AlloraAPIClient({
      chainSlug: network,
      apiKey: process.env.ALLORA_API_KEY,
      baseAPIUrl: process.env.ALLORA_API_URL || "",
    });

    // Fetch price inference data
    const inference = await client.getPriceInference(
      asset,
      timeframe,
      signatureFormat
    );

    return inference;
  } catch (error: any) {
    console.error(
      `Error fetching price inference for ${params.asset} (${params.timeframe}): ${error.message}`
    );
    throw error;
  }
}
