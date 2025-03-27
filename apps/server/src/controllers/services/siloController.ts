import axios from "axios";
import { Response } from "express";
import { AuthenticatedRequest } from "../../middleware/auth/index.js";
import { APIError, ErrorCode } from "../../middleware/errors/types.js";

/**
 * Fetches market data from Silo Finance API
 */
export const getSiloMarkets = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    // Set payload to get data from the specified chain
    const chainKey = (req.query.chainKey as string) || "sonic";

    const payload = {
      sort: {
        field: "tvl",
        direction: "desc",
      },
      chainKey,
      search: req.query.search || "",
      isCurated: false,
      excludeEmpty: req.query.excludeEmpty === "true",
    };

    const response = await axios.post(
      "https://app.silo.finance/api/display-markets-v2",
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Origin: "https://app.silo.finance",
          "User-Agent": "SiloFinance-API-Client/1.0",
        },
        timeout: 10000, // 10 second timeout
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error fetching Silo Finance data:", error);
    throw new APIError(
      500,
      ErrorCode.INTERNAL_SERVER_ERROR,
      "Failed to fetch data from Silo Finance API",
      error instanceof Error ? error.message : undefined
    );
  }
};

/**
 * Fetches specific lending market data from Silo Finance API
 */
export const getSiloMarket = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const chainKey = (req.params.chainKey as string) || "sonic";
    const marketId = req.params.marketId;

    const url = `https://v2.silo.finance/api/lending-market-v2/${chainKey}/${marketId}`;

    const response = await axios.get(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "SiloFinance-API-Client/1.0",
      },
      timeout: 10000,
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching Silo Finance market data:", error);
    throw new APIError(
      500,
      ErrorCode.INTERNAL_SERVER_ERROR,
      "Failed to fetch market data from Silo Finance API",
      error instanceof Error ? error.message : undefined
    );
  }
};

/**
 * Fetches specific lending market data with user info from Silo Finance API
 */
export const getSiloMarketForUser = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const chainKey = (req.params.chainKey as string) || "sonic";
    const marketId = req.params.marketId;
    const userAddress = req.query.userAddress as string;

    if (!userAddress) {
      throw new APIError(
        400,
        ErrorCode.BAD_REQUEST,
        "User address is required"
      );
    }

    const url = `https://v2.silo.finance/api/lending-market-v2/${chainKey}/${marketId}?user=${userAddress}`;

    const response = await axios.get(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "SiloFinance-API-Client/1.0",
      },
      timeout: 10000,
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching Silo Finance market data for user:", error);
    throw new APIError(
      500,
      ErrorCode.INTERNAL_SERVER_ERROR,
      "Failed to fetch market data from Silo Finance API",
      error instanceof Error ? error.message : undefined
    );
  }
};

/**
 * Gets TVL from Silo Finance
 */
export const getSiloStats = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    // Use the metrics endpoint which returns TVL data
    const response = await axios.get("https://app.silo.finance/api/metrics", {
      headers: {
        Accept: "application/json",
        Origin: "https://app.silo.finance",
        "User-Agent": "SiloFinance-API-Client/1.0",
      },
      timeout: 5000,
    });

    // Return raw TVL value
    return {
      tvlUsd: response.data.tvlUsd,
    };
  } catch (error) {
    console.error("Error fetching Silo Finance metrics:", error);
    throw new APIError(
      500,
      ErrorCode.INTERNAL_SERVER_ERROR,
      "Failed to fetch metrics from Silo Finance API",
      error instanceof Error ? error.message : undefined
    );
  }
};
