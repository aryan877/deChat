import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowDownUp, CheckCircle, ExternalLink } from "lucide-react";

export interface SwapSuccessData {
  txHash: string;
  explorerUrl: string;
  provider?: "odos" | "magpie";
}

interface SwapSuccessProps {
  data: SwapSuccessData;
}

function getProviderName(data: SwapSuccessData): string {
  if (data?.provider) {
    return data.provider === "odos" ? "ODOS" : "Magpie";
  }

  return "ODOS";
}

function getBadgeColor(provider: string): string {
  return provider === "ODOS" ? "bg-purple-600" : "bg-blue-600";
}

export function SwapSuccess({ data }: SwapSuccessProps) {
  const { txHash, explorerUrl } = data;
  const providerName = getProviderName(data);
  const providerBadgeColor = getBadgeColor(providerName);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <CardTitle>Swap Executed Successfully</CardTitle>
          </div>
          <Badge className={providerBadgeColor}>
            <ArrowDownUp className="h-3 w-3 mr-1" />
            {providerName}
          </Badge>
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
              <CheckCircle className="w-3 h-3" />
              Transaction Confirmed
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
            Your swap transaction has been successfully executed via{" "}
            {providerName}. You can view the complete details using the explorer
            link above.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
