import React, { useState } from "react";
import { ethers } from "ethers";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Copy,
  TrendingDown,
  TrendingUp,
  Check,
} from "lucide-react";
import type { SonicTradeQuoteResponse } from "@repo/de-agent";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TradeSuccessProps {
  data: SonicTradeQuoteResponse;
}

function shortenAddress(address: string | undefined): string {
  if (!address) return "Unknown";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function getTokenInfo(data: SonicTradeQuoteResponse, isInput: boolean) {
  // For new responses with token info
  if (isInput && data?.inputToken) {
    return data.inputToken;
  }
  if (!isInput && data?.outputToken) {
    return data.outputToken;
  }

  // For legacy responses without token info
  const tokenAddress = isInput
    ? data?.inTokens?.[0] || "0x0000000000000000000000000000000000000000"
    : data?.outTokens?.[0] || "0x0000000000000000000000000000000000000000";

  // Default to SONIC for native token, USDC for others
  const isNativeToken =
    tokenAddress === "0x0000000000000000000000000000000000000000";

  return {
    address: tokenAddress,
    symbol: isNativeToken ? "SONIC" : "USDC",
    decimals: isNativeToken ? 18 : 6,
  };
}

export function TradeSuccess({ data }: TradeSuccessProps) {
  const inputTokenInfo = getTokenInfo(data, true);
  const outputTokenInfo = getTokenInfo(data, false);
  const [copiedInput, setCopiedInput] = useState(false);
  const [copiedOutput, setCopiedOutput] = useState(false);

  // Format amounts to human readable with proper decimals from token info
  const inputAmount = ethers.formatUnits(
    data?.inAmounts?.[0] || "0",
    inputTokenInfo.decimals
  );
  const outputAmount = ethers.formatUnits(
    data?.outAmounts?.[0] || "0",
    outputTokenInfo.decimals
  );

  // Calculate exchange rate
  const exchangeRate = Number(outputAmount) / (Number(inputAmount) || 1);
  const formattedExchangeRate = exchangeRate.toFixed(6);

  // Format price impact as percentage
  const priceImpactPercent = (data?.priceImpact || 0).toFixed(2);
  const isPriceImpactNegative = (data?.priceImpact || 0) < 0;

  const copyToClipboard = (text: string | undefined, isInput: boolean) => {
    if (text) {
      navigator.clipboard.writeText(text);
      if (isInput) {
        setCopiedInput(true);
        setTimeout(() => setCopiedInput(false), 2000);
      } else {
        setCopiedOutput(true);
        setTimeout(() => setCopiedOutput(false), 2000);
      }
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-xl sm:text-2xl font-bold">
          Trade Quote
        </CardTitle>
        <CardDescription>Swap tokens on Sonic</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Trade amounts */}
        <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-muted rounded-lg">
          <div className="w-full sm:w-auto space-y-1">
            <p className="text-sm text-muted-foreground">You pay</p>
            <p className="text-xl sm:text-2xl font-bold">
              {Number(inputAmount).toFixed(6)} {inputTokenInfo.symbol}
            </p>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs text-muted-foreground hover:bg-muted-foreground/10 hover:text-foreground flex items-center gap-1"
                    onClick={() =>
                      copyToClipboard(inputTokenInfo.address, true)
                    }
                  >
                    {shortenAddress(inputTokenInfo.address)}
                    {copiedInput ? (
                      <Check className="h-3 w-3 text-green-500" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Click to copy full address</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <ArrowRight className="hidden sm:block w-6 h-6 text-muted-foreground mx-4 flex-shrink-0" />

          <div className="w-full sm:w-auto space-y-1 sm:text-right">
            <p className="text-sm text-muted-foreground">You receive</p>
            <p className="text-xl sm:text-2xl font-bold">
              {Number(outputAmount).toFixed(6)} {outputTokenInfo.symbol}
            </p>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs text-muted-foreground hover:bg-muted-foreground/10 hover:text-foreground flex items-center gap-1"
                    onClick={() =>
                      copyToClipboard(outputTokenInfo.address, false)
                    }
                  >
                    {shortenAddress(outputTokenInfo.address)}
                    {copiedOutput ? (
                      <Check className="h-3 w-3 text-green-500" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Click to copy full address</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* Trade details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Exchange Rate</p>
            <p className="font-medium">
              1 {inputTokenInfo.symbol} = {formattedExchangeRate}{" "}
              {outputTokenInfo.symbol}
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Estimated Gas</p>
            <div className="space-y-1">
              <p className="font-medium">
                {Math.ceil(data?.gasEstimate || 0).toLocaleString()} gas
              </p>
              <p className="text-xs text-muted-foreground">
                ≈ {data?.gweiPerGas || 0} Gwei
              </p>
            </div>
          </div>
        </div>

        {/* Price impact */}
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Price Impact</p>
          <div className="flex items-center gap-2">
            <Badge
              variant={isPriceImpactNegative ? "destructive" : "default"}
              className="px-2 py-1"
            >
              {isPriceImpactNegative ? (
                <TrendingDown className="h-3 w-3 mr-1" />
              ) : (
                <TrendingUp className="h-3 w-3 mr-1" />
              )}
              {priceImpactPercent}%
            </Badge>
          </div>
        </div>

        {/* Warning for high price impact */}
        {(data?.priceImpact || 0) < -0.05 && (
          <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
            Warning: High price impact! This trade will move the market price by
            more than 5%.
          </div>
        )}

        {/* Additional trade info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-muted-foreground">
          <div>
            <p>Partner Fee: {(data?.partnerFeePercent || 0).toFixed(2)}%</p>
          </div>
          <div className="sm:text-right">
            <p>Block: {data?.blockNumber || "N/A"}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
