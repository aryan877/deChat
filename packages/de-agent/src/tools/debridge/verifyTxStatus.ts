import { DeAgent } from "../../agent/index.js";
import axios from "axios";
import { DEBRIDGE_API } from "../../constants/index.js";
import {
  deBridgeOrderIdsResponse,
  deBridgeOrderStatusResponse,
} from "../../types/index.js";

/**
 * Verify the status of a bridge transaction using its transaction hash
 * @param agent DeAgent instance
 * @param txHash Transaction hash to check status for
 * @returns Status information for the bridge transaction
 * @throws {Error} If the API request fails or returns an error
 */
export async function verifyTxStatus(
  agent: DeAgent,
  txHash: string
): Promise<deBridgeOrderStatusResponse[]> {
  try {
    const orderIdsUrl = `${DEBRIDGE_API}/dln/tx/${txHash}/order-ids`;
    const orderIdsResponse = await axios.get(orderIdsUrl);
    const responseData = orderIdsResponse.data;

    const orderIdsData = responseData as deBridgeOrderIdsResponse;
    if (!orderIdsData.orderIds || orderIdsData.orderIds.length === 0) {
      throw new Error("No bridge orders found for this transaction");
    }

    // Then get the status for each order
    const statuses = await Promise.all(
      orderIdsData.orderIds.map(async (orderId) => {
        const statusUrl = `${DEBRIDGE_API}/dln/order/${orderId}/status`;
        const statusResponse = await axios.get(statusUrl);
        const statusData = statusResponse.data;

        // Add the deBridge app link
        statusData.orderLink = `https://app.debridge.finance/order?orderId=${orderId}`;
        return statusData;
      })
    );

    return statuses;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (
        error.response?.status === 400 &&
        error.response?.data?.errorCode === 2
      ) {
        throw new Error("Invalid transaction hash format");
      } else {
        throw new Error(error.response?.data?.errorMessage || "Unknown error");
      }
    }
    throw error;
  }
}
