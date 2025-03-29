import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { SiloMarketDetail, SiloTokenDetail } from "../../types";
import {
  calculateAvailableLiquidity,
  calculateBaseDepositAPR,
  calculateBorrowAPR,
  calculateDepositAPR,
  calculateRewardsAPR,
  calculateTVLInUSD,
} from "../../utils/calculators";
import { formatPercent, formatUSD } from "../../utils/formatters";
import { APRDisplay } from "../APRDisplay";
import { PointsDisplay } from "../PointsDisplay";

interface InformationProps {
  marketDetail?: SiloMarketDetail;
}

// Helper function to format token amounts correctly
const formatTokenAmount = (
  amount: string,
  decimals: number,
  symbol: string,
  priceUsd: string = "0"
) => {
  const value = parseFloat(amount) / Math.pow(10, decimals);

  // Calculate token value in USD for a single unit
  const tokenUnitValue = parseInt(priceUsd) / 1e6;

  // Dynamically determine appropriate decimal precision based on token value
  const getAppropriateDecimals = (unitValueUsd: number, value: number) => {
    // Adjust precision based on both token value and amount
    // For tiny amounts, show more decimals regardless of token value
    if (value < 0.001) return 8;

    // For higher value tokens (like BTC), show more decimals
    if (unitValueUsd >= 10000) return value >= 1 ? 4 : 8;
    if (unitValueUsd >= 1000) return value >= 1 ? 3 : 6;
    if (unitValueUsd >= 100) return value >= 1 ? 2 : 4;

    // Default for other tokens
    return value >= 1 ? 2 : 3;
  };

  const displayDecimals = getAppropriateDecimals(tokenUnitValue, value);

  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(displayDecimals)}m`;
  } else if (value >= 1_000) {
    return `${(value / 1_000).toFixed(displayDecimals)}k`;
  } else {
    return value.toFixed(displayDecimals);
  }
};

// Reusable Silo Information Component
const SiloInformation = ({
  silo,
  marketDetail,
}: {
  silo: SiloTokenDetail;
  marketDetail?: SiloMarketDetail;
}) => {
  if (!silo) return null;

  // Get token symbol and standard token icons based on symbol
  const tokenSymbol = silo.symbol || "";
  // Get token icon from logos if available
  const tokenLogoUrl = silo.logos
    ? silo.logos.coinGecko?.small ||
      silo.logos.coinMarketCap?.small ||
      silo.logos.trustWallet?.small ||
      null
    : null;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center space-x-2 mb-4">
          <h3 className="text-lg font-medium flex items-center">
            <div className="w-6 h-6 mr-2 rounded-full bg-blue-500/90 flex items-center justify-center text-white font-semibold text-xs overflow-hidden">
              {tokenLogoUrl ? (
                <Image
                  src={tokenLogoUrl}
                  alt={`${tokenSymbol} icon`}
                  width={24}
                  height={24}
                  className="object-cover"
                />
              ) : (
                <span>{tokenSymbol.charAt(0)}</span>
              )}
            </div>
            {tokenSymbol}
          </h3>
          <Badge variant="outline">{silo.name}</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left column - APRs and Points */}
          <div className="space-y-6">
            <div>
              <div className="mb-2">
                <div className="text-sm text-muted-foreground mb-2">
                  Deposit APR
                </div>
                <div>
                  <APRDisplay
                    apr={calculateDepositAPR(silo)}
                    baseApr={calculateBaseDepositAPR(silo)}
                    rewardsApr={calculateRewardsAPR(silo)}
                    rewardTokenSymbol={
                      silo.collateralPrograms?.[0]?.rewardTokenSymbol
                    }
                    hasPrograms={
                      silo.collateralPrograms &&
                      silo.collateralPrograms.length > 0
                    }
                  />
                </div>
              </div>
            </div>

            <div>
              <div className="mb-2">
                <div className="text-sm text-muted-foreground mb-2">
                  Borrow APR
                </div>
                <div>
                  {silo.isNonBorrowable ? (
                    <div className="text-base font-semibold">
                      Non-borrowable
                    </div>
                  ) : (
                    <APRDisplay apr={calculateBorrowAPR(silo)} />
                  )}
                </div>
              </div>
            </div>

            <div>
              <div className="mb-2">
                <div className="text-sm text-muted-foreground mb-2">Points</div>
                <div className="flex flex-col gap-4">
                  {silo.collateralPoints && (
                    <div>
                      <PointsDisplay
                        points={silo.collateralPoints}
                        title="Deposit Points"
                      />
                    </div>
                  )}
                  {silo.debtPoints && !silo.isNonBorrowable && (
                    <div>
                      <PointsDisplay
                        points={silo.debtPoints}
                        title="Borrow Points"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div>
              <div className="mb-2">
                <div className="text-sm text-muted-foreground mb-2">
                  Utilization
                </div>
                <div className="text-lg font-medium">
                  {formatPercent(parseInt(silo.utilization) / 1e18)}
                </div>
              </div>
            </div>
          </div>

          {/* Right column - Metrics */}
          <div className="space-y-6">
            <div>
              <div className="text-sm text-muted-foreground mb-2">
                Available to borrow
              </div>
              <div className="flex flex-col">
                <div className="text-lg font-medium">
                  {formatTokenAmount(
                    silo.liquidity,
                    silo.decimals,
                    silo.symbol,
                    silo.priceUsd
                  )}{" "}
                  {silo.symbol}
                </div>
                <div className="text-muted-foreground">
                  {formatUSD(calculateAvailableLiquidity(silo))}
                </div>
              </div>
            </div>

            <div>
              <div className="text-sm text-muted-foreground mb-2">
                {silo.symbol} TVL
              </div>
              <div className="flex flex-col">
                <div className="text-lg font-medium">
                  {formatTokenAmount(
                    silo.collateralStoredAssets,
                    silo.decimals,
                    silo.symbol,
                    silo.priceUsd
                  )}{" "}
                  {silo.symbol}
                </div>
                <div className="text-muted-foreground">
                  {formatUSD(calculateTVLInUSD(silo))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-foreground mb-2">Oracle</div>
                <div>
                  <Badge variant="outline">{silo.oracleLabel || "--"}</Badge>
                </div>
              </div>

              <div>
                <div className="text-sm text-muted-foreground mb-2">
                  Max LTV
                </div>
                <div>{formatPercent(parseInt(silo.maxLtv) / 1e18)}</div>
              </div>

              <div>
                <div className="text-sm text-muted-foreground mb-2">
                  Liquidation threshold
                </div>
                <div>{formatPercent(parseInt(silo.lt) / 1e18)}</div>
              </div>

              <div>
                <div className="text-sm text-muted-foreground mb-2">
                  Liquidation fee
                </div>
                <div>{formatPercent(parseInt(silo.liquidationFee) / 1e18)}</div>
              </div>
            </div>

            <div>
              <div className="text-sm text-muted-foreground mb-2">
                {silo.symbol} address
              </div>
              <div className="text-sm truncate">{silo.tokenAddress}</div>
            </div>

            <div>
              <div className="text-sm text-muted-foreground mb-2">
                Silo
                {silo.siloIndex ||
                  (silo === marketDetail?.silo0 ? "0" : "1")}{" "}
                address
              </div>
              <div className="text-sm truncate">{silo.siloAddress}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const Information = ({ marketDetail }: InformationProps) => {
  const silo0 = marketDetail?.silo0;
  const silo1 = marketDetail?.silo1;

  if (!marketDetail) {
    return (
      <Card>
        <CardContent className="p-4 text-center">
          <p className="text-muted-foreground">No market data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Token Sections */}
      <div className="space-y-6">
        {/* Silo0 Section */}
        {silo0 && <SiloInformation silo={silo0} marketDetail={marketDetail} />}

        {/* Silo1 Section */}
        {silo1 && <SiloInformation silo={silo1} marketDetail={marketDetail} />}
      </div>

      {/* Market Overview Section */}
      <Card>
        <CardContent className="p-4">
          <h3 className="text-lg font-medium mb-4">Overall details</h3>

          <div className="grid grid-cols-2 gap-y-4 gap-x-8">
            <div>
              <div className="text-sm text-muted-foreground mb-2">
                Market ID
              </div>
              <div>{marketDetail.id}</div>
            </div>

            <div>
              <div className="text-sm text-muted-foreground mb-2">
                Market address
              </div>
              <div className="text-sm truncate">
                {marketDetail.configAddress}
              </div>
            </div>

            <div>
              <div className="text-sm text-muted-foreground mb-2">Reviewed</div>
              <div>{marketDetail.isVerified ? "Yes" : "No"}</div>
            </div>

            <div>
              <div className="text-sm text-muted-foreground mb-2">Deployed</div>
              <div>
                {new Date(
                  marketDetail.deployedTimestamp * 1000
                ).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </div>
            </div>

            <div>
              <div className="text-sm text-muted-foreground mb-2">
                Deployer address
              </div>
              <div className="text-sm truncate">
                {marketDetail.deployerAddress}
              </div>
            </div>

            <div>
              <div className="text-sm text-muted-foreground mb-2">
                Protocol fee
              </div>
              <div>{formatPercent(parseFloat(marketDetail.daoFee) / 100)}</div>
            </div>

            <div>
              <div className="text-sm text-muted-foreground mb-2">
                Deployer fee
              </div>
              <div>
                {formatPercent(parseFloat(marketDetail.deployerFee) / 100)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
