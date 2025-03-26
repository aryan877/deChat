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
 * Gets TVL and other metrics from Silo Finance
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

    // Parse the TVL value - the API returns it with 6 extra decimals
    const tvlUsd = response.data.tvlUsd;
    const formattedTvl = tvlUsd ? parseFloat(tvlUsd) / 1000000 : 0;

    return {
      tvlUsd: formattedTvl,
      formattedTvl: formatUSD(formattedTvl),
      deploymentDays: calculateDeploymentDays(),
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

// Helper to calculate days since deployment
function calculateDeploymentDays(): number {
  const deployedDate = new Date("2024-02-01");
  return Math.floor(
    (new Date().getTime() - deployedDate.getTime()) / (1000 * 60 * 60 * 24)
  );
}

// Helper to format USD values
function formatUSD(value: number): string {
  if (value >= 1e9) {
    return `$${(value / 1e9).toFixed(1)}B`;
  } else if (value >= 1e6) {
    return `$${(value / 1e6).toFixed(1)}M`;
  } else if (value >= 1e3) {
    return `$${(value / 1e3).toFixed(1)}K`;
  } else {
    return `$${value.toFixed(2)}`;
  }
}
