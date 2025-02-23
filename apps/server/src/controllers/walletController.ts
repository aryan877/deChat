import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth/index.js";
import { BadRequestError } from "../middleware/errors/types.js";
import { User } from "../models/User.js";
import { getUserId } from "../utils/userIdentification.js";
import { getRpcUrl } from "../utils/getRpcUrl.js";
import { ethers } from "ethers";

export const storeWallet = async (req: AuthenticatedRequest, res: Response) => {
  const { address, chainType = "ethereum" } = req.body;
  const userId = getUserId(req);

  if (!address || !chainType) {
    throw new BadRequestError("Address and chain type are required");
  }

  await User.findOneAndUpdate(
    { userId },
    {
      $push: {
        wallets: {
          address,
          chainType,
          isActive: true,
        },
      },
    },
    { upsert: true }
  );

  return {
    address,
    chainType,
  };
};

export const getBalance = async (req: AuthenticatedRequest, res: Response) => {
  const { address } = req.query;
  const cluster = req.user?.cluster;

  if (!address || typeof address !== "string") {
    throw new BadRequestError("Address is required");
  }

  if (!cluster) {
    throw new BadRequestError("Cluster is required");
  }

  try {
    const rpcUrl = getRpcUrl(cluster);
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const balance = await provider.getBalance(address);

    return {
      balance: balance.toString(),
      formatted: Number(ethers.formatEther(balance)).toFixed(4),
    };
  } catch (error) {
    console.error("Error fetching balance:", error);
    throw new BadRequestError("Failed to fetch balance");
  }
};
