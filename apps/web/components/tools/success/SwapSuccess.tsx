import React from "react";
import { ExternalLink, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface SwapSuccessData {
  txHash: string;
  explorerUrl: string;
}

interface SwapSuccessProps {
  data: SwapSuccessData;
}

export function SwapSuccess({ data }: SwapSuccessProps) {
  const { txHash, explorerUrl } = data;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <ArrowUpRight className="w-5 h-5 text-primary" />
          <CardTitle>Swap Executed Successfully</CardTitle>
        </div>
        <CardDescription>
          Your token swap has been confirmed on-chain
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Transaction Hash</p>
          <div className="flex items-center gap-2">
            <code className="font-mono text-sm break-all bg-muted px-2 py-1 rounded">
              {txHash}
            </code>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="default" className="bg-green-600">
            <div className="flex items-center gap-1.5">
              <ArrowUpRight className="w-3 h-3" />
              Transaction Sent
            </div>
          </Badge>
        </div>

        <Button
          variant="outline"
          className="w-full"
          onClick={() => window.open(explorerUrl, "_blank")}
        >
          <ExternalLink className="mr-2 h-4 w-4" />
          View on Explorer
        </Button>

        <div className="bg-muted/30 rounded-md p-3 text-sm text-muted-foreground">
          <p>
            Your swap transaction has been submitted to the network. You can
            track its status using the explorer link above.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
