import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { SiloMarket, SiloMarketDetail } from "../../types";
import { calculateBaseDepositAPR } from "../../utils/calculators";
import { formatPercent, formatUSD } from "../../utils/formatters";

interface WithdrawProps {
  market?: SiloMarketDetail | SiloMarket;
}

export const Withdraw = ({ market }: WithdrawProps) => {
  const [amount, setAmount] = useState("");
  const [activeToken, setActiveToken] = useState("token0");

  const silo0 = market?.silo0;
  const silo1 = market?.silo1;

  const token = activeToken === "token0" ? silo0 : silo1;

  const handleWithdraw = () => {
    // Implement withdraw functionality here
    console.log(
      `Withdrawing ${amount} ${token?.symbol} from market ${market?.id}`
    );
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

  // For a real implementation, would fetch actual supplied amounts
  const suppliedAmount = 0;

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
          <h3 className="text-lg font-medium">
            Withdraw {token?.symbol || ""}
          </h3>
          <p className="text-sm text-muted-foreground">
            Withdraw your supplied assets from the protocol.
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Amount</span>
            <span>
              Supplied: {formatUSD(suppliedAmount)} {token?.symbol}
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
              onClick={() => setAmount(suppliedAmount.toString())}
            >
              MAX
            </Button>
          </div>
        </div>

        {token && (
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="text-muted-foreground">Current Supply</div>
            <div className="text-right font-medium">
              {formatUSD(suppliedAmount)} {token.symbol}
            </div>

            <div className="text-muted-foreground">Remaining Supply</div>
            <div className="text-right font-medium">
              {formatUSD(
                Math.max(0, suppliedAmount - (parseFloat(amount) || 0))
              )}{" "}
              {token.symbol}
            </div>

            <div className="text-muted-foreground">Price</div>
            <div className="text-right font-medium">
              {formatUSD(parseInt(token.priceUsd) / 1e6)}
            </div>

            <div className="text-muted-foreground">Lost APR</div>
            <div className="text-right font-medium">
              {formatPercent(calculateBaseDepositAPR(token))}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="px-4 pb-4">
        <Button
          className="w-full"
          onClick={handleWithdraw}
          disabled={
            !amount ||
            parseFloat(amount) <= 0 ||
            parseFloat(amount) > suppliedAmount ||
            !token
          }
        >
          Withdraw {token?.symbol}
        </Button>
      </CardFooter>
    </Card>
  );
};
