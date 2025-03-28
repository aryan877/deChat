export const formatUSD = (value: number | string, decimals = 2) => {
  if (!value || isNaN(Number(value))) return "$0";

  // Convert to number if string
  const num = typeof value === "string" ? parseFloat(value) : value;

  // Format based on size
  if (num >= 1e9) {
    return `$${(num / 1e9).toFixed(decimals)}B`;
  } else if (num >= 1e6) {
    return `$${(num / 1e6).toFixed(decimals)}M`;
  } else if (num >= 1e3) {
    return `$${(num / 1e3).toFixed(decimals)}K`;
  } else if (num >= 1) {
    return `$${num.toFixed(decimals)}`;
  } else if (num >= 0.01) {
    // For small values between $0.01 and $1
    return `$${num.toFixed(4)}`;
  } else if (num >= 0.0001) {
    // For very small values between $0.0001 and $0.01
    return `$${num.toFixed(6)}`;
  } else {
    // For extremely small values
    return `$${num.toExponential(4)}`;
  }
};

export const formatPercent = (value: number | string) => {
  if (value === undefined || value === null || isNaN(Number(value)))
    return "--";

  // Convert from wei format if needed
  const percentValue = typeof value === "string" ? parseFloat(value) : value;

  // Some values might be in wei (1e18) format
  if (percentValue > 1) {
    const percent = (percentValue / 1e18) * 100;
    // Higher precision for small percentages
    if (percent < 0.1) {
      return `${percent.toFixed(3)}%`;
    }
    return `${percent.toFixed(2)}%`;
  }

  // Higher precision for small percentages
  if (percentValue * 100 < 0.1) {
    return `${(percentValue * 100).toFixed(3)}%`;
  }
  return `${(percentValue * 100).toFixed(2)}%`;
};

// Helper to format large numbers with commas
export const formatNumberWithCommas = (value: number | string) => {
  if (!value) return "0";

  const num = typeof value === "string" ? parseFloat(value) : value;
  return num.toLocaleString("en-US");
};

import { SiloToken } from "../types";

export interface PointsBreakdownItem {
  type: "silo" | "sonic" | "rings";
  multiplier: number;
  basePoints?: number;
  calculatedPoints?: number;
  hasPremium: boolean;
}

export interface PointsBreakdownData {
  items: PointsBreakdownItem[];
  hasAnyPoints: boolean;
  hasPremiumPoints: boolean;
}

/**
 * Formats points data for display
 * @param points The collateral or debt points from a SiloToken
 * @returns Structured data for rendering points information
 */
export const formatPointsBreakdown = (
  points?: SiloToken["collateralPoints"] | SiloToken["debtPoints"]
): PointsBreakdownData => {
  if (!points || points.length === 0) {
    return { items: [], hasAnyPoints: false, hasPremiumPoints: false };
  }

  let hasPremiumPoints = false;
  const items: PointsBreakdownItem[] = [];

  // Process each point type
  const siloPoints = points.find((p) => p._tag === "silo");
  const sonicPoints = points.find((p) => p._tag === "sonic");
  const ringsPoints = points.find((p) => p._tag === "rings");

  if (siloPoints) {
    const hasPremium =
      (siloPoints.multiplier !== undefined && siloPoints.multiplier > 1) ||
      (siloPoints.basePoints !== undefined && siloPoints.basePoints > 1);

    if (hasPremium) {
      hasPremiumPoints = true;
    }

    const calculatedPoints =
      siloPoints.basePoints && siloPoints.multiplier
        ? siloPoints.basePoints * siloPoints.multiplier
        : siloPoints.basePoints;

    items.push({
      type: "silo",
      multiplier: siloPoints.multiplier || 1,
      basePoints: siloPoints.basePoints,
      calculatedPoints,
      hasPremium,
    });
  }

  if (sonicPoints) {
    const hasPremium =
      sonicPoints.multiplier !== undefined && sonicPoints.multiplier > 1;

    if (hasPremium) {
      hasPremiumPoints = true;
    }

    items.push({
      type: "sonic",
      multiplier: sonicPoints.multiplier || 1,
      hasPremium,
    });
  }

  if (ringsPoints) {
    const hasPremium =
      ringsPoints.multiplier !== undefined && ringsPoints.multiplier > 1;

    if (hasPremium) {
      hasPremiumPoints = true;
    }

    items.push({
      type: "rings",
      multiplier: ringsPoints.multiplier || 1,
      hasPremium,
    });
  }

  return {
    items,
    hasAnyPoints: items.length > 0,
    hasPremiumPoints,
  };
};
