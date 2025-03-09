import React from "react";
import { Trophy, Star, Users, Calendar } from "lucide-react";
import { format } from "date-fns";
import type { SonicPointsResponse } from "@repo/de-agent";

export interface SonicPointsSuccessProps {
  data: SonicPointsResponse;
}

export function SonicPointsSuccess({ data }: SonicPointsSuccessProps) {
  return (
    <div className="flex flex-col gap-4 max-w-full">
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
            <Trophy className="w-6 h-6 text-purple-500" />
          </div>
          <h3 className="text-xl font-semibold">Sonic Points</h3>
        </div>

        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-md">
              <Star className="w-5 h-5 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">Sonic Points</p>
                <p className="font-medium">
                  {data.sonic_points.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-md">
              <Users className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Rank</p>
                <p className="font-medium">#{data.rank.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-md">
              <Star className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">
                  Passive Liquidity Points
                </p>
                <p className="font-medium">
                  {data.passive_liquidity_points.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-md">
              <Star className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">
                  Active Liquidity Points
                </p>
                <p className="font-medium">
                  {data.active_liquidity_points.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-md">
              <Star className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">
                  Ecosystem Points
                </p>
                <p className="font-medium">
                  {data.ecosystem_points.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-md">
              <Star className="w-5 h-5 text-pink-500" />
              <div>
                <p className="text-sm text-muted-foreground">
                  Loyalty Multiplier
                </p>
                <p className="font-medium">x{data.loyalty_multiplier}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-md">
            <Calendar className="w-5 h-5 text-cyan-500" />
            <div>
              <p className="text-sm text-muted-foreground">
                Last Activity Detected
              </p>
              <p className="font-medium">
                {format(new Date(data.user_activity_last_detected), "PPP")}
              </p>
            </div>
          </div>

          <div className="mt-2 text-xs text-muted-foreground">
            <p>Wallet Address: {data.wallet_address}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
