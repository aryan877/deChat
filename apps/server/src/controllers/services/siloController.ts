import { Cluster } from "@repo/de-agent";
import axios from "axios";
import { ethers } from "ethers";
import { Response } from "express";
import { AuthenticatedRequest } from "../../middleware/auth/index.js";
import { APIError, ErrorCode } from "../../middleware/errors/types.js";
import { generateDeChatAgent } from "../../utils/generateDeChatAgent.js";

// Constants for Silo contracts
const SILO_ROUTER_ADDRESS = "0x22AacdEc57b13911dE9f188CF69633cC537BdB76";
const WRAPPED_SONIC_ADDRESS = "0x039e2fB66102314Ce7b64Ce5Ce3E5183bc94aD38";

// ABI snippets for the contracts we'll interact with
const ERC20_ABI = [
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
];

// Complete Silo Router ABI
const SILO_ROUTER_ABI = [
  {
    inputs: [
      { internalType: "address", name: "_wrappedNativeToken", type: "address" },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [{ internalType: "address", name: "target", type: "address" }],
    name: "AddressEmptyCode",
    type: "error",
  },
  { inputs: [], name: "ApprovalFailed", type: "error" },
  { inputs: [], name: "ERC20TransferFailed", type: "error" },
  { inputs: [], name: "EthTransferFailed", type: "error" },
  { inputs: [], name: "FailedCall", type: "error" },
  {
    inputs: [
      { internalType: "uint256", name: "balance", type: "uint256" },
      { internalType: "uint256", name: "needed", type: "uint256" },
    ],
    name: "InsufficientBalance",
    type: "error",
  },
  { inputs: [], name: "InvalidSilo", type: "error" },
  {
    inputs: [{ internalType: "address", name: "token", type: "address" }],
    name: "SafeERC20FailedOperation",
    type: "error",
  },
  { inputs: [], name: "TokenIsNotAContract", type: "error" },
  {
    inputs: [],
    name: "WRAPPED_NATIVE_TOKEN",
    outputs: [
      {
        internalType: "contract IWrappedNativeToken",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "enum SiloRouter.ActionType",
            name: "actionType",
            type: "uint8",
          },
          { internalType: "contract ISilo", name: "silo", type: "address" },
          { internalType: "contract IERC20", name: "asset", type: "address" },
          { internalType: "bytes", name: "options", type: "bytes" },
        ],
        internalType: "struct SiloRouter.Action[]",
        name: "_actions",
        type: "tuple[]",
      },
    ],
    name: "execute",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  { stateMutability: "payable", type: "receive" },
];

/**
 * Fetches market data from Silo Finance API
 */
export const getSiloMarkets = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    // Set payload to get data from the specified chain
    const chainKey = (req.query.chainKey as string) || "sonic";

    const payload = {
      sort: {
        field: "tvl",
        direction: "desc",
      },
      chainKey,
      search: req.query.search || "",
      isCurated: false,
      excludeEmpty: req.query.excludeEmpty === "true",
    };

    const response = await axios.post(
      "https://app.silo.finance/api/display-markets-v2",
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Origin: "https://app.silo.finance",
          "User-Agent": "SiloFinance-API-Client/1.0",
        },
        timeout: 10000, // 10 second timeout
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error fetching Silo Finance data:", error);
    throw new APIError(
      500,
      ErrorCode.INTERNAL_SERVER_ERROR,
      "Failed to fetch data from Silo Finance API",
      error instanceof Error ? error.message : undefined
    );
  }
};

/**
 * Fetches specific lending market data from Silo Finance API
 */
export const getSiloMarket = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const chainKey = (req.params.chainKey as string) || "sonic";
    const marketId = req.params.marketId;

    const url = `https://v2.silo.finance/api/lending-market-v2/${chainKey}/${marketId}`;

    const response = await axios.get(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "SiloFinance-API-Client/1.0",
      },
      timeout: 10000,
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching Silo Finance market data:", error);
    throw new APIError(
      500,
      ErrorCode.INTERNAL_SERVER_ERROR,
      "Failed to fetch market data from Silo Finance API",
      error instanceof Error ? error.message : undefined
    );
  }
};

/**
 * Fetches specific lending market data with user info from Silo Finance API
 */
export const getSiloMarketForUser = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const chainKey = (req.params.chainKey as string) || "sonic";
    const marketId = req.params.marketId;
    const userAddress = req.query.userAddress as string;

    if (!userAddress) {
      throw new APIError(
        400,
        ErrorCode.BAD_REQUEST,
        "User address is required"
      );
    }

    const url = `https://v2.silo.finance/api/lending-market-v2/${chainKey}/${marketId}?user=${userAddress}`;

    const response = await axios.get(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "SiloFinance-API-Client/1.0",
      },
      timeout: 10000,
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching Silo Finance market data for user:", error);
    throw new APIError(
      500,
      ErrorCode.INTERNAL_SERVER_ERROR,
      "Failed to fetch market data from Silo Finance API",
      error instanceof Error ? error.message : undefined
    );
  }
};

/**
 * Gets TVL from Silo Finance
 */
export const getSiloStats = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    // Use the metrics endpoint which returns TVL data
    const response = await axios.get("https://app.silo.finance/api/metrics", {
      headers: {
        Accept: "application/json",
        Origin: "https://app.silo.finance",
        "User-Agent": "SiloFinance-API-Client/1.0",
      },
      timeout: 5000,
    });

    // Return raw TVL value
    return {
      tvlUsd: response.data.tvlUsd,
    };
  } catch (error) {
    console.error("Error fetching Silo Finance metrics:", error);
    throw new APIError(
      500,
      ErrorCode.INTERNAL_SERVER_ERROR,
      "Failed to fetch metrics from Silo Finance API",
      error instanceof Error ? error.message : undefined
    );
  }
};

/**
 * Executes a deposit transaction for Silo Finance
 */
export const executeSiloDeposit = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const {
      siloAddress,
      tokenAddress,
      amount,
      assetType = 1, // Default to collateral
      isNative = false,
      userAddress,
    } = req.body;

    // Validate required fields
    if (!siloAddress || !tokenAddress || !amount || !userAddress) {
      throw new APIError(
        400,
        ErrorCode.BAD_REQUEST,
        "Missing required parameters"
      );
    }

    // Generate DeAgent for the user
    const agent = generateDeChatAgent({
      address: userAddress,
      cluster: "sonicMainnet" as Cluster,
    });

    // Determine actual token address to use in the action
    const assetAddress = isNative ? WRAPPED_SONIC_ADDRESS : tokenAddress;

    // Encode deposit options (amount and asset type)
    const options = ethers.AbiCoder.defaultAbiCoder().encode(
      ["uint256", "uint8"],
      [amount, assetType]
    );

    // Create the action object for the router
    const action = {
      actionType: 0, // 0 = Deposit
      silo: siloAddress,
      asset: assetAddress,
      options: options,
    };

    // For non-native tokens, check and execute approval if needed
    let approvalTxHash = null;

    if (!isNative) {
      // Create ERC20 interface for contract calls
      const erc20Interface = new ethers.Interface(ERC20_ABI);

      try {
        // Check current allowance
        const allowanceData = erc20Interface.encodeFunctionData("allowance", [
          userAddress,
          SILO_ROUTER_ADDRESS,
        ]);

        const allowanceResult = await agent.provider.call({
          to: tokenAddress,
          data: allowanceData,
        });

        const currentAllowance = ethers.AbiCoder.defaultAbiCoder().decode(
          ["uint256"],
          allowanceResult
        )[0];

        const amountBigInt = BigInt(amount);

        // If allowance is insufficient, approve tokens first and wait for confirmation
        if (currentAllowance < amountBigInt) {
          // Use exact amount instead of MaxUint256 to avoid potential issues
          const approvalTx = {
            to: tokenAddress,
            data: erc20Interface.encodeFunctionData("approve", [
              SILO_ROUTER_ADDRESS,
              amount,
            ]),
          };

          // Send approval transaction and wait for confirmations
          approvalTxHash = await agent.sendTransaction(approvalTx, {
            confirmations: 1,
          });

          // Verify allowance after approval
          const verifyAllowanceResult = await agent.provider.call({
            to: tokenAddress,
            data: allowanceData,
          });

          const newAllowance = ethers.AbiCoder.defaultAbiCoder().decode(
            ["uint256"],
            verifyAllowanceResult
          )[0];

          if (newAllowance < amountBigInt) {
            throw new Error(
              `Approval failed: allowance (${newAllowance}) is still less than required amount (${amountBigInt})`
            );
          }
        }
      } catch (error) {
        console.error("Error during token approval:", error);
        throw new APIError(
          500,
          ErrorCode.INTERNAL_SERVER_ERROR,
          "Failed to handle token approval",
          error instanceof Error ? error.message : undefined
        );
      }
    }

    // Create Silo router interface
    const siloRouterInterface = new ethers.Interface(SILO_ROUTER_ABI);

    // Prepare the deposit transaction
    const value = isNative ? amount : "0";
    const depositTx = {
      to: SILO_ROUTER_ADDRESS,
      data: siloRouterInterface.encodeFunctionData("execute", [[action]]),
      value: value,
    };

    let depositTxHash;
    try {
      // Add a small delay after approval to ensure the transaction is confirmed
      if (approvalTxHash) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }

      depositTxHash = await agent.sendTransaction(depositTx, {
        confirmations: 1,
      });
    } catch (error) {
      console.error("Error during deposit transaction:", error);

      if (error instanceof Error && error.message) {
        if (error.message.includes("insufficient funds")) {
          throw new APIError(
            400,
            ErrorCode.BAD_REQUEST,
            "Insufficient funds to complete transaction",
            error.message
          );
        } else if (
          error.message.includes("transfer amount exceeds allowance")
        ) {
          throw new APIError(
            400,
            ErrorCode.BAD_REQUEST,
            "Token approval failed or insufficient allowance",
            error.message
          );
        }
      }

      throw new APIError(
        500,
        ErrorCode.INTERNAL_SERVER_ERROR,
        "Failed to execute deposit transaction",
        error instanceof Error ? error.message : undefined
      );
    }

    // Return transaction data and results with improved descriptive links
    const explorerBaseUrl = "https://sonicscan.org/tx/";

    return {
      success: true,
      approvalTxHash,
      approvalExplorerUrl: approvalTxHash
        ? `${explorerBaseUrl}${approvalTxHash}`
        : null,
      depositTxHash,
      depositExplorerUrl: `${explorerBaseUrl}${depositTxHash}`,
    };
  } catch (error) {
    console.error("Silo deposit execution failed:", error);
    throw new APIError(
      500,
      ErrorCode.INTERNAL_SERVER_ERROR,
      "Failed to execute deposit transaction",
      error instanceof Error ? error.message : undefined
    );
  }
};
