import { Router } from "express";
import {
  executeSiloDeposit,
  getSiloMarket,
  getSiloMarketForUser,
  getSiloMarkets,
  getSiloStats,
} from "../../controllers/services/siloController.js";
import { validateCluster } from "../../middleware/auth/cluster.js";
import { authenticateUser } from "../../middleware/auth/index.js";
import { asyncHandler } from "../../middleware/errors/asyncHandler.js";
import {
  validateGetSiloMarket,
  validateGetSiloMarketForUser,
  validateGetSiloMarkets,
  validateSiloDepositExecution,
} from "../../validators/siloValidators.js";

export function setupSiloRoutes(router: Router): Router {
  router.use(authenticateUser);
  router.use(validateCluster);

  // Get market data from Silo Finance
  router.get("/markets", validateGetSiloMarkets, asyncHandler(getSiloMarkets));

  // Get specific market data
  router.get(
    "/market/:chainKey/:marketId",
    validateGetSiloMarket,
    asyncHandler(getSiloMarket)
  );

  // Get specific market data for a user
  router.get(
    "/market/:chainKey/:marketId/user",
    validateGetSiloMarketForUser,
    asyncHandler(getSiloMarketForUser)
  );

  // Execute deposit transaction
  router.post(
    "/deposit/execute",
    validateSiloDepositExecution,
    asyncHandler(executeSiloDeposit)
  );

  // Get stats from Silo Finance
  router.get("/stats", asyncHandler(getSiloStats));

  return router;
}
