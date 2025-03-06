import React from "react";
import { Users, ExternalLink, ArrowUpRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";

export interface UnstakeSuccessData {
  txHash: string;
  explorerUrl: string;
}

interface UnstakeSuccessProps {
  data: UnstakeSuccessData;
}

export function UnstakeSuccess({ data }: UnstakeSuccessProps) {
  // Add null check to prevent destructuring errors
  if (!data) {
    return <div>No unstake data available</div>;
  }

  const { txHash, explorerUrl } = data;

  return (
    <div className="flex flex-col gap-4 max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Users className="w-5 h-5 text-primary" />
        <h3 className="text-base font-medium">Unstake Successful</h3>
      </div>

      {/* Transaction Card */}
      <div className="bg-card rounded-lg border border-border p-4">
        <div className="flex flex-col gap-4">
          {/* Transaction Hash */}
          <div className="flex flex-col gap-1">
            <span className="text-sm text-muted-foreground">
              Transaction Hash
            </span>
            <div className="flex items-center gap-2">
              <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                {txHash || "N/A"}
              </code>
              {explorerUrl && (
                <a
                  href={explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary/90 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex items-center gap-2">
            <Badge variant="default" className="bg-green-600">
              <div className="flex items-center gap-1.5">
                <ArrowUpRight className="w-3 h-3" />
                Transaction Sent
              </div>
            </Badge>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-muted/30 rounded-md p-3 text-sm text-muted-foreground">
        <p>
          Your unstake transaction has been submitted to the network. You can
          track its status using the explorer link above. The tokens will be
          available for withdrawal once the transaction is confirmed and the
          unbonding period has passed.
        </p>
      </div>
    </div>
  );
}
