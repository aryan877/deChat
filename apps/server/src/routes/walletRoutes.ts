import { Router } from "express";
import { storeWallet } from "../controllers/walletController.js";
import { authenticateUser } from "../middleware/auth/index.js";
import { validateCluster } from "../middleware/auth/cluster.js";
import { asyncHandler } from "../middleware/errors/asyncHandler.js";
import { validateStoreWallet } from "../validators/walletValidators.js";

export function setupWalletRoutes(router: Router): Router {
  router.use(authenticateUser);
  router.use(validateCluster);

  router.post("/store", validateStoreWallet, asyncHandler(storeWallet));
  return router;
}
