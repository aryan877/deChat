"use client";

import { SiloFinanceToolResult } from "@/app/types/tools";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSiloData } from "@/hooks/silo";
import { cn } from "@/lib/utils";
import { SiloFinanceInput } from "@repo/de-agent";
import { useCallback, useEffect, useState } from "react";
import { FilterBar } from "./components/FilterBar";
import { MarketTable } from "./components/MarketTable";
import { StatsHeader } from "./components/StatsHeader";
import { SiloMarket } from "./types";
import {
  calculateBorrowAPR,
  calculateDepositAPR,
  calculateTotalMarketTVL,
} from "./utils/calculators";
import { formatUSD } from "./utils/formatters";

interface SiloFinanceToolProps {
  args: SiloFinanceInput;
  onSubmit: (result: SiloFinanceToolResult) => void;
  isExpanded?: boolean;
}

export function SiloFinanceTool({
  args,
  onSubmit,
  isExpanded = false,
}: SiloFinanceToolProps) {
  const [filteredMarkets, setFilteredMarkets] = useState<SiloMarket[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNetwork, setSelectedNetwork] = useState("all");
  const [sortOption, setSortOption] = useState("tvl-desc");

  // Use the existing hook instead of axios directly
  const { data, isLoading, error } = useSiloData({
    chainKey: args.chainKey || undefined,
    search: args.search || undefined,
  });

  // Format TVL with the formatter utility
  const totalTvl = data?.stats?.tvlUsd
    ? formatUSD(parseFloat(data.stats.tvlUsd) / 1e6)
    : "$0";

  // Sort markets based on selected option
  const sortMarkets = useCallback(
    (markets: SiloMarket[]) => {
      if (!markets) return [];

      const [field, direction] = sortOption.split("-");

      return [...markets].sort((a, b) => {
        let aValue: number, bValue: number;

        switch (field) {
          case "tvl":
            aValue = calculateTotalMarketTVL(a);
            bValue = calculateTotalMarketTVL(b);
            break;
          case "depositApr":
            aValue = Math.max(
              calculateDepositAPR(a.silo0) || 0,
              calculateDepositAPR(a.silo1) || 0
            );
            bValue = Math.max(
              calculateDepositAPR(b.silo0) || 0,
              calculateDepositAPR(b.silo1) || 0
            );
            break;
          case "borrowApr":
            aValue = Math.max(
              calculateBorrowAPR(a.silo0) || 0,
              calculateBorrowAPR(a.silo0) || 0
            );
            bValue = Math.max(
              calculateBorrowAPR(b.silo0) || 0,
              calculateBorrowAPR(b.silo1) || 0
            );
            break;
          default:
            // Default sort by ID
            return direction === "asc"
              ? a.id.localeCompare(b.id)
              : b.id.localeCompare(a.id);
        }

        // Handle empty values
        if (isNaN(aValue)) aValue = direction === "asc" ? Infinity : -Infinity;
        if (isNaN(bValue)) bValue = direction === "asc" ? Infinity : -Infinity;

        return direction === "asc" ? aValue - bValue : bValue - aValue;
      });
    },
    [sortOption]
  );

  // Apply filters and sorting
  const applyFilters = useCallback(() => {
    if (!data?.markets) return;

    // Filter by network and search query
    let filtered = data.markets.filter((market) => {
      // Network filter
      const networkMatch =
        selectedNetwork === "all" || market.chainKey === selectedNetwork;

      // Search filter
      const searchLower = searchQuery.toLowerCase();
      const searchMatch =
        searchQuery === "" ||
        market.id.toLowerCase().includes(searchLower) ||
        (market.silo0?.symbol &&
          market.silo0.symbol.toLowerCase().includes(searchLower)) ||
        (market.silo1?.symbol &&
          market.silo1.symbol.toLowerCase().includes(searchLower)) ||
        (market.silo0?.name &&
          market.silo0.name.toLowerCase().includes(searchLower)) ||
        (market.silo1?.name &&
          market.silo1.name.toLowerCase().includes(searchLower));

      return networkMatch && searchMatch;
    });

    // Apply sorting
    filtered = sortMarkets(filtered);

    setFilteredMarkets(filtered);
  }, [data, searchQuery, selectedNetwork, sortMarkets]);

  useEffect(() => {
    if (data?.markets && data.markets.length > 0) {
      applyFilters();
    }
  }, [searchQuery, selectedNetwork, sortOption, data, applyFilters]);

  const handleCancel = () => {
    onSubmit({
      status: "cancelled",
      message: "Silo Finance data request cancelled by user",
      data: {
        markets: [],
        stats: { tvlUsd: "0" },
      },
    });
  };

  const uniqueNetworks = data?.markets
    ? Array.from(new Set(data.markets.map((m) => m.chainKey)))
    : [];

  // Error message from the hook
  const errorMessage = error
    ? error instanceof Error
      ? error.message
      : "Failed to load Silo Finance data"
    : null;

  return (
    <Card
      className={cn(
        "w-full shadow-md flex flex-col",
        !isExpanded ? "max-h-[80vh]" : "h-full"
      )}
    >
      <CardHeader
        className={cn(
          "border-b pb-2 flex-shrink-0 px-3 sm:px-4 py-2.5 sm:py-3",
          !isExpanded && "pr-14 sm:pr-16"
        )}
      >
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg sm:text-xl md:text-2xl">
            <span className="flex items-center">
              <div className="w-5 h-5 sm:w-6 sm:h-6 mr-2 rounded-full bg-blue-500 flex items-center justify-center">
                <span className="text-white text-[10px] sm:text-xs font-bold">
                  S
                </span>
              </div>
              Silo Finance Markets
            </span>
          </CardTitle>
          <div className="text-sm text-muted-foreground">
            <StatsHeader totalTvl={totalTvl} />
          </div>
        </div>
      </CardHeader>

      <CardContent
        className={cn(
          "p-2 sm:p-3 md:p-4 flex-1 flex flex-col overflow-hidden",
          !isExpanded && "pr-4 sm:pr-5 md:pr-6"
        )}
      >
        <FilterBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedNetwork={selectedNetwork}
          setSelectedNetwork={setSelectedNetwork}
          sortOption={sortOption}
          setSortOption={setSortOption}
          networks={uniqueNetworks}
          className="flex-shrink-0"
        />

        <div className="text-xs sm:text-sm text-muted-foreground mt-3 flex-shrink-0">
          {filteredMarkets.length} markets found
        </div>

        <div
          className={cn(
            "mt-3 flex-1 overflow-auto",
            !isExpanded && "max-h-[calc(80vh-12rem)]"
          )}
        >
          <MarketTable
            loading={isLoading}
            error={errorMessage}
            filteredMarkets={filteredMarkets}
            isExpanded={isExpanded}
          />
        </div>

        <div className="flex justify-end gap-2 pt-3 mt-2 flex-shrink-0 border-t">
          <Button
            onClick={handleCancel}
            variant="outline"
            size="sm"
            className="hover:bg-muted/70 transition-colors h-8 sm:h-9"
          >
            <span className="text-xs sm:text-sm">Force Cancel</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
