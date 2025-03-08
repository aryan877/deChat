import { z } from "zod";
import { validateRequest } from "./validateRequest.js";

// Schema for getting Sonic chain balances
export const validateGetSonicBalances = validateRequest({
  query: z.object({
    address: z
      .string()
      .min(1, "Wallet address is required")
      .max(256, "Wallet address is too long"),
    chainId: z
      .string()
      .optional()
      .default("146") // Default to Sonic mainnet
      .refine((val) => ["146"].includes(val), {
        message: "Unsupported chain ID",
      }),
  }),
});

// Schema for getting Sonic chain transactions
export const validateGetSonicTransactions = validateRequest({
  query: z.object({
    address: z
      .string()
      .min(1, "Wallet address is required")
      .max(256, "Wallet address is too long"),
    chainId: z
      .string()
      .optional()
      .default("146") // Default to Sonic mainnet
      .refine((val) => ["146"].includes(val), {
        message: "Unsupported chain ID",
      }),
    limit: z
      .string()
      .optional()
      .default("10")
      .transform((val) => parseInt(val, 10))
      .refine((val) => !isNaN(val) && val > 0 && val <= 100, {
        message: "Limit must be between 1 and 100",
      }),
    offset: z.string().optional(),
    decode: z
      .string()
      .optional()
      .default("true")
      .transform((val) => val === "true"),
  }),
});

// Schema for transferring tokens (native SONIC or ERC-20)
export const validateTransferTokens = validateRequest({
  body: z.object({
    toAddress: z
      .string()
      .min(1, "Recipient address is required")
      .max(256, "Recipient address is too long")
      .refine((val) => val.startsWith("0x"), {
        message: "Invalid Ethereum address format",
      }),
    amount: z
      .string()
      .min(1, "Amount is required")
      .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
        message: "Amount must be a positive number",
      }),
    tokenAddress: z
      .string()
      .optional()
      .refine((val) => !val || (val.startsWith("0x") && val.length === 42), {
        message: "Invalid token address format",
      }),
    cluster: z
      .enum(["sonicBlaze", "sonicMainnet"])
      .optional()
      .default("sonicMainnet"),
  }),
});
