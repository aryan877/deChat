import { Router } from "express";
import {
  getSonicBalances,
  getSonicTransactions,
  transferTokens,
} from "../controllers/sonicController.js";
import { authenticateUser } from "../middleware/auth/index.js";
import { asyncHandler } from "../middleware/errors/asyncHandler.js";
import {
  validateGetSonicBalances,
  validateGetSonicTransactions,
  validateTransferTokens,
} from "../validators/sonicValidators.js";

export function setupSonicRoutes(router: Router): Router {
  router.use(authenticateUser);

  // Get token balances for a wallet on Sonic chain
  router.get(
    "/balances",
    validateGetSonicBalances,
    asyncHandler(getSonicBalances)
  );

  // Get transactions for a wallet on Sonic chain
  router.get(
    "/transactions",
    validateGetSonicTransactions,
    asyncHandler(getSonicTransactions)
  );

  // Transfer tokens (native SONIC or ERC-20)
  router.post(
    "/transfer",
    validateTransferTokens,
    asyncHandler(transferTokens)
  );

  return router;
}
