import { ethers } from "ethers";
import { DeAgent } from "../../agent/index.js";
import { Cluster } from "../../types/cluster.js";
import {
  SonicTradeQuoteRequest,
  SonicTradeQuoteResult,
} from "../../types/sonic.js";
import { searchSonic } from "./search.js";

const ODOS_API_URL = "https://api.odos.xyz/sor/quote/v2";
const MAGPIE_QUOTE_API_URL = "https://api.magpiefi.xyz/aggregator/quote";

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
 * Get a trade quote from ODOS
 * @param agent DeAgent instance
 * @param inputTokenInfo Input token info
 * @param outputTokenInfo Output token info
 * @param formattedAmount Formatted input amount
 * @param slippageLimitPercent Slippage limit as percentage
 * @returns ODOS quote result
 */
async function getOdosQuote(
  agent: DeAgent,
  inputTokenInfo: { address: string; decimals: number; symbol: string },
  outputTokenInfo: { address: string; decimals: number; symbol: string },
  formattedAmount: string,
  slippageLimitPercent: number = 0.5
): Promise<{
  success: boolean;
  data?: any;
  error?: string;
  provider: "odos";
  outputAmount?: string;
}> {
  try {
    if (!agent.wallet_address) {
      throw new Error("Agent wallet address not available");
    }

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
      slippageLimitPercent,
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
      throw new Error(`ODOS API request failed: ${errorText}`);
    }

    const data = await response.json();

    // Add token info to the response
    data.inputToken = inputTokenInfo;
    data.outputToken = outputTokenInfo;
    data.provider = "odos";

    return {
      success: true,
      data,
      provider: "odos",
      outputAmount: data.outAmounts?.[0] || "0",
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown ODOS error",
      provider: "odos",
    };
  }
}

/**
 * Get a trade quote from Magpie
 * @param agent DeAgent instance
 * @param inputTokenInfo Input token info
 * @param outputTokenInfo Output token info
 * @param formattedAmount Formatted input amount
 * @param slippageLimitPercent Slippage limit as percentage
 * @returns Magpie quote result
 */
async function getMagpieQuote(
  agent: DeAgent,
  inputTokenInfo: { address: string; decimals: number; symbol: string },
  outputTokenInfo: { address: string; decimals: number; symbol: string },
  formattedAmount: string,
  slippageLimitPercent: number = 0.5
): Promise<{
  success: boolean;
  data?: any;
  error?: string;
  provider: "magpie";
  outputAmount?: string;
}> {
  try {
    if (!agent.wallet_address) {
      throw new Error("Agent wallet address not available");
    }

    // Format slippage from percentage to decimal (0.5% -> 0.005)
    const slippageDecimal = slippageLimitPercent / 100;

    // Construct Magpie quote URL with params
    const url = new URL(MAGPIE_QUOTE_API_URL);
    url.searchParams.append("network", "sonic");
    url.searchParams.append("fromTokenAddress", inputTokenInfo.address);
    url.searchParams.append("toTokenAddress", outputTokenInfo.address);
    url.searchParams.append("fromAddress", agent.wallet_address);
    url.searchParams.append("toAddress", agent.wallet_address);
    url.searchParams.append("sellAmount", formattedAmount);
    url.searchParams.append("slippage", slippageDecimal.toString());
    url.searchParams.append("gasless", "false");

    // Make the API request
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Magpie API request failed: ${errorText}`);
    }

    const magpieData = await response.json();

    // Format Magpie data to match our expected format
    const formattedData = {
      traceId: magpieData.id,
      inTokens: [inputTokenInfo.address],
      outTokens: [outputTokenInfo.address],
      inAmounts: [formattedAmount],
      outAmounts: [magpieData.amountOut],
      gasEstimate: Number(magpieData.resourceEstimate?.gasLimit || 0),
      priceImpact: 0, // Magpie doesn't provide price impact
      pathId: magpieData.id,
      inputToken: inputTokenInfo,
      outputToken: outputTokenInfo,
      provider: "magpie",
      targetAddress: magpieData.targetAddress,
      typedData: magpieData.typedData,
      // Add original Magpie response for reference
      _magpieOriginalResponse: magpieData,
    };

    return {
      success: true,
      data: formattedData,
      provider: "magpie",
      outputAmount: magpieData.amountOut || "0",
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown Magpie error",
      provider: "magpie",
    };
  }
}

/**
 * Get a trade quote from the best available provider
 * @param agent DeAgent instance
 * @param params Trade parameters
 * @param cluster Network cluster
 * @returns Trade quote result with the best rate
 */
export async function getTradeQuote(
  agent: DeAgent,
  params: {
    inputToken: string;
    inputAmount: string;
    outputToken: string;
    slippageLimitPercent?: number;
    preferredProvider?: "odos" | "magpie" | "best";
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

    // Set preferred provider or default to "best"
    const preferredProvider = params.preferredProvider || "best";

    // Get quotes from both providers
    let odosQuote;
    let magpieQuote;

    // If preferred provider is specified and not "best", only get quote from that provider
    if (preferredProvider === "odos") {
      odosQuote = await getOdosQuote(
        agent,
        inputTokenInfo,
        outputTokenInfo,
        formattedAmount,
        params.slippageLimitPercent
      );
    } else if (preferredProvider === "magpie") {
      magpieQuote = await getMagpieQuote(
        agent,
        inputTokenInfo,
        outputTokenInfo,
        formattedAmount,
        params.slippageLimitPercent
      );
    } else {
      // Get quotes from both providers in parallel
      [odosQuote, magpieQuote] = await Promise.all([
        getOdosQuote(
          agent,
          inputTokenInfo,
          outputTokenInfo,
          formattedAmount,
          params.slippageLimitPercent
        ),
        getMagpieQuote(
          agent,
          inputTokenInfo,
          outputTokenInfo,
          formattedAmount,
          params.slippageLimitPercent
        ),
      ]);
    }

    // Determine which provider gives the better rate
    let bestQuote;
    let secondaryQuote;

    if (preferredProvider === "odos") {
      bestQuote = odosQuote;
    } else if (preferredProvider === "magpie") {
      bestQuote = magpieQuote;
    } else {
      // Compare output amounts if both quotes are successful
      if (odosQuote?.success && magpieQuote?.success) {
        const odosAmount = BigInt(odosQuote.outputAmount || "0");
        const magpieAmount = BigInt(magpieQuote.outputAmount || "0");

        if (odosAmount > magpieAmount) {
          bestQuote = odosQuote;
          secondaryQuote = magpieQuote;
        } else {
          bestQuote = magpieQuote;
          secondaryQuote = odosQuote;
        }
      } else if (odosQuote?.success) {
        bestQuote = odosQuote;
      } else if (magpieQuote?.success) {
        bestQuote = magpieQuote;
      } else {
        // Both failed
        throw new Error(
          `Failed to get quotes from both providers. ODOS error: ${odosQuote?.error}. Magpie error: ${magpieQuote?.error}`
        );
      }
    }

    if (!bestQuote?.success) {
      throw new Error(
        `Failed to get quote from ${bestQuote?.provider}: ${bestQuote?.error}`
      );
    }

    // If we have quotes from both providers, add rate comparison
    if (secondaryQuote?.success) {
      const bestAmount = BigInt(bestQuote.outputAmount || "0");
      const secondaryAmount = BigInt(secondaryQuote.outputAmount || "0");

      // Calculate percentage difference
      if (secondaryAmount > 0) {
        const difference =
          ((bestAmount - secondaryAmount) * 10000n) / secondaryAmount;
        bestQuote.data.rateComparison = {
          bestProvider: bestQuote.provider,
          percentageDifference: Number(difference) / 100, // Convert basis points to percentage
          secondaryProvider: secondaryQuote.provider,
        };
      }
    }

    return {
      status: "success",
      message: `Successfully got quote from ${bestQuote.provider} for swapping ${params.inputAmount} ${inputTokenInfo.symbol} to ${outputTokenInfo.symbol}`,
      data: bestQuote.data,
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
