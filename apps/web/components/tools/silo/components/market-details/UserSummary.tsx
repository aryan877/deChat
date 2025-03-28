import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { SiloMarketDetail } from "../../types";
import {
  calculateBaseDepositAPR,
  calculateDepositAPR,
  calculateRewardsAPR,
} from "../../utils/calculators";
import { formatUSD } from "../../utils/formatters";
import { APRDisplay } from "../APRDisplay";

interface UserSummaryProps {
  market: SiloMarketDetail | undefined;
  walletAddress?: string;
}

export const UserSummary = ({ market, walletAddress }: UserSummaryProps) => {
  // If no wallet address or market, don't show anything
  if (!walletAddress || !market) return null;

  const { silo0, silo1 } = market;

  // Helper function to format position data
  const formatPosition = (silo: typeof silo0, isDebt = false) => {
    const balance = isDebt ? silo.debtBalance : silo.collateralBalance;
    const balanceValue = parseFloat(balance);

    if (balanceValue <= 0) return null;

    // Calculate token value in USD for a single unit
    const tokenUnitValue = parseInt(silo.priceUsd) / 1e6;

    // Dynamically determine appropriate decimal precision based on token value
    const getAppropriateDecimals = (unitValueUsd: number) => {
      // Higher value tokens (like BTC) should have more decimal places
      if (unitValueUsd >= 10000) return 8;
      if (unitValueUsd >= 1000) return 6;
      if (unitValueUsd >= 100) return 4;
      if (unitValueUsd >= 1) return 3;
      // For very low-value tokens, show fewer decimals
      return 2;
    };

    // Get precision based on token value, but never show less than 2 decimals
    const displayDecimals = Math.max(
      getAppropriateDecimals(tokenUnitValue),
      Math.min(2, silo.decimals)
    );

    const formattedBalance = (balanceValue / 10 ** silo.decimals).toFixed(
      displayDecimals
    );
    const valueUsd =
      (balanceValue / 10 ** silo.decimals) * (parseInt(silo.priceUsd) / 1e6);

    return {
      token: silo.symbol,
      formattedBalance,
      valueUsd,
      silo,
    };
  };

  // Get user's positions
  const depositSilo0 = formatPosition(silo0);
  const depositSilo1 = formatPosition(silo1);
  const borrowSilo0 = formatPosition(silo0, true);
  const borrowSilo1 = formatPosition(silo1, true);

  // Check if user has any positions
  const hasDeposits = depositSilo0 || depositSilo1;
  const hasBorrows = borrowSilo0 || borrowSilo1;

  if (!hasDeposits && !hasBorrows) return null;

  // Calculate totals
  const totalDepositsUsd =
    (depositSilo0?.valueUsd || 0) + (depositSilo1?.valueUsd || 0);
  const totalBorrowsUsd =
    (borrowSilo0?.valueUsd || 0) + (borrowSilo1?.valueUsd || 0);

  // Format health factor as percentage - fixed calculation
  const healthFactorPercent = market.healthFactor
    ? ((parseFloat(market.healthFactor) / 1e18) * 100).toFixed(0) + "%"
    : null;

  // Helper to render position item
  const renderPositionItem = (position: ReturnType<typeof formatPosition>) => {
    if (!position) return null;

    const siloData = position.silo;
    const isBorrowable = !siloData.isNonBorrowable;

    return (
      <div className="flex flex-col gap-1 py-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="font-medium">{position.token}</span>
            <Badge
              variant={isBorrowable ? "default" : "secondary"}
              className="text-xs py-0 px-1.5 h-5"
            >
              {isBorrowable ? "Borrowable" : "Non-borrowable"}
            </Badge>
          </div>
          <div className="text-right">
            <div>
              {position.formattedBalance} {position.token}
            </div>
            <div className="text-xs text-muted-foreground">
              {formatUSD(position.valueUsd)}
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center text-sm pl-1">
          <span className="text-muted-foreground">APR</span>
          <APRDisplay
            apr={calculateDepositAPR(siloData)}
            baseApr={calculateBaseDepositAPR(siloData)}
            rewardsApr={calculateRewardsAPR(siloData)}
            rewardTokenSymbol={
              siloData.collateralPrograms?.[0]?.rewardTokenSymbol
            }
            hasPrograms={Boolean(siloData.collateralPrograms?.length)}
          />
        </div>
      </div>
    );
  };

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-lg font-medium mb-2">Your Deposits</h3>
            {hasDeposits ? (
              <div className="space-y-1 divide-y divide-border">
                {renderPositionItem(depositSilo0)}
                {renderPositionItem(depositSilo1)}
                <div className="flex justify-between items-center pt-3 mt-1">
                  <span className="font-medium">Total</span>
                  <span className="font-medium">
                    {formatUSD(totalDepositsUsd)}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No active deposits
              </p>
            )}
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">Your Borrows</h3>
            {hasBorrows ? (
              <div className="space-y-1 divide-y divide-border">
                {renderPositionItem(borrowSilo0)}
                {renderPositionItem(borrowSilo1)}
                <div className="flex justify-between items-center pt-3 mt-1">
                  <span className="font-medium">Total</span>
                  <span className="font-medium">
                    {formatUSD(totalBorrowsUsd)}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No active borrows</p>
            )}
          </div>
        </div>

        {healthFactorPercent && (
          <div className="mt-4 pt-3 border-t border-border">
            <div className="flex justify-between items-center">
              <span className="font-medium">Health Factor</span>
              <span className="font-medium text-green-500">
                {healthFactorPercent}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
