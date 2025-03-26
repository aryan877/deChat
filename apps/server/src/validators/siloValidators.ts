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

// Schema for Silo stats (no parameters required)
export const validateGetSiloStats = validateRequest({
  query: z.object({}),
});
