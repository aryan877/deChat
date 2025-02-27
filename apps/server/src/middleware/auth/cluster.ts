import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "./index.js";
import { BadRequestError } from "../errors/types.js";
import { Cluster } from "@repo/de-agent";

// Define valid clusters
const VALID_CLUSTERS: Cluster[] = ["sonicBlaze", "sonicMainnet"];

export const validateCluster = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const cluster = req.headers["x-cluster"] as Cluster;

  if (!cluster || !VALID_CLUSTERS.includes(cluster)) {
    throw new BadRequestError(
      "Invalid or missing cluster",
      `Cluster must be one of: ${VALID_CLUSTERS.join(", ")}`
    );
  }

  if (req.user) {
    req.user.cluster = cluster;
  }

  next();
};
