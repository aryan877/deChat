"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface NetworkIndicatorProps {
  chainKey: string;
}

export const NetworkIndicator = ({ chainKey }: NetworkIndicatorProps) => {
  const getNetworkAbbreviation = (chainKey: string) => {
    if (chainKey.toLowerCase() === "sonic") {
      return "S";
    }
    return chainKey.charAt(0).toUpperCase();
  };

  const getNetworkColor = (chainKey: string): string => {
    const network = chainKey.toLowerCase();
    switch (network) {
      case "sonic":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "ethereum":
      case "eth":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "arbitrum":
      case "arb":
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "polygon":
      case "poly":
        return "bg-pink-100 text-pink-800 border-pink-200";
      case "optimism":
      case "opt":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        "ml-2 text-xs px-1.5 font-semibold",
        getNetworkColor(chainKey)
      )}
    >
      {getNetworkAbbreviation(chainKey)}
    </Badge>
  );
};
