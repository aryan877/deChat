import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { SiloMarket, SiloMarketDetail } from "../../types";
import { calculateBorrowAPR } from "../../utils/calculators";
import { formatPercent, formatUSD } from "../../utils/formatters";
import { APRDisplay } from "../APRDisplay";
import { PointsDisplay } from "../PointsDisplay";

interface BorrowProps {
  market?: SiloMarketDetail | SiloMarket;
}

export const Borrow = ({ market }: BorrowProps) => {
  const [amount, setAmount] = useState("");
  const [activeToken, setActiveToken] = useState("token0");

  const silo0 = market?.silo0;
  const silo1 = market?.silo1;

  const token = activeToken === "token0" ? silo0 : silo1;

  const handleBorrow = () => {
    // Implement borrow functionality here
    console.log(
      `Borrowing ${amount} ${token?.symbol} from market ${market?.id}`
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

  // For a real implementation, these would be calculated based on collateral
  const availableToBorrow = 0;
  const healthFactor = "healthFactor" in market ? market.healthFactor : "0";
  const newHealthFactor =
    parseFloat(healthFactor) - (parseFloat(amount) || 0) * 0.1;

  const isNonBorrowable = token?.isNonBorrowable;

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
          <h3 className="text-lg font-medium">Borrow {token?.symbol || ""}</h3>
          <p className="text-sm text-muted-foreground">
            Borrow assets from the protocol using your collateral.
          </p>

          {isNonBorrowable && (
            <div className="bg-amber-50 text-amber-800 p-3 rounded-md mt-2">
              This asset is non-borrowable. You can only supply it as
              collateral.
            </div>
          )}
        </div>

        {!isNonBorrowable && (
          <>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Amount</span>
                <span>
                  Available: {formatUSD(availableToBorrow)} {token?.symbol}
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
                  onClick={() => setAmount(availableToBorrow.toString())}
                >
                  MAX
                </Button>
              </div>
            </div>

            {token && (
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-muted-foreground">Borrow APR</div>
                <div className="text-right">
                  <div className="flex flex-row-reverse items-center gap-2">
                    <APRDisplay apr={calculateBorrowAPR(token)} />
                    {token.debtPoints && (
                      <PointsDisplay
                        points={token.debtPoints}
                        title="Borrow Points"
                      />
                    )}
                  </div>
                </div>

                <div className="text-muted-foreground">
                  Current Health Factor
                </div>
                <div className="text-right font-medium">
                  {parseFloat(healthFactor).toFixed(2)}
                </div>

                <div className="text-muted-foreground">New Health Factor</div>
                <div className="text-right font-medium">
                  {newHealthFactor <= 0 ? "N/A" : newHealthFactor.toFixed(2)}
                </div>

                <div className="text-muted-foreground">
                  Liquidation Threshold
                </div>
                <div className="text-right font-medium">
                  {formatPercent(parseInt(token.lt) / 1e18)}
                </div>

                <div className="text-muted-foreground">Price</div>
                <div className="text-right font-medium">
                  {formatUSD(parseInt(token.priceUsd) / 1e6)}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
      <CardFooter className="px-4 pb-4">
        <Button
          className="w-full"
          onClick={handleBorrow}
          disabled={
            isNonBorrowable ||
            !amount ||
            parseFloat(amount) <= 0 ||
            parseFloat(amount) > availableToBorrow ||
            !token ||
            newHealthFactor <= 1
          }
        >
          Borrow {token?.symbol}
        </Button>
      </CardFooter>
    </Card>
  );
};
