import { Request, Response, NextFunction } from "express";
import { privyClient } from "../../lib/privyClient.js";
import { UnauthorizedError } from "../errors/types.js";
import { Cluster } from "@repo/de-agent";

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    walletAddress?: string;
    cluster?: Cluster;
  };
}

export async function authenticateUser(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      const accessToken = req.cookies["privy-token"];
      const idToken = req.cookies["privy-id-token"];

      if (!accessToken) {
        throw new UnauthorizedError("No authentication token provided");
      }

      try {
        const verifiedClaims = await privyClient.verifyAuthToken(accessToken);

        if (idToken) {
          try {
            const user = await privyClient.getUser({ idToken });
            req.user = {
              userId: verifiedClaims.userId,
              walletAddress: user.wallet?.address,
            };
          } catch (error) {
            throw new UnauthorizedError("invalid auth token");
          }
        } else {
          req.user = {
            userId: verifiedClaims.userId,
          };
        }
      } catch (error: any) {
        throw new UnauthorizedError("invalid auth token");
      }

      next();
      return;
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      throw new UnauthorizedError("No authentication token provided");
    }

    try {
      const verifiedClaims = await privyClient.verifyAuthToken(token);

      req.user = {
        userId: verifiedClaims.userId,
      };

      next();
    } catch (error: any) {
      throw new UnauthorizedError("invalid auth token");
    }
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      next(error);
    } else {
      next(new UnauthorizedError("invalid auth token"));
    }
  }
}
