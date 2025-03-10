import React from "react";
import { Check, ExternalLink } from "lucide-react";

export interface BridgeStatusSuccessProps {
  data: {
    status: string;
    orderId: string;
    orderLink: string;
  };
}

export function BridgeStatusSuccess({ data }: BridgeStatusSuccessProps) {
  return (
    <div className="flex flex-col gap-4 max-w-full">
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
            <Check className="w-6 h-6 text-green-500" />
          </div>
          <h3 className="text-xl font-semibold">Bridge Order {data.status}</h3>
        </div>

        <div className="flex flex-col items-center gap-4">
          <p className="text-sm text-muted-foreground text-center">
            Your bridge order has been successfully processed. You can track the
            details on deBridge.
          </p>

          <a
            href={data.orderLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-md hover:bg-muted transition-colors"
          >
            View on deBridge
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
