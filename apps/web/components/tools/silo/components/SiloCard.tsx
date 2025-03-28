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
  onClick?: () => void;
}

export const SiloCard = ({
  silo,
  isFirstInMarket = true,
  onClick,
}: SiloCardProps) => {
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
      onClick={onClick}
      className={cn(
        "p-2 sm:p-3 flex flex-col",
        !isFirstInMarket && "border-t border-border/40",
        onClick && "cursor-pointer transition-colors hover:bg-muted/50"
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
            <div className="font-medium text-sm sm:text-base">
              {silo.symbol || "Unknown"}
            </div>
            <div className="text-xs text-muted-foreground truncate max-w-[120px] sm:max-w-none">
              {silo.name || "Unknown"}
            </div>
          </div>
        </div>

        {/* TVL */}
        <div className="text-right">
          <div className="text-xs text-muted-foreground">TVL</div>
          <div className="text-sm sm:text-base">{formatUSD(tvlUsd)}</div>
        </div>
      </div>

      {/* APRs, liquidity and other stats */}
      <div className="grid grid-cols-1 xs:grid-cols-2 gap-x-3 gap-y-2 text-sm mt-2 sm:mt-3 flex-grow">
        {/* Deposit APR */}
        <div className="mb-2 xs:mb-0">
          <div className="text-xs text-muted-foreground mb-1">Deposit APR</div>
          <div className="flex flex-col gap-2">
            <APRDisplay
              apr={depositApr}
              baseApr={baseDepositApr}
              rewardsApr={rewardsApr}
              rewardTokenSymbol={rewardTokenSymbol}
              hasPrograms={hasCollateralPrograms}
            />
            {hasCollateralPoints && (
              <PointsDisplay
                points={silo.collateralPoints}
                title="Deposit Points"
              />
            )}
          </div>
        </div>

        {/* Borrow APR */}
        <div className="mb-2 xs:mb-0">
          <div className="text-xs text-muted-foreground mb-1">Borrow APR</div>
          {silo.isNonBorrowable ? (
            <div className="text-muted-foreground text-xs sm:text-sm">--</div>
          ) : (
            <div className="flex flex-col gap-2">
              <APRDisplay apr={borrowApr} />
              {hasDebtPoints && (
                <PointsDisplay points={silo.debtPoints} title="Borrow Points" />
              )}
            </div>
          )}
        </div>

        {/* Available to borrow */}
        <div className="mb-1 xs:mb-0">
          <div className="text-xs text-muted-foreground">Available</div>
          {silo.isNonBorrowable ? (
            <div className="text-xs text-muted-foreground">Non-borrowable</div>
          ) : (
            <div className="text-xs sm:text-sm">{formatUSD(liquidity)}</div>
          )}
        </div>

        {/* LTV/LT */}
        <div>
          <div className="text-xs text-muted-foreground">mLTV/LT</div>
          <div className="text-xs sm:text-sm">
            {formatPercent(parseInt(silo.maxLtv) / 1e18)}
            <span className="text-muted-foreground mx-1">/</span>
            {formatPercent(parseInt(silo.lt) / 1e18)}
          </div>
        </div>
      </div>
    </div>
  );
};
