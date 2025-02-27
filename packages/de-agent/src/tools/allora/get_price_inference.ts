import {
  AlloraAPIClient,
  PriceInferenceTimeframe,
  PriceInferenceToken,
  AlloraAPIClientConfig,
  ChainSlug,
} from "@alloralabs/allora-sdk";
import { DeAgent } from "src/agent/index.js";

export async function getPriceInference(
  agent: DeAgent,
  tokenSymbol: string,
  timeframe: string
): Promise<string> {
  try {
    const chainSlug =
      process.env.ALLORA_NETWORK === "mainnet"
        ? ChainSlug.MAINNET
        : ChainSlug.TESTNET;
    const apiKey = process.env.ALLORA_API_KEY || "";
    const apiUrl = process.env.ALLORA_API_URL || "";

    const config: AlloraAPIClientConfig = {
      apiKey: apiKey,
      chainSlug: chainSlug,
      baseAPIUrl: apiUrl,
    };
    const client = new AlloraAPIClient(config);
    const inference = await client.getPriceInference(
      tokenSymbol as PriceInferenceToken,
      timeframe as PriceInferenceTimeframe
    );

    return inference.inference_data.network_inference_normalized;
  } catch (error: any) {
    throw new Error(
      `Error fetching price inference from Allora: ${error.message}`
    );
  }
}
