import axios from "axios";
import { DEBRIDGE_API } from "../../constants/index.js";
import {
  deBridgeOrderInput,
  deBridgeOrderResponse,
} from "../../types/index.js";

/**
 * Get a quote for bridging tokens between chains AND build the transaction.
 * This endpoint returns both the quote and transaction data needed for execution.
 *
 * @param params Required parameters for building a bridge transaction
 * @param params.srcChainId Source chain ID (e.g., "1" for Ethereum, "100000014" for Sonic)
 * @param params.srcChainTokenIn Source token address (use "0x0000000000000000000000000000000000000000" for native tokens on EVM chains, "11111111111111111111111111111111" for Solana's native SOL)
 * @param params.srcChainTokenInAmount Amount of source tokens to bridge (in smallest units - e.g., 1.0 token with 18 decimals = 1000000000000000000)
 * @param params.dstChainId Destination chain ID (e.g., "7565164" for Solana, "100000014" for Sonic)
 * @param params.dstChainTokenOut Destination token address (use "0x0000000000000000000000000000000000000000" for native tokens on EVM chains, "11111111111111111111111111111111" for Solana's native SOL)
 * @param params.dstChainTokenOutRecipient Recipient address on destination chain
 * @param params.slippage Optional slippage tolerance in percentage (e.g., 0.5 for 0.5%)
 * @returns Quote information and transaction data
 */
export async function fetchBridgeQuote(
  params: deBridgeOrderInput
): Promise<deBridgeOrderResponse> {
  // Validate required parameters
  if (!params.dstChainTokenOutRecipient) {
    throw new Error(
      "dstChainTokenOutRecipient is required for transaction building"
    );
  }

  // Always set dstChainTokenOutAmount to "auto" to get the best rate
  const dstChainTokenOutAmount = "auto";

  // Always set prependOperatingExpenses to "true" to include all fees
  const prependOperatingExpenses = "true";

  const queryParams = new URLSearchParams({
    srcChainId: params.srcChainId,
    srcChainTokenIn: params.srcChainTokenIn,
    srcChainTokenInAmount: params.srcChainTokenInAmount,
    dstChainId: params.dstChainId,
    dstChainTokenOut: params.dstChainTokenOut,
    dstChainTokenOutAmount: dstChainTokenOutAmount,
    dstChainTokenOutRecipient: params.dstChainTokenOutRecipient,
    prependOperatingExpenses: prependOperatingExpenses,
    additionalTakerRewardBps: (params.additionalTakerRewardBps || 0).toString(),
    ...(params.slippage && { slippage: params.slippage.toString() }),
    ...(params.srcIntermediaryTokenAddress && {
      srcIntermediaryTokenAddress: params.srcIntermediaryTokenAddress,
    }),
    ...(params.dstIntermediaryTokenAddress && {
      dstIntermediaryTokenAddress: params.dstIntermediaryTokenAddress,
    }),
    ...(params.dstIntermediaryTokenSpenderAddress && {
      dstIntermediaryTokenSpenderAddress:
        params.dstIntermediaryTokenSpenderAddress,
    }),
    ...(params.intermediaryTokenUSDPrice && {
      intermediaryTokenUSDPrice: params.intermediaryTokenUSDPrice.toString(),
    }),
    ...(params.srcAllowedCancelBeneficiary && {
      srcAllowedCancelBeneficiary: params.srcAllowedCancelBeneficiary,
    }),
    ...(params.referralCode && {
      referralCode: params.referralCode.toString(),
    }),
    ...(params.affiliateFeePercent && {
      affiliateFeePercent: params.affiliateFeePercent.toString(),
    }),
  });

  try {
    const response = await axios.get(
      `${DEBRIDGE_API}/dln/order/create-tx?${queryParams}`
    );

    const data = response.data;

    if (data.error) {
      throw new Error(`API Error: ${data.error}`);
    }

    return data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.data) {
      const apiError = error.response.data;
      const errorDetails = {
        errorCode: apiError.errorCode,
        errorId: apiError.errorId,
        errorMessage: apiError.errorMessage,
        ...(apiError.reqId && { reqId: apiError.reqId }),
      };

      // Throw a structured error object
      throw {
        code: apiError.errorId || "API_ERROR",
        message: apiError.errorMessage || "Failed to get bridge quote",
        details: errorDetails,
      };
    }
    // Re-throw non-axios errors or generic errors
    throw error;
  }
}
