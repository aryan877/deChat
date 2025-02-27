import React from "react";
import { ArrowUpRight, ExternalLink } from "lucide-react";
import { TransferResult } from "@repo/de-agent";

interface TransferSuccessProps {
  data: TransferResult;
}

export function TransferSuccess({ data }: TransferSuccessProps) {
  const { txHash, explorerUrl } = data;

  // Truncate the transaction hash for display
  const truncatedHash =
    txHash.length > 12
      ? `${txHash.substring(0, 6)}...${txHash.substring(txHash.length - 6)}`
      : txHash;

  return (
    <div className="flex flex-col gap-4 max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2">
        <ArrowUpRight className="w-5 h-5 text-primary" />
        <h3 className="text-base font-medium">Transaction Sent</h3>
      </div>

      {/* Transaction Details */}
      <div className="flex flex-col gap-3">
        <div className="p-4 rounded-md bg-muted/50 dark:bg-muted/30 border border-border/50">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Transaction Hash:
              </span>
              <span className="text-sm font-medium">{truncatedHash}</span>
            </div>

            <div className="flex items-center justify-end mt-1">
              <a
                href={explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
              >
                <span>View on Explorer</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        <div className="text-sm text-center text-muted-foreground">
          Your transaction has been submitted to the network and is being
          processed.
        </div>
      </div>
    </div>
  );
}
