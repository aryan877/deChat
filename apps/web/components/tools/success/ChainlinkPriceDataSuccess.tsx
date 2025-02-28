import React from "react";
import { DollarSign, Clock, Layers } from "lucide-react";
import { ChainlinkPriceFeedResponse } from "@repo/de-agent";
import { Badge } from "@/components/ui/badge";

interface ChainlinkPriceDataSuccessProps {
  data: ChainlinkPriceFeedResponse & {
    formattedPrice: string;
  };
}

export function ChainlinkPriceDataSuccess({
  data,
}: ChainlinkPriceDataSuccessProps) {
  const {
    decimals,
    latestAnswer,
    latestTimestamp,
    latestRound,
    formattedPrice,
  } = data;

  // Format timestamp to readable date
  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  return (
    <div className="flex flex-col gap-4 max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2">
        <DollarSign className="w-5 h-5 text-primary" />
        <h3 className="text-base font-medium">Chainlink Price Data</h3>
      </div>

      {/* Price Card */}
      <div className="bg-card rounded-lg border border-border p-4">
        <div className="flex flex-col gap-4">
          {/* Price */}
          <div className="flex flex-col gap-1">
            <span className="text-sm text-muted-foreground">Current Price</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">{formattedPrice}</span>
              <Badge variant="outline">Decimals: {decimals}</Badge>
            </div>
            <span className="text-xs text-muted-foreground">
              Raw value: {latestAnswer}
            </span>
          </div>

          {/* Divider */}
          <div className="border-t border-border my-1"></div>

          {/* Additional Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Last Updated */}
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">
                  Last Updated
                </span>
                <span className="text-sm">
                  {formatTimestamp(latestTimestamp)}
                </span>
              </div>
            </div>

            {/* Round */}
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-muted-foreground" />
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">Round</span>
                <span className="text-sm font-mono">{latestRound}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-muted/30 rounded-md p-3 text-sm text-muted-foreground">
        <p>
          This price data is provided by Chainlink&apos;s decentralized oracle
          network. Prices are updated based on network conditions and aggregated
          from multiple sources.
        </p>
      </div>
    </div>
  );
}
