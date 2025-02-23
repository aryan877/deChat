import React from "react";
import { Globe } from "lucide-react";
import { deBridgeSupportedChainsResponse } from "@repo/de-agent";

interface SupportedChainsSuccessProps {
  data: deBridgeSupportedChainsResponse;
}

export function SupportedChainsSuccess({ data }: SupportedChainsSuccessProps) {
  return (
    <div className="flex flex-col gap-4 max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Globe className="w-5 h-5 text-primary" />
        <h3 className="text-base font-medium">Supported Chains</h3>
      </div>

      {/* Chains Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {data.chains.map((chain) => (
          <div
            key={chain.chainId}
            className="px-3 py-2 rounded-md bg-muted/50 dark:bg-muted/30 border border-border/50 text-sm"
          >
            {chain.chainName}
          </div>
        ))}
      </div>
    </div>
  );
}
