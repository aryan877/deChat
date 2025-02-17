import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "./index.js";
import { BadRequestError } from "../errors/types.js";
import { Cluster } from "@repo/de-agent";

export const validateCluster = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const cluster = req.headers["x-cluster"] as Cluster;

  if (!cluster || cluster !== "sonicBlaze") {
    throw new BadRequestError(
      "Invalid or missing cluster",
      "Cluster must be 'sonicBlaze'"
    );
  }

  if (req.user) {
    req.user.cluster = cluster;
  }

  next();
};
