import { Button } from "@/components/ui/button";
import { Check, Copy } from "lucide-react";
import { useState } from "react";

export interface BridgeTransferSuccessProps {
  data: {
    txHash: string;
  };
}

export function BridgeTransferSuccess({ data }: BridgeTransferSuccessProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(data.txHash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
  };

  return (
    <div className="flex flex-col gap-4 max-w-full">
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
            <Check className="w-6 h-6 text-green-500" />
          </div>
          <h3 className="text-xl font-semibold">Bridge Transfer Initiated</h3>
        </div>

        <div className="flex flex-col items-center gap-4">
          <p className="text-sm text-muted-foreground text-center">
            Your bridge transfer has been initiated successfully. You can copy
            the transaction hash below.
          </p>

          <div className="flex items-center gap-2">
            <code className="bg-muted px-3 py-1 rounded text-sm">
              {data.txHash.slice(0, 6)}...{data.txHash.slice(-4)}
            </code>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={copyToClipboard}
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
