import { cn } from "@/lib/utils";
import React from "react";
import { formatPercent } from "../utils/formatters";

interface APRDisplayProps {
  apr: number;
  baseApr?: number;
  rewardsApr?: number;
  rewardTokenSymbol?: string;
  hasPrograms?: boolean;
}

export const APRDisplay: React.FC<APRDisplayProps> = ({
  apr,
  baseApr,
  rewardsApr,
  rewardTokenSymbol,
  hasPrograms = false,
}) => {
  return (
    <div>
      <span className={cn(hasPrograms && "text-amber-600 font-medium")}>
        {formatPercent(apr)}
      </span>
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
};
