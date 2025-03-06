import { DeAgent } from "../../agent/index.js";
import { Cluster } from "../../types/cluster.js";
import { ethers } from "ethers";
import {
  SonicTradeQuoteRequest,
  SonicTradeQuoteResult,
} from "../../types/sonic.js";

const ODOS_API_URL = "https://api.odos.xyz/sor/quote/v2";

const ERC20_ABI = [
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
];

/**
 * Get token decimals and symbol
 * @param agent DeAgent instance
 * @param tokenAddress Token contract address
 * @returns Token decimals and symbol
 */
async function getTokenInfo(
  agent: DeAgent,
  tokenAddress: string
): Promise<{ address: string; decimals: number; symbol: string }> {
  // Validate the address format
  if (!tokenAddress || !tokenAddress.startsWith("0x")) {
    console.error(`Invalid token address format: ${tokenAddress}`);
    return {
      address: tokenAddress,
      decimals: 18,
      symbol: tokenAddress || "UNKNOWN",
    };
  }

  // Native SONIC token has 18 decimals
  if (tokenAddress === "0x0000000000000000000000000000000000000000") {
    return { address: tokenAddress, decimals: 18, symbol: "SONIC" };
  }

  try {
    // Create a contract instance without using ENS resolution
    const tokenContract = new ethers.Contract(
      tokenAddress,
      ERC20_ABI,
      agent.provider
    );

    // Use try-catch for each call to handle potential contract errors
    let decimals = 18; // Default to 18
    let symbol = "UNKNOWN";

    try {
      if (typeof tokenContract.decimals === "function") {
        const fetchedDecimals = await tokenContract.decimals();
        decimals = Number(fetchedDecimals);
      }
    } catch (decimalError) {
      console.error(
        `Error fetching decimals for ${tokenAddress}:`,
        decimalError
      );
    }

    try {
      if (typeof tokenContract.symbol === "function") {
        const fetchedSymbol = await tokenContract.symbol();
        symbol = fetchedSymbol;
      }
    } catch (symbolError) {
      console.error(`Error fetching symbol for ${tokenAddress}:`, symbolError);
    }

    return { address: tokenAddress, decimals, symbol };
  } catch (error) {
    console.error(`Error getting token info for ${tokenAddress}:`, error);
    return { address: tokenAddress, decimals: 18, symbol: "UNKNOWN" };
  }
}

/**
 * Format amount with proper decimals
 * @param amount Amount as string (in human readable format)
 * @param decimals Token decimals
 * @returns Formatted amount string with proper decimals
 */
function formatAmount(amount: string, decimals: number): string {
  // Convert to BigNumber first to handle scientific notation
  const amountBN = ethers.parseUnits(amount, decimals);
  return amountBN.toString();
}

/**
 * Get a trade quote for swapping tokens
 * @param agent DeAgent instance
 * @param params Trade parameters
 * @param cluster Network cluster
 * @returns Trade quote result
 */
export async function getTradeQuote(
  agent: DeAgent,
  params: {
    inputToken: string;
    inputAmount: string;
    outputToken: string;
    slippageLimitPercent?: number;
  },
  _?: Cluster
): Promise<SonicTradeQuoteResult> {
  try {
    if (!params.inputToken || !params.outputToken || !params.inputAmount) {
      throw new Error(
        "Missing required parameters: inputToken, outputToken, or inputAmount"
      );
    }

    if (!agent.wallet_address) {
      throw new Error("Agent wallet address not available");
    }

    // Get token info for input and output tokens
    const inputTokenInfo = await getTokenInfo(agent, params.inputToken);
    const outputTokenInfo = await getTokenInfo(agent, params.outputToken);

    // Format input amount with proper decimals
    const formattedAmount = formatAmount(
      params.inputAmount,
      inputTokenInfo.decimals
    );

    // Get the chain ID from the provider
    const network = await agent.provider.getNetwork();
    const chainId = Number(network.chainId);

    // Get current gas price from provider
    const feeData = await agent.provider.getFeeData();
    const gasPrice = feeData.gasPrice ? Number(feeData.gasPrice) / 1e9 : 55; // Convert to Gwei, fallback to 55

    // Construct the quote request
    const quoteRequest: SonicTradeQuoteRequest = {
      chainId: chainId,
      inputTokens: [
        {
          tokenAddress: inputTokenInfo.address,
          amount: formattedAmount,
        },
      ],
      outputTokens: [
        {
          tokenAddress: outputTokenInfo.address,
          proportion: 1,
        },
      ],
      userAddr: agent.wallet_address,
      slippageLimitPercent: params.slippageLimitPercent || 1, // Default to 1% slippage
      sourceBlacklist: [],
      simulate: true,
      pathId: true,
      referralCode: 0,
      gasPrice: gasPrice,
    };

    // Make the API request
    const response = await fetch(ODOS_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(quoteRequest),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed: ${errorText}`);
    }

    const data = await response.json();

    // Add token info to the response
    data.inputToken = inputTokenInfo;
    data.outputToken = outputTokenInfo;

    return {
      status: "success",
      message: `Successfully got quote for swapping ${params.inputAmount} ${inputTokenInfo.symbol} to ${outputTokenInfo.symbol}`,
      data,
    };
  } catch (error) {
    console.error("Error getting trade quote:", error);
    return {
      status: "error",
      message: "Failed to get trade quote",
      error: {
        code: "QUOTE_ERROR",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
        details: error,
      },
    };
  }
}
