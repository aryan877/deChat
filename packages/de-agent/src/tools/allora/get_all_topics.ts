import {
  AlloraAPIClient,
  AlloraAPIClientConfig,
  AlloraTopic,
  ChainSlug,
} from "@alloralabs/allora-sdk";

export async function getAllTopics(): Promise<AlloraTopic[]> {
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

    const topics = await client.getAllTopics();

    return topics;
  } catch (error: any) {
    throw new Error(`Error fetching topics from Allora: ${error.message}`);
  }
}
