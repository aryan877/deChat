import {
  AlloraAPIClient,
  AlloraAPIClientConfig,
  AlloraInference,
  ChainSlug,
} from "@alloralabs/allora-sdk";
import { DeAgent } from "src/agent/index.js";

export async function getInferenceByTopicId(
  agent: DeAgent,
  topicId: number
): Promise<AlloraInference> {
  try {
    const chainSlug =
      process.env.ALLORA_NETWORK === "mainnet"
        ? ChainSlug.MAINNET
        : ChainSlug.TESTNET;
    const apiKey = process.env.ALLORA_API_KEY || "UP-d33e797de5134909854be2b7";
    const apiUrl = process.env.ALLORA_API_URL || "";

    const config: AlloraAPIClientConfig = {
      apiKey: apiKey,
      chainSlug: chainSlug,
      baseAPIUrl: apiUrl,
    };
    const client = new AlloraAPIClient(config);
    const inference = await client.getInferenceByTopicID(topicId);

    return inference;
  } catch (error: any) {
    throw new Error(`Error fetching inference from Allora: ${error.message}`);
  }
}
