import React from "react";
import { Users } from "lucide-react";
import { SonicStakersResponse } from "@repo/de-agent";
import { formatEther } from "viem";

interface StakersSuccessProps {
  data: SonicStakersResponse;
}

function formatNumber(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(2)}M S`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K S`;
  }
  return `${value.toFixed(1)} S`;
}

function formatTokenAmount(hexValue: string): string {
  const value = Number(formatEther(BigInt(hexValue)));
  return formatNumber(value);
}

function calculateDelegated(totalStake: string, selfStake: string): string {
  const total = BigInt(totalStake);
  const self = BigInt(selfStake);
  return (total - self).toString();
}

export function StakersSuccess({ data }: StakersSuccessProps) {
  const activeStakers = data.data.stakers.filter((staker) => staker.isActive);
  const totalStake = activeStakers.reduce(
    (acc, staker) => acc + BigInt(staker.totalStake),
    BigInt(0)
  );

  return (
    <div className="flex flex-col gap-4 max-w-full overflow-hidden">
      {/* Header with Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="md:col-span-2 flex items-center justify-between bg-card px-4 py-3 rounded-lg border border-border">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            <h3 className="text-base font-medium">Sonic Stakers</h3>
            <span className="text-sm text-muted-foreground ml-2">
              ({activeStakers.length} active)
            </span>
          </div>
        </div>
        <div className="px-4 py-3 rounded-lg bg-muted/50 dark:bg-muted/30 border border-border/50">
          <div className="text-sm text-muted-foreground">
            Total Value Staked
          </div>
          <div className="text-lg font-semibold">
            {formatNumber(Number(formatEther(totalStake)))}
          </div>
        </div>
      </div>

      {/* Stakers Table */}
      <div className="border border-border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-muted/50">
              <th className="px-4 py-2 text-left text-sm font-medium text-muted-foreground w-8">
                #
              </th>
              <th className="px-4 py-2 text-left text-sm font-medium text-muted-foreground">
                Staker Info
              </th>
              <th className="px-4 py-2 text-right text-sm font-medium text-muted-foreground hidden md:table-cell">
                Status
              </th>
              <th className="px-4 py-2 text-right text-sm font-medium text-muted-foreground">
                Self Staked
              </th>
              <th className="px-4 py-2 text-right text-sm font-medium text-muted-foreground hidden sm:table-cell">
                Delegated
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {activeStakers.map((staker, index) => (
              <tr
                key={staker.id}
                className="hover:bg-muted/30 transition-colors"
              >
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  {index + 1}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-col">
                    <span className="font-medium text-sm">
                      {staker.stakerInfo?.name || "Unknown Staker"}
                    </span>
                    <div className="flex gap-2 items-center text-xs text-muted-foreground">
                      <span className="font-mono truncate max-w-[160px]">
                        {staker.stakerAddress}
                      </span>
                      <span className="px-1.5 py-0.5 rounded-md bg-muted">
                        ID #{staker.id}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-right hidden md:table-cell">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-500">
                    Active
                  </span>
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <span className="font-medium text-sm">
                    {formatTokenAmount(staker.stake)}
                  </span>
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap hidden sm:table-cell">
                  <span className="font-medium text-sm">
                    {formatTokenAmount(
                      calculateDelegated(staker.totalStake, staker.stake)
                    )}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
