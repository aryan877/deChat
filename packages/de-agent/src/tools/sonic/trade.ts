import { ethers } from "ethers";
import { DeAgent } from "../../agent/index.js";
import { Cluster } from "../../types/cluster.js";
import {
  SonicTradeQuoteRequest,
  SonicTradeQuoteResult,
} from "../../types/sonic.js";
import { searchSonic } from "./search.js";

const ODOS_API_URL = "https://api.odos.xyz/sor/quote/v2";

const ERC20_ABI = [
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
];

/**
 * Get token decimals and symbol
 * @param agent DeAgent instance
 * @param tokenInput Token address or symbol
 * @returns Token decimals and symbol
 */
async function getTokenInfo(
  agent: DeAgent,
  tokenInput: string
): Promise<{ address: string; decimals: number; symbol: string }> {
  // If input is already an address (starts with 0x), use it directly
  if (tokenInput.startsWith("0x")) {
    // Native SONIC token has 18 decimals
    if (tokenInput === "0x0000000000000000000000000000000000000000") {
      return { address: tokenInput, decimals: 18, symbol: "SONIC" };
    }

    // For other addresses, try to get info from the contract
    try {
      const tokenContract = new ethers.Contract(
        tokenInput,
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
          `Error fetching decimals for ${tokenInput}:`,
          decimalError
        );
      }

      try {
        if (typeof tokenContract.symbol === "function") {
          const fetchedSymbol = await tokenContract.symbol();
          symbol = fetchedSymbol;
        }
      } catch (symbolError) {
        console.error(`Error fetching symbol for ${tokenInput}:`, symbolError);
      }

      return { address: tokenInput, decimals, symbol };
    } catch (error) {
      console.error(
        `Error getting token info for address ${tokenInput}:`,
        error
      );
      return { address: tokenInput, decimals: 18, symbol: "UNKNOWN" };
    }
  }

  // If input is a symbol (not an address), try to search for it
  else {
    // Try to search for the token
    try {
      const searchResponse = await searchSonic(agent, tokenInput);

      if (searchResponse.data && searchResponse.data.length > 0) {
        // Find the most relevant result
        const lowerInput = tokenInput.toLowerCase();
        const token = searchResponse.data.find(
          (result) =>
            result.title.toLowerCase() === lowerInput ||
            result.title.toLowerCase().includes(lowerInput)
        );

        if (token) {
          return {
            address: token.address,
            decimals: 18, // Default, will be updated if possible
            symbol: token.title,
          };
        }
      }

      // Last resort: return a placeholder
      return {
        address: "0x0000000000000000000000000000000000000000", // Default to SONIC
        decimals: 18,
        symbol: tokenInput.toUpperCase(),
      };
    } catch (error) {
      console.error(`Error searching for token ${tokenInput}:`, error);
      // Last resort: return a placeholder
      return {
        address: "0x0000000000000000000000000000000000000000", // Default to SONIC
        decimals: 18,
        symbol: tokenInput.toUpperCase(),
      };
    }
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
  const amountBN = ethers.utils.parseUnits(amount, decimals);
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
      slippageLimitPercent: params.slippageLimitPercent || 10, // Default to 10% slippage
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
