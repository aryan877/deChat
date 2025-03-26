import { Router } from "express";
import {
  getSiloMarkets,
  getSiloStats,
} from "../../controllers/services/siloController.js";
import { validateCluster } from "../../middleware/auth/cluster.js";
import { authenticateUser } from "../../middleware/auth/index.js";
import { asyncHandler } from "../../middleware/errors/asyncHandler.js";
import { validateGetSiloMarkets } from "../../validators/siloValidators.js";

export function setupSiloRoutes(router: Router): Router {
  router.use(authenticateUser);
  router.use(validateCluster);

  // Get market data from Silo Finance
  router.get("/markets", validateGetSiloMarkets, asyncHandler(getSiloMarkets));

  // Get stats from Silo Finance
  router.get("/stats", asyncHandler(getSiloStats));

  return router;
}
