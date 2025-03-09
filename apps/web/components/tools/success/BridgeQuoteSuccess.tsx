import React from "react";
import { ArrowRightLeft, Clock, Info } from "lucide-react";
import { deBridgeEnhancedQuoteResponse } from "@repo/de-agent";

interface BridgeQuoteSuccessProps {
  data: {
    data: deBridgeEnhancedQuoteResponse;
  };
}

function formatTokenAmount(amount: string, decimals: number): string {
  const value = Number(amount) / Math.pow(10, decimals);
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  });
}

function formatUsdValue(value: number | undefined): string {
  if (value === undefined) return "$0.00";
  return `$${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function getChainName(chainId: number): string {
  const chains: Record<number, string> = {
    1: "Ethereum",
    56: "BNB Chain",
    137: "Polygon",
    7565164: "Solana",
    100000014: "Sonic",
  };
  return chains[chainId] || `Chain ${chainId}`;
}

function getFeeDetails(costsDetails: any[]): {
  protocolFee: string;
  takerMargin: string;
  operatingExpenses: string;
  totalFees: number;
} {
  let protocolFee = "0";
  let takerMargin = "0";
  let operatingExpenses = "0";

  for (const detail of costsDetails) {
    if (detail.type === "DlnProtocolFee") {
      protocolFee = detail.payload.feeAmount;
    } else if (detail.type === "TakerMargin") {
      takerMargin = detail.payload.feeAmount;
    } else if (detail.type === "EstimatedOperatingExpenses") {
      operatingExpenses = detail.payload.feeAmount;
    }
  }

  const totalFees =
    Number(protocolFee) + Number(takerMargin) + Number(operatingExpenses);

  return { protocolFee, takerMargin, operatingExpenses, totalFees };
}

export function BridgeQuoteSuccess({ data }: BridgeQuoteSuccessProps) {
  const quote = data.data;
  const srcToken = quote.estimation.srcChainTokenIn;
  const dstToken = quote.estimation.dstChainTokenOut;
  const feeDetails = getFeeDetails(quote.estimation.costsDetails);

  const srcChainName = getChainName(srcToken.chainId);
  const dstChainName = getChainName(dstToken.chainId);

  const fulfillmentTime = quote.order?.approximateFulfillmentDelay || 0;
  const fulfillmentTimeText =
    fulfillmentTime < 60
      ? `~${fulfillmentTime} seconds`
      : `~${Math.ceil(fulfillmentTime / 60)} minutes`;

  return (
    <div className="flex flex-col gap-4 max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between bg-card px-4 py-3 rounded-lg border border-border">
        <div className="flex items-center gap-2">
          <ArrowRightLeft className="w-5 h-5 text-primary" />
          <h3 className="text-base font-medium">Bridge Quote</h3>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span>Estimated time: {fulfillmentTimeText}</span>
        </div>
      </div>

      {/* Token Exchange Card */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Source Token */}
            <div className="flex-1 flex flex-col items-center p-4 bg-muted/30 rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">
                From {srcChainName}
              </div>
              <div className="text-2xl font-semibold">
                {formatTokenAmount(srcToken.amount, srcToken.decimals)}{" "}
                {srcToken.symbol}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {formatUsdValue(srcToken.approximateUsdValue)}
              </div>
            </div>

            {/* Arrow */}
            <div className="flex-shrink-0">
              <ArrowRightLeft className="w-6 h-6 text-primary rotate-90 md:rotate-0" />
            </div>

            {/* Destination Token */}
            <div className="flex-1 flex flex-col items-center p-4 bg-muted/30 rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">
                To {dstChainName}
              </div>
              <div className="text-2xl font-semibold">
                {formatTokenAmount(dstToken.amount, dstToken.decimals)}{" "}
                {dstToken.symbol}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {formatUsdValue(dstToken.approximateUsdValue)}
              </div>
            </div>
          </div>
        </div>

        {/* Fee Details */}
        <div className="border-t border-border p-4">
          <h4 className="text-sm font-medium mb-3">Fee Breakdown</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                Protocol Fee (0.04%)
              </span>
              <span>
                {formatTokenAmount(feeDetails.protocolFee, dstToken.decimals)}{" "}
                {dstToken.symbol}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                Taker Margin (0.04%)
              </span>
              <span>
                {formatTokenAmount(feeDetails.takerMargin, dstToken.decimals)}{" "}
                {dstToken.symbol}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Operating Expenses</span>
              <span>
                {formatTokenAmount(
                  feeDetails.operatingExpenses,
                  dstToken.decimals
                )}{" "}
                {dstToken.symbol}
              </span>
            </div>
            <div className="flex justify-between text-sm font-medium pt-2 border-t border-border/50">
              <span>Total Fees</span>
              <span>
                {formatTokenAmount(
                  feeDetails.totalFees.toString(),
                  dstToken.decimals
                )}{" "}
                {dstToken.symbol}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="bg-muted/30 rounded-lg border border-border p-4">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-primary mt-0.5" />
          <div className="text-sm">
            <p className="mb-1">
              This quote is valid for a limited time. To proceed with the
              bridge:
            </p>
            <ol className="list-decimal list-inside space-y-1 pl-1">
              <li>Create a bridge order using this quote</li>
              <li>Execute the bridge transaction</li>
              <li>Check the transaction status to monitor progress</li>
            </ol>
            {quote.tx.allowanceTarget && (
              <p className="mt-2 text-muted-foreground">
                Token approval required: {quote.tx.allowanceTarget.slice(0, 6)}
                ...{quote.tx.allowanceTarget.slice(-4)}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
