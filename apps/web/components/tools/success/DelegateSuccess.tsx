import React from "react";
import { Users, ExternalLink, ArrowUpRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";

export interface DelegateSuccessData {
  txHash: string;
  explorerUrl: string;
}

interface DelegateSuccessProps {
  data: DelegateSuccessData;
}

export function DelegateSuccess({ data }: DelegateSuccessProps) {
  const { txHash, explorerUrl } = data;

  return (
    <div className="flex flex-col gap-4 max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Users className="w-5 h-5 text-primary" />
        <h3 className="text-base font-medium">Delegation Successful</h3>
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
                {txHash}
              </code>
              <a
                href={explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/90 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
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
          Your delegation transaction has been submitted to the network. You can
          track its status using the explorer link above. The delegation will be
          active once the transaction is confirmed.
        </p>
      </div>
    </div>
  );
}
