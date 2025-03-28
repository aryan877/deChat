import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useEffect, useState } from "react";
import { SiloToken } from "../types";
import { formatPointsBreakdown } from "../utils/formatters";
import { DiamondIcon } from "./DiamondIcon";

interface PointsDisplayProps {
  points?: SiloToken["collateralPoints"] | SiloToken["debtPoints"];
  className?: string;
  compact?: boolean; // If true, show as badges; if false, show as a detailed list
  title?: string; // Optional title for the points display
}

export const PointsDisplay = ({
  points,
  className,
  compact = false,
  title = "Points",
}: PointsDisplayProps) => {
  const pointsData = formatPointsBreakdown(points);
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

  if (!pointsData.hasAnyPoints) {
    return null;
  }

  // Create the detailed view for tooltips or expanded display
  const detailedPointsView = (
    <div className="space-y-2">
      {title && (
        <h4 className="font-semibold text-foreground text-sm">{title}</h4>
      )}
      <div className="space-y-2">
        {pointsData.items.map((point, idx) => {
          if (point.type === "sonic") {
            return (
              <div
                key={`sonic-detail-${idx}`}
                className="text-foreground flex items-center"
              >
                <div className="mr-2 h-4 w-4 rounded-full overflow-hidden flex-shrink-0 shadow-sm">
                  <Image
                    src="/images/sonic-icon.png"
                    alt="Sonic"
                    width={16}
                    height={16}
                    className="object-cover"
                  />
                </div>
                <div className="flex gap-1 items-center text-sm">
                  <span
                    className={cn(
                      "font-medium",
                      point.hasPremium ? "text-amber-600 font-bold" : ""
                    )}
                  >
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
                <div className="mr-2 h-4 w-4 rounded-full overflow-hidden flex-shrink-0 shadow-sm">
                  <Image
                    src="/images/rings-icon.png"
                    alt="Rings"
                    width={16}
                    height={16}
                    className="object-cover"
                  />
                </div>
                <div className="flex gap-1 items-center text-sm">
                  <span
                    className={cn(
                      "font-medium",
                      point.hasPremium ? "text-amber-600 font-bold" : ""
                    )}
                  >
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
                <div className="mr-2 h-4 w-4 p-0.5 flex items-center justify-center bg-amber-100 rounded-full shadow-sm">
                  <DiamondIcon
                    className={cn(
                      point.hasPremium ? "text-amber-600" : "text-foreground"
                    )}
                  />
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <span
                    className={cn(
                      "font-medium",
                      point.hasPremium ? "font-bold text-amber-600" : ""
                    )}
                  >
                    {point.calculatedPoints}
                  </span>
                  <span>Silo points/$/day</span>
                </div>
              </div>
            );
          }

          return null;
        })}
      </div>
    </div>
  );

  // For compact view, create badges with tooltips
  if (compact) {
    const compactBadges = (
      <div className={cn("flex gap-1 items-center", className)}>
        {pointsData.items.map((point, idx) => {
          if (point.type === "sonic") {
            return (
              <div
                key={`sonic-${idx}`}
                className="h-5 w-5 rounded-full overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                title="Sonic Points"
              >
                <Image
                  src="/images/sonic-icon.png"
                  alt="Sonic"
                  width={20}
                  height={20}
                  className="object-cover"
                />
              </div>
            );
          }

          if (point.type === "rings") {
            return (
              <div
                key={`rings-${idx}`}
                className="h-5 w-5 rounded-full overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                title="Rings Points"
              >
                <Image
                  src="/images/rings-icon.png"
                  alt="Rings"
                  width={20}
                  height={20}
                  className="object-cover"
                />
              </div>
            );
          }

          if (point.type === "silo" && point.hasPremium) {
            return (
              <div
                key={`silo-${idx}`}
                className="h-5 w-5 p-0.5 flex items-center justify-center bg-amber-100 rounded-full shadow-sm hover:shadow-md transition-shadow"
                title="Premium Silo Points"
              >
                <DiamondIcon className="text-amber-600" />
              </div>
            );
          }

          return null;
        })}

        {/* Question mark badge for non-premium points */}
        {pointsData.hasAnyPoints && !pointsData.hasPremiumPoints && (
          <div
            className="h-5 w-5 p-0 flex items-center justify-center bg-blue-100 rounded-full shadow-sm hover:shadow-md transition-shadow"
            title="Points Available"
          >
            <span className="text-blue-600 text-xs font-medium">?</span>
          </div>
        )}
      </div>
    );

    // On mobile, just show the compact badges
    if (isMobile) {
      return compactBadges;
    }

    // On desktop, add tooltips
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="cursor-pointer">{compactBadges}</div>
          </TooltipTrigger>
          <TooltipContent
            side="top"
            className="bg-popover border border-border p-3 max-w-[250px]"
          >
            {detailedPointsView}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // For non-compact view, just return the detailed view
  return (
    <div className={cn("space-y-2", className)}>
      {title && (
        <h4 className="font-semibold text-foreground text-sm">{title}</h4>
      )}
      <div className="space-y-2">
        {pointsData.items.map((point, idx) => {
          if (point.type === "sonic") {
            return (
              <div
                key={`sonic-detail-${idx}`}
                className="text-foreground flex items-center"
              >
                <div className="mr-2 h-4 w-4 rounded-full overflow-hidden flex-shrink-0 shadow-sm">
                  <Image
                    src="/images/sonic-icon.png"
                    alt="Sonic"
                    width={16}
                    height={16}
                    className="object-cover"
                  />
                </div>
                <div className="flex gap-1 items-center text-sm">
                  <span
                    className={cn(
                      "font-medium",
                      point.hasPremium ? "text-amber-600 font-bold" : ""
                    )}
                  >
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
                <div className="mr-2 h-4 w-4 rounded-full overflow-hidden flex-shrink-0 shadow-sm">
                  <Image
                    src="/images/rings-icon.png"
                    alt="Rings"
                    width={16}
                    height={16}
                    className="object-cover"
                  />
                </div>
                <div className="flex gap-1 items-center text-sm">
                  <span
                    className={cn(
                      "font-medium",
                      point.hasPremium ? "text-amber-600 font-bold" : ""
                    )}
                  >
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
                <div className="mr-2 h-4 w-4 p-0.5 flex items-center justify-center bg-amber-100 rounded-full shadow-sm">
                  <DiamondIcon
                    className={cn(
                      point.hasPremium ? "text-amber-600" : "text-foreground"
                    )}
                  />
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <span
                    className={cn(
                      "font-medium",
                      point.hasPremium ? "font-bold text-amber-600" : ""
                    )}
                  >
                    {point.calculatedPoints}
                  </span>
                  <span>Silo points/$/day</span>
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
