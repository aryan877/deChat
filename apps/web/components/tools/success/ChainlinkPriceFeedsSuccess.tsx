import React from "react";
import { LineChart, ExternalLink } from "lucide-react";
import { ChainlinkPriceFeedInfo, ChainlinkSonicNetwork } from "@repo/de-agent";
import { Badge } from "@/components/ui/badge";
import { explorerUtils } from "@/utils/explorerUrls";

interface ChainlinkPriceFeedsSuccessProps {
  data: {
    feeds: ChainlinkPriceFeedInfo[];
  };
}

export function ChainlinkPriceFeedsSuccess({
  data,
}: ChainlinkPriceFeedsSuccessProps) {
  const { feeds } = data;

  return (
    <div className="flex flex-col gap-4 max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2">
        <LineChart className="w-5 h-5 text-primary" />
        <h3 className="text-base font-medium">Chainlink Price Feeds</h3>
        {feeds.length > 0 && feeds[0] && (
          <Badge variant="outline" className="ml-2">
            {explorerUtils.getNetworkName(feeds[0].network)}
          </Badge>
        )}
      </div>

      {/* Feeds Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-border/50">
              <th className="px-4 py-2 text-left text-sm font-medium text-muted-foreground">
                Pair
              </th>
              <th className="px-4 py-2 text-left text-sm font-medium text-muted-foreground">
                Asset
              </th>
              <th className="px-4 py-2 text-left text-sm font-medium text-muted-foreground">
                Address
              </th>
              <th className="px-4 py-2 text-left text-sm font-medium text-muted-foreground">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {feeds.map((feed, index) => (
              <tr
                key={feed.address}
                className={index % 2 === 0 ? "bg-muted/20" : ""}
              >
                <td className="px-4 py-2 text-sm font-medium">{feed.pair}</td>
                <td className="px-4 py-2 text-sm text-muted-foreground">
                  {feed.assetName || "-"}
                  {feed.assetType && (
                    <span className="text-xs ml-1 opacity-70">
                      ({feed.assetType})
                    </span>
                  )}
                </td>
                <td className="px-4 py-2 text-sm font-mono">
                  <a
                    href={explorerUtils.getExplorerUrl(
                      feed.address,
                      "address",
                      feed.network === ChainlinkSonicNetwork.MAINNET
                        ? "mainnet"
                        : "testnet"
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-primary hover:underline"
                  >
                    {explorerUtils.formatAddress(feed.address)}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </td>
                <td className="px-4 py-2">
                  <Badge
                    variant={feed.status === "active" ? "default" : "secondary"}
                    className={feed.status === "active" ? "bg-green-600" : ""}
                  >
                    {feed.status || "active"}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {feeds.length === 0 && (
        <div className="text-center py-6 text-muted-foreground">
          No price feeds found
        </div>
      )}
    </div>
  );
}
