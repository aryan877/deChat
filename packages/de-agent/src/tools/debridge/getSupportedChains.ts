import { DEBRIDGE_API } from "../../constants/index.js";
import axios from "axios";
import { deBridgeSupportedChainsResponse } from "../../types/index.js";

/**
 * Get list of chains supported by deBridge protocol
 * @returns List of supported chains with their configurations
 * @throws {Error} If the API request fails or returns an error
 */
export async function getDebridgeSupportedChains(): Promise<deBridgeSupportedChainsResponse> {
  try {
    const response = await axios.get(`${DEBRIDGE_API}/supported-chains-info`);
    const data = response.data;

    if ("error" in data) {
      throw new Error(`API Error: ${data.error}`);
    }

    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Failed to fetch supported chains: ${error.message}`);
    }
    throw error;
  }
}
