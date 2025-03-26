import { cn } from "@/lib/utils";
import { formatPercent } from "../utils/formatters";

interface APRBreakdownProps {
  baseApr?: number;
  rewardsApr?: number;
  totalApr: number;
  rewardTokenSymbol?: string;
  className?: string;
}

export const APRBreakdown = ({
  baseApr,
  rewardsApr,
  totalApr,
  rewardTokenSymbol,
  className,
}: APRBreakdownProps) => {
  // If we don't have base and rewards separate, don't show breakdown
  if (baseApr === undefined || rewardsApr === undefined) {
    return null;
  }

  return (
    <div className={cn("space-y-1", className)}>
      <h4 className="font-semibold text-foreground text-sm">APR Breakdown</h4>
      <div className="flex justify-between">
        <span>Base APR:</span>
        <span>{formatPercent(baseApr)}</span>
      </div>
      <div className="flex justify-between text-amber-600">
        <span>Rewards APR ({rewardTokenSymbol || "rewards"}):</span>
        <span>{formatPercent(rewardsApr)}</span>
      </div>
      <div className="flex justify-between font-medium pt-1 border-t">
        <span>Total APR:</span>
        <span>{formatPercent(totalApr)}</span>
      </div>
    </div>
  );
};
