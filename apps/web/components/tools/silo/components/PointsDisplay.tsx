import { cn } from "@/lib/utils";
import Image from "next/image";
import { SiloToken } from "../types";
import { formatPointsBreakdown } from "../utils/formatters";
import { DiamondIcon } from "./DiamondIcon";

interface PointsDisplayProps {
  points?: SiloToken["collateralPoints"] | SiloToken["debtPoints"];
  className?: string;
  compact?: boolean; // If true, show as badges; if false, show as a detailed list
}

export const PointsDisplay = ({
  points,
  className,
  compact = false,
}: PointsDisplayProps) => {
  const pointsData = formatPointsBreakdown(points);

  if (!pointsData.hasAnyPoints) {
    return null;
  }

  if (compact) {
    return (
      <div className={cn("flex gap-1", className)}>
        {pointsData.items.map((point, idx) => {
          if (point.type === "sonic") {
            return (
              <div
                key={`sonic-${idx}`}
                className="h-4 w-4 rounded-full overflow-hidden"
              >
                <Image
                  src="/images/sonic-icon.png"
                  alt="Sonic"
                  width={16}
                  height={16}
                  className="object-cover"
                />
              </div>
            );
          }

          if (point.type === "rings") {
            return (
              <div
                key={`rings-${idx}`}
                className="h-4 w-4 rounded-full overflow-hidden"
              >
                <Image
                  src="/images/rings-icon.png"
                  alt="Rings"
                  width={16}
                  height={16}
                  className="object-cover"
                />
              </div>
            );
          }

          if (point.type === "silo" && point.hasPremium) {
            return (
              <div
                key={`silo-${idx}`}
                className="h-4 w-4 p-0 flex items-center justify-center bg-amber-100 rounded"
              >
                <DiamondIcon className="text-amber-600" />
              </div>
            );
          }

          return null;
        })}

        {/* Question mark badge for non-premium points */}
        {pointsData.hasAnyPoints && !pointsData.hasPremiumPoints && (
          <div className="h-4 w-4 p-0 flex items-center justify-center bg-blue-100 rounded hover:bg-blue-200">
            <span className="text-blue-600">?</span>
          </div>
        )}
      </div>
    );
  }

  // Detailed view for tooltips or expanded display
  return (
    <div className={cn("space-y-2", className)}>
      <h4 className="font-semibold text-foreground text-sm mb-2">
        Points Breakdown
      </h4>
      <div className="space-y-2">
        {pointsData.items.map((point, idx) => {
          if (point.type === "sonic") {
            return (
              <div
                key={`sonic-detail-${idx}`}
                className="text-foreground flex items-center"
              >
                <div className="mr-2 h-4 w-4 rounded-full overflow-hidden flex-shrink-0">
                  <Image
                    src="/images/sonic-icon.png"
                    alt="Sonic"
                    width={16}
                    height={16}
                    className="object-cover"
                  />
                </div>
                <div className="flex gap-2 items-center">
                  <span className={cn(point.hasPremium ? "font-bold" : "")}>
                    {point.multiplier}x
                  </span>
                  <span>Sonic points</span>
                </div>
              </div>
            );
          }

          if (point.type === "rings") {
            return (
              <div
                key={`rings-detail-${idx}`}
                className="text-foreground flex items-center"
              >
                <div className="mr-2 h-4 w-4 rounded-full overflow-hidden flex-shrink-0">
                  <Image
                    src="/images/rings-icon.png"
                    alt="Rings"
                    width={16}
                    height={16}
                    className="object-cover"
                  />
                </div>
                <div className="flex gap-2 items-center">
                  <span className={cn(point.hasPremium ? "font-bold" : "")}>
                    {point.multiplier}x
                  </span>
                  <span>Rings points</span>
                </div>
              </div>
            );
          }

          if (point.type === "silo") {
            return (
              <div
                key={`silo-detail-${idx}`}
                className="text-foreground flex items-center"
              >
                <div className="mr-2 h-4 w-4 rounded-full overflow-hidden flex-shrink-0">
                  <DiamondIcon
                    className={cn(
                      point.hasPremium ? "text-amber-600" : "text-foreground"
                    )}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      point.hasPremium ? "font-bold text-amber-600" : ""
                    )}
                  >
                    {point.calculatedPoints}
                  </span>
                  <span>Silo points per $ / day</span>
                </div>
              </div>
            );
          }

          return null;
        })}
      </div>
    </div>
  );
};
