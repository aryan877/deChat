"use client";

import { DollarSign } from "lucide-react";

interface StatsHeaderProps {
  totalTvl: string;
}

export const StatsHeader = ({ totalTvl }: StatsHeaderProps) => {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center px-3.5 py-2 bg-blue-50 rounded-full shadow-sm border border-blue-100">
        <DollarSign className="w-4 h-4 text-blue-600 mr-1" />
        <span className="text-muted-foreground text-xs font-medium mr-1.5">
          Total TVL:
        </span>
        <span className="font-bold text-blue-700">{totalTvl}</span>
      </div>
    </div>
  );
};
