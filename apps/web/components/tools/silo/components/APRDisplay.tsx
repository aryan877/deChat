import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import React, { useEffect, useState } from "react";
import { SiloToken } from "../types";
import { formatPercent } from "../utils/formatters";
import { APRBreakdown } from "./APRBreakdown";
import { PointsDisplay } from "./PointsDisplay";

interface APRDisplayProps {
  apr: number;
  baseApr?: number;
  rewardsApr?: number;
  rewardTokenSymbol?: string;
  points?: SiloToken["collateralPoints"] | SiloToken["debtPoints"];
  hasPrograms?: boolean;
}

export const APRDisplay: React.FC<APRDisplayProps> = ({
  apr,
  baseApr,
  rewardsApr,
  rewardTokenSymbol,
  points,
  hasPrograms = false,
}) => {
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

  // Main APR display content
  const content = (
    <div className="flex flex-col">
      <div className="flex items-center">
        <span className={cn(hasPrograms && "text-amber-600 font-medium")}>
          {formatPercent(apr)}
        </span>
        {/* Only show points badges on desktop */}
        {!isMobile && (
          <PointsDisplay points={points} compact className="ml-1.5" />
        )}
      </div>

      {hasPrograms && baseApr !== undefined && rewardsApr !== undefined && (
        <div className="flex flex-col mt-1 text-xs">
          <span className="text-muted-foreground">
            {formatPercent(baseApr)} base
          </span>
          <span className="text-amber-600">
            {formatPercent(rewardsApr)} {rewardTokenSymbol || "rewards"}
          </span>
        </div>
      )}
    </div>
  );

  // Details content for tooltips or expanded mobile view
  const detailsContent = (
    <div className="space-y-2">
      {/* APR breakdown */}
      {hasPrograms && (
        <APRBreakdown
          baseApr={baseApr}
          rewardsApr={rewardsApr}
          totalApr={apr}
          rewardTokenSymbol={rewardTokenSymbol}
          className="mb-3"
        />
      )}

      {/* Points breakdown */}
      <PointsDisplay points={points} />
    </div>
  );

  // For mobile view, always show both content and details directly
  if (isMobile) {
    return (
      <div>
        {/* Always show the APR value */}
        <div>
          <span className={cn(hasPrograms && "text-amber-600 font-medium")}>
            {formatPercent(apr)}
          </span>
        </div>

        {/* Show the full points breakdown (not just badges) */}
        {points && <PointsDisplay points={points} />}
      </div>
    );
  }

  // For desktop view, use tooltip
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="cursor-help">{content}</div>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          className="bg-popover border border-border p-3 max-w-[250px]"
        >
          {detailsContent}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
