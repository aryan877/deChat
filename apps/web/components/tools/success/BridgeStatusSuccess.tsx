import React from "react";
import { Check, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

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

          <Button
            variant="outline"
            className="gap-2"
            onClick={() => window.open(data.orderLink, "_blank")}
          >
            View on deBridge
            <ExternalLink className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
