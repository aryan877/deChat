"use client";

import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { SiloMarket } from "../types";
import { SiloCard } from "./SiloCard";
import { SiloRow } from "./SiloRow";

interface MarketTableProps {
  loading: boolean;
  error: string | null;
  filteredMarkets: SiloMarket[];
  isExpanded?: boolean;
}

export const MarketTable = ({
  loading,
  error,
  filteredMarkets,
  isExpanded = false,
}: MarketTableProps) => {
  const [isMobile, setIsMobile] = useState(false);

  // Check if we're on a mobile device using window width
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Initial check
    checkIfMobile();

    // Setup listener for resize
    window.addEventListener("resize", checkIfMobile);

    // Cleanup
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  if (filteredMarkets.length === 0) {
    return (
      <div className="text-center py-4">
        No markets found matching your criteria.
      </div>
    );
  }

  // Mobile view - compact cards
  if (isMobile) {
    return (
      <div className="space-y-4">
        {filteredMarkets.map((market) => (
          <div key={market.id} className="border rounded-md overflow-hidden">
            <div className="bg-muted/50 px-2 py-1 text-xs font-medium border-b">
              {market.id}
            </div>
            <div>
              {market.silo0 && (
                <SiloCard silo={market.silo0} isFirstInMarket={true} />
              )}
              {market.silo1 && (
                <SiloCard silo={market.silo1} isFirstInMarket={false} />
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Desktop view - compact table with subtle market grouping
  return (
    <Table>
      <TableHeader className="sticky top-0 z-10 bg-muted/90 backdrop-blur supports-[backdrop-filter]:bg-muted/70">
        <TableRow className="border-b">
          <TableHead className="min-w-[120px] w-[15%] h-10">Market</TableHead>
          <TableHead className="min-w-[150px] w-[18%] h-10">Token</TableHead>
          <TableHead className="min-w-[100px] w-[12%] h-10">
            Deposit APR
          </TableHead>
          <TableHead className="min-w-[100px] w-[12%] h-10">
            Borrow APR
          </TableHead>
          <TableHead className="min-w-[130px] w-[13%] h-10 hidden md:table-cell">
            Available
          </TableHead>
          <TableHead className="min-w-[90px] w-[10%] h-10">TVL</TableHead>
          <TableHead className="min-w-[100px] w-[10%] h-10 hidden md:table-cell">
            mLTV/LT
          </TableHead>
          <TableHead className="min-w-[90px] w-[10%] h-10 hidden lg:table-cell">
            Oracle
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredMarkets.map((market, index) => (
          <React.Fragment key={market.id}>
            {/* If we only have silo0, it's both first and last */}
            {market.silo0 && !market.silo1 && (
              <SiloRow
                market={market}
                silo={market.silo0}
                showId={true}
                isFirstInMarket={true}
              />
            )}
            {/* If we have both silos, silo0 is first but not last */}
            {market.silo0 && market.silo1 && (
              <SiloRow
                market={market}
                silo={market.silo0}
                showId={true}
                isFirstInMarket={true}
              />
            )}
            {/* silo1 is never first, but is last if it exists */}
            {market.silo1 && (
              <SiloRow
                market={market}
                silo={market.silo1}
                showId={false}
                isFirstInMarket={false}
              />
            )}
          </React.Fragment>
        ))}
      </TableBody>
    </Table>
  );
};
