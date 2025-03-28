import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { SiloMarket, SiloMarketDetail } from "../../types";
import { formatUSD } from "../../utils/formatters";

interface RepayProps {
  market?: SiloMarketDetail | SiloMarket;
}

export const Repay = ({ market }: RepayProps) => {
  const [amount, setAmount] = useState("");
  const [activeToken, setActiveToken] = useState("token0");

  const silo0 = market?.silo0;
  const silo1 = market?.silo1;

  const token = activeToken === "token0" ? silo0 : silo1;

  const handleRepay = () => {
    // Implement repay functionality here
    console.log(`Repaying ${amount} ${token?.symbol} to market ${market?.id}`);
  };

  if (!market || (!silo0 && !silo1)) {
    return (
      <Card>
        <CardContent className="p-4 text-center">
          <p className="text-muted-foreground">No market data available</p>
        </CardContent>
      </Card>
    );
  }

  // For a real implementation, would fetch actual borrowed amounts
  const borrowedAmount = 0;

  // Check if market is SiloMarketDetail which has healthFactor
  const healthFactor = "healthFactor" in market ? market.healthFactor : "0";
  const newHealthFactor =
    parseFloat(healthFactor) + (parseFloat(amount) || 0) * 0.1;

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        {silo0 && silo1 && (
          <Tabs
            value={activeToken}
            onValueChange={setActiveToken}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="token0">{silo0.symbol}</TabsTrigger>
              <TabsTrigger value="token1">{silo1.symbol}</TabsTrigger>
            </TabsList>
          </Tabs>
        )}

        <div className="space-y-2">
          <h3 className="text-lg font-medium">Repay {token?.symbol || ""}</h3>
          <p className="text-sm text-muted-foreground">
            Repay your borrowed assets to the protocol.
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Amount</span>
            <span>
              Borrowed: {formatUSD(borrowedAmount)} {token?.symbol}
            </span>
          </div>
          <div className="relative">
            <Input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="pr-16"
            />
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1 h-8"
              onClick={() => setAmount(borrowedAmount.toString())}
            >
              MAX
            </Button>
          </div>
        </div>

        {token && (
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="text-muted-foreground">Current Debt</div>
            <div className="text-right font-medium">
              {formatUSD(borrowedAmount)} {token.symbol}
            </div>

            <div className="text-muted-foreground">Remaining Debt</div>
            <div className="text-right font-medium">
              {formatUSD(
                Math.max(0, borrowedAmount - (parseFloat(amount) || 0))
              )}{" "}
              {token.symbol}
            </div>

            <div className="text-muted-foreground">Current Health Factor</div>
            <div className="text-right font-medium">
              {parseFloat(healthFactor).toFixed(2)}
            </div>

            <div className="text-muted-foreground">New Health Factor</div>
            <div className="text-right font-medium">
              {borrowedAmount === 0 ? "N/A" : newHealthFactor.toFixed(2)}
            </div>

            <div className="text-muted-foreground">Price</div>
            <div className="text-right font-medium">
              {formatUSD(parseInt(token.priceUsd) / 1e6)}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="px-4 pb-4">
        <Button
          className="w-full"
          onClick={handleRepay}
          disabled={
            !amount ||
            parseFloat(amount) <= 0 ||
            parseFloat(amount) > borrowedAmount ||
            !token
          }
        >
          Repay {token?.symbol}
        </Button>
      </CardFooter>
    </Card>
  );
};
