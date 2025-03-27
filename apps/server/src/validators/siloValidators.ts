import { z } from "zod";
import { validateRequest } from "./validateRequest.js";

// Schema for getting Silo markets with optional filters
export const validateGetSiloMarkets = validateRequest({
  query: z.object({
    chainKey: z.string().optional(),
    search: z.string().optional(),
    excludeEmpty: z.string().optional(),
  }),
});

// Schema for getting a specific Silo market
export const validateGetSiloMarket = validateRequest({
  params: z.object({
    chainKey: z.string(),
    marketId: z.string(),
  }),
});

// Schema for getting a specific Silo market for a user
export const validateGetSiloMarketForUser = validateRequest({
  params: z.object({
    chainKey: z.string(),
    marketId: z.string(),
  }),
  query: z.object({
    userAddress: z.string(),
  }),
});

// Schema for Silo stats (no parameters required)
export const validateGetSiloStats = validateRequest({
  query: z.object({}),
});
