"use client";

import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { SiloMarket, SiloToken } from "../types";
import {
  calculateAvailableLiquidity,
  calculateBaseDepositAPR,
  calculateBorrowAPR,
  calculateDepositAPR,
  calculateRewardsAPR,
  calculateTVLInUSD,
} from "../utils/calculators";
import { formatPercent, formatUSD } from "../utils/formatters";
import { APRDisplay } from "./APRDisplay";
import { NetworkIndicator } from "./NetworkIndicator";

// Helper function to get token icon from multiple sources
const getTokenIcon = (logos?: SiloToken["logos"]) => {
  if (!logos) return null;
  return (
    logos.coinGecko?.small ||
    logos.coinMarketCap?.small ||
    logos.trustWallet?.small ||
    null
  );
};

interface SiloRowProps {
  market: SiloMarket;
  silo?: SiloToken;
  showId?: boolean;
  isFirstInMarket: boolean;
}

export const SiloRow = ({
  market,
  silo,
  showId = true,
  isFirstInMarket = true,
}: SiloRowProps) => {
  if (!silo) return null;

  const depositApr = calculateDepositAPR(silo);
  const baseDepositApr = calculateBaseDepositAPR(silo);
  const rewardsApr = calculateRewardsAPR(silo);
  const borrowApr = calculateBorrowAPR(silo);
  const tvlUsd = calculateTVLInUSD(silo);
  const liquidity = calculateAvailableLiquidity(silo);

  const hasCollateralPrograms =
    silo.collateralPrograms && silo.collateralPrograms.length > 0;
  const rewardTokenSymbol =
    (hasCollateralPrograms && silo.collateralPrograms[0]?.rewardTokenSymbol) ||
    undefined;

  return (
    <TableRow
      className={cn(
        "hover:bg-muted/50 h-14",
        "border-0",
        isFirstInMarket && "border-t border-border/50"
      )}
    >
      {showId && (
        <TableCell className="font-medium">
          {market.id}
          <NetworkIndicator chainKey={market.chainKey} />
        </TableCell>
      )}
      {!showId && <TableCell className="pl-10" />}

      <TableCell>
        <div className="flex flex-col">
          <div className="flex items-center">
            {silo.logos && getTokenIcon(silo.logos) && (
              <div className="mr-2 h-5 w-5 rounded-full overflow-hidden flex-shrink-0">
                <Image
                  src={getTokenIcon(silo.logos)!}
                  alt={silo.symbol || "Token"}
                  width={20}
                  height={20}
                  className="object-cover"
                />
              </div>
            )}
            <span className="font-medium truncate max-w-[120px] sm:max-w-none">
              {silo.symbol || "Unknown"}
            </span>
          </div>
          <span className="text-xs text-muted-foreground truncate max-w-[120px] sm:max-w-none">
            {silo.name || "Unknown"}
          </span>
        </div>
      </TableCell>

      <TableCell className="px-2 sm:px-4">
        <APRDisplay
          apr={depositApr}
          baseApr={baseDepositApr}
          rewardsApr={rewardsApr}
          rewardTokenSymbol={rewardTokenSymbol}
          points={silo.collateralPoints}
          hasPrograms={hasCollateralPrograms}
        />
      </TableCell>

      <TableCell className="px-2 sm:px-4">
        {silo.isNonBorrowable ? (
          <span className="text-muted-foreground">--</span>
        ) : (
          <APRDisplay apr={borrowApr} points={silo.debtPoints} />
        )}
      </TableCell>

      <TableCell className="hidden md:table-cell px-2 sm:px-4">
        {silo.isNonBorrowable ? (
          <span className="text-xs text-muted-foreground">Non-borrowable</span>
        ) : (
          <span>{formatUSD(liquidity)}</span>
        )}
      </TableCell>

      <TableCell className="px-2 sm:px-4">
        <span>{formatUSD(tvlUsd)}</span>
      </TableCell>

      <TableCell className="hidden md:table-cell px-2 sm:px-4">
        <span className="text-foreground">
          {formatPercent(parseInt(silo.maxLtv) / 1e18)}
          <span className="text-muted-foreground mx-1">/</span>
          {formatPercent(parseInt(silo.lt) / 1e18)}
        </span>
      </TableCell>

      <TableCell className="hidden lg:table-cell px-2 sm:px-4">
        <Badge variant="outline">{silo.oracleLabel || "--"}</Badge>
      </TableCell>
    </TableRow>
  );
};
