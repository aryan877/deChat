import { z } from "zod";
import {
  ChainSlug,
  PriceInferenceToken,
  PriceInferenceTimeframe,
  SignatureFormat,
} from "@alloralabs/allora-sdk";

import type {
  AlloraTopic as SdkAlloraTopic,
  AlloraInference as SdkAlloraInference,
  AlloraInferenceData as SdkAlloraInferenceData,
} from "@alloralabs/allora-sdk";

// Re-export the SDK enums
export {
  ChainSlug,
  PriceInferenceToken,
  PriceInferenceTimeframe,
  SignatureFormat,
};

export type AlloraSdkTopic = SdkAlloraTopic;
export type AlloraSdkInference = SdkAlloraInference;
export type AlloraSdkInferenceData = SdkAlloraInferenceData;

export interface AlloraTopic {
  topic_id: number;
  topic_name: string;
  description?: string | null;
  is_active: boolean;
  worker_count: number;
  reputer_count: number;
  epoch_length: number;
  ground_truth_lag: number;
  loss_method: string;
  worker_submission_window: number;
  total_staked_allo: number;
  total_emissions_allo: number;
  created_at?: string;
  updated_at: string;
}

export interface AlloraInferenceData {
  network_inference: string;
  network_inference_normalized: string | number;
  timestamp: number;
  confidence_interval_values: string[];
  confidence_interval_percentiles: string[];
  confidence_interval_percentiles_normalized?: string[];
  confidence_interval_values_normalized?: string[];
  topic_id?: string;
  extra_data?: string;
}

export interface AlloraInferenceResponse {
  inference_data: AlloraInferenceData;
  signature?: string;
  token_decimals?: number;
}

// Price inference interfaces
export interface AlloraPriceInferenceParams {
  asset: PriceInferenceToken;
  timeframe: PriceInferenceTimeframe;
  signatureFormat?: SignatureFormat;
}

// Zod schemas for validation
export const getAllTopicsSchema = z.object({
  network: z.nativeEnum(ChainSlug).optional().default(ChainSlug.TESTNET),
});

export const getInferenceByTopicIDSchema = z.object({
  topicId: z.number().int().positive(),
  signatureFormat: z
    .nativeEnum(SignatureFormat)
    .optional()
    .default(SignatureFormat.ETHEREUM_SEPOLIA),
  network: z.nativeEnum(ChainSlug).optional().default(ChainSlug.TESTNET),
});

export const getPriceInferenceSchema = z.object({
  asset: z.nativeEnum(PriceInferenceToken),
  timeframe: z.nativeEnum(PriceInferenceTimeframe),
  signatureFormat: z
    .nativeEnum(SignatureFormat)
    .optional()
    .default(SignatureFormat.ETHEREUM_SEPOLIA),
  network: z.nativeEnum(ChainSlug).optional().default(ChainSlug.TESTNET),
});

// Type exports from schemas
export type GetAllTopicsParams = z.infer<typeof getAllTopicsSchema>;
export type GetInferenceByTopicIDParams = z.infer<
  typeof getInferenceByTopicIDSchema
>;
export type GetPriceInferenceParams = z.infer<typeof getPriceInferenceSchema>;

// Response interfaces for actions
export interface AlloraGetAllTopicsResponse {
  status: "success" | "error";
  topics?: AlloraTopic[];
  message?: string;
  code?: string;
}

export interface AlloraGetInferenceByTopicIdResponse {
  status: "success" | "error";
  topicId?: number;
  inference?: AlloraSdkInference;
  message?: string;
  code?: string;
}

export interface AlloraPriceInferenceResponse {
  status: "success" | "error";
  tokenSymbol?: string;
  timeframe?: string;
  priceInference?: string;
  message?: string;
  code?: string;
}
