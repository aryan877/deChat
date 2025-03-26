"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";
import { SiloToken } from "../types";
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
import { PointsDisplay } from "./PointsDisplay";

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

interface SiloCardProps {
  silo?: SiloToken;
  isFirstInMarket: boolean;
}

export const SiloCard = ({ silo, isFirstInMarket = true }: SiloCardProps) => {
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

  // Check if points exist
  const hasCollateralPoints =
    Array.isArray(silo.collateralPoints) && silo.collateralPoints.length > 0;
  const hasDebtPoints =
    Array.isArray(silo.debtPoints) && silo.debtPoints.length > 0;

  return (
    <div
      className={cn(
        "p-3 flex flex-col",
        !isFirstInMarket && "border-t border-border/40"
      )}
    >
      {/* Token info and basic stats */}
      <div className="flex justify-between items-start mb-2">
        {/* Token info */}
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
          <div>
            <div className="font-medium">{silo.symbol || "Unknown"}</div>
            <div className="text-xs text-muted-foreground">
              {silo.name || "Unknown"}
            </div>
          </div>
        </div>

        {/* TVL */}
        <div className="text-right">
          <div className="text-xs text-muted-foreground">TVL</div>
          <div>{formatUSD(tvlUsd)}</div>
        </div>
      </div>

      {/* APRs, liquidity and other stats */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mt-3 flex-grow">
        {/* Deposit APR */}
        <div>
          <div className="text-xs text-muted-foreground">Deposit APR</div>
          <APRDisplay
            apr={depositApr}
            baseApr={baseDepositApr}
            rewardsApr={rewardsApr}
            rewardTokenSymbol={rewardTokenSymbol}
            points={silo.collateralPoints}
            hasPrograms={hasCollateralPrograms}
          />
        </div>

        {/* Borrow APR */}
        <div>
          <div className="text-xs text-muted-foreground">Borrow APR</div>
          {silo.isNonBorrowable ? (
            <div className="text-muted-foreground">--</div>
          ) : (
            <APRDisplay apr={borrowApr} points={silo.debtPoints} />
          )}
        </div>

        {/* Available to borrow */}
        <div>
          <div className="text-xs text-muted-foreground">Available</div>
          {silo.isNonBorrowable ? (
            <div className="text-xs text-muted-foreground">Non-borrowable</div>
          ) : (
            <div>{formatUSD(liquidity)}</div>
          )}
        </div>

        {/* LTV/LT */}
        <div>
          <div className="text-xs text-muted-foreground">mLTV/LT</div>
          <div>
            {formatPercent(parseInt(silo.maxLtv) / 1e18)}
            <span className="text-muted-foreground mx-1">/</span>
            {formatPercent(parseInt(silo.lt) / 1e18)}
          </div>
        </div>
      </div>

      {/* Display points as badges if they exist */}
      {(hasCollateralPoints || hasDebtPoints) && (
        <div className="mt-2 flex flex-wrap gap-1">
          {hasCollateralPoints && (
            <div className="mr-1">
              <PointsDisplay points={silo.collateralPoints} compact />
            </div>
          )}
          {hasDebtPoints && <PointsDisplay points={silo.debtPoints} compact />}
        </div>
      )}
    </div>
  );
};
