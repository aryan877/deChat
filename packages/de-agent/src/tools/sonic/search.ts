import { DeAgent } from "../../agent/index.js";
import { SonicSearchResponse } from "../../types/sonic.js";

const SONIC_SEARCH_URL = "https://sonicscan.org/searchHandler";

/**
 * Search for tokens, addresses, or other entities on Sonic scan
 * @param agent DeAgent instance
 * @param term Search term to look for
 * @returns Search results from Sonic scan
 */
export async function searchSonic(
  agent: DeAgent,
  term: string
): Promise<SonicSearchResponse> {
  try {
    if (!term) {
      throw new Error("Search term is required");
    }

    // Construct the search URL with parameters
    const url = new URL(SONIC_SEARCH_URL);
    url.searchParams.append("term", term);
    url.searchParams.append("filterby", "0"); // Default filter for mainnet

    // Make the API call
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const searchResults = await response.json();

    return {
      status: "success",
      message: "Successfully retrieved search results",
      data: searchResults,
    };
  } catch (error) {
    return {
      status: "error",
      message: "Failed to search Sonic scan",
      error: {
        code: "SEARCH_ERROR",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
        details: error,
      },
    };
  }
}
