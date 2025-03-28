import { Cluster } from "@repo/de-agent";
import axios from "axios";
import { ethers } from "ethers";
import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth/index.js";
import { BadRequestError } from "../middleware/errors/types.js";
import { generateDeChatAgent } from "../utils/generateDeChatAgent.js";

// Dune API key
const DUNE_API_KEY =
  process.env.DUNE_API_KEY || "g2DHwf8Q1XR4uEm0TOMTicXNIe29oRr3";

// Block explorer URLs for different networks
const BLOCK_EXPLORER_URLS = {
  sonicBlaze: "https://testnet.sonicscan.org/tx/",
  sonicMainnet: "https://sonicscan.org/tx/",
};

/**
 * Get the block explorer URL for a transaction
 * @param txHash Transaction hash
 * @param cluster Network cluster
 * @returns Full block explorer URL
 */
function getExplorerUrl(txHash: string, cluster: Cluster): string {
  const baseUrl =
    BLOCK_EXPLORER_URLS[cluster] || BLOCK_EXPLORER_URLS.sonicMainnet;
  return `${baseUrl}${txHash}`;
}

/**
 * Get token balances for a wallet on Sonic chain
 * Uses Dune API to fetch balances
 */
export const getSonicBalances = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const { address, chainId = "146" } = req.query;

  if (!address || typeof address !== "string") {
    throw new BadRequestError("Wallet address is required");
  }

  try {
    const response = await axios.get(
      `https://api.dune.com/api/echo/v1/balances/evm/${address}?chain_ids=${chainId}`,
      {
        headers: {
          "X-Dune-Api-Key": DUNE_API_KEY,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error fetching Sonic balances:", error);
    throw new BadRequestError("Failed to fetch Sonic balances");
  }
};

/**
 * Get transactions for a wallet on Sonic chain
 * Uses Dune API to fetch transactions
 */
export const getSonicTransactions = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const {
    address,
    chainId = "146",
    limit = "10",
    offset,
    decode = "true",
  } = req.query;

  if (!address || typeof address !== "string") {
    throw new BadRequestError("Wallet address is required");
  }

  try {
    let url = `https://api.dune.com/api/echo/v1/transactions/evm/${address}?chain_ids=${chainId}&limit=${limit}&decode=${decode}`;

    if (offset && typeof offset === "string") {
      url += `&offset=${offset}`;
    }

    const response = await axios.get(url, {
      headers: {
        "X-Dune-Api-Key": DUNE_API_KEY,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching Sonic transactions:", error);
    throw new BadRequestError("Failed to fetch Sonic transactions");
  }
};

/**
 * Transfer tokens (native SONIC or ERC-20) using the DeAgent
 */
export const transferTokens = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const { walletAddress } = req.user || {};
  const {
    toAddress,
    amount,
    tokenAddress,
    cluster = "sonicMainnet",
  } = req.body;

  if (!walletAddress) {
    throw new BadRequestError("User wallet address is required");
  }

  if (!toAddress) {
    throw new BadRequestError("Recipient address is required");
  }

  if (!amount || isNaN(Number(amount))) {
    throw new BadRequestError("Valid amount is required");
  }

  try {
    // Generate DeAgent for the user
    const agent = generateDeChatAgent({
      address: walletAddress,
      cluster: cluster as Cluster,
    });

    let txResult;

    // If tokenAddress is provided, it's an ERC-20 transfer
    if (tokenAddress) {
      // ERC-20 ABI for transfer function
      const ERC20_ABI = [
        "function transfer(address to, uint256 amount) returns (bool)",
        "function decimals() view returns (uint8)",
      ];

      try {
        // Get token decimals (default to 18 if we can't get it)
        let decimals = 18;
        try {
          // Use a direct call to the contract instead of the method
          const iface = new ethers.Interface(ERC20_ABI);
          const data = iface.encodeFunctionData("decimals", []);

          const decimalsResult = await agent.provider.call({
            to: tokenAddress,
            data,
          });

          if (decimalsResult && decimalsResult !== "0x") {
            decimals = parseInt(decimalsResult, 16);
          }
        } catch (error) {
          console.warn("Could not get token decimals, using default 18", error);
        }

        // Convert amount to token units
        const amountBigInt = ethers.parseUnits(amount, decimals);

        // Create transaction request
        const tx = {
          to: tokenAddress,
          data: new ethers.Interface(ERC20_ABI).encodeFunctionData("transfer", [
            toAddress,
            amountBigInt,
          ]),
        };

        // Send transaction
        txResult = await agent.sendTransaction(tx, { confirmations: 1 });

        if (!txResult.success) {
          throw new Error(
            `Token transfer failed: ${txResult.error || "Unknown error"}`
          );
        }
      } catch (error) {
        throw new Error(
          `Failed to transfer token: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    } else {
      try {
        // Native SONIC transfer
        const amountWei = ethers.parseEther(amount);

        // Create transaction request
        const tx = {
          to: toAddress,
          value: amountWei,
        };

        // Send transaction
        txResult = await agent.sendTransaction(tx, { confirmations: 1 });

        if (!txResult.success) {
          throw new Error(
            `SONIC transfer failed: ${txResult.error || "Unknown error"}`
          );
        }
      } catch (error) {
        throw new Error(
          `Failed to transfer SONIC: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    }

    // Return transaction hash and explorer URL
    return res.status(200).json({
      success: true,
      txHash: txResult.hash,
      explorerUrl: getExplorerUrl(txResult.hash, cluster as Cluster),
    });
  } catch (error) {
    console.error("Token transfer error:", error);
    throw new BadRequestError(
      `Failed to transfer tokens: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
};
