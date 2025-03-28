import { useNotificationStore } from "@/app/store/notificationStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useExecuteDeposit } from "@/hooks/silo";
import { ethers } from "ethers";
import Image from "next/image";
import { useState } from "react";
import {
  SiloMarket,
  SiloMarketDetail,
  SiloToken,
  SiloTokenDetail,
} from "../../types";
import {
  calculateBaseDepositAPR,
  calculateDepositAPR,
  calculateRewardsAPR,
} from "../../utils/calculators";
import { formatUSD } from "../../utils/formatters";
import { APRDisplay } from "../APRDisplay";
import { PointsDisplay } from "../PointsDisplay";

interface DepositProps {
  market?: SiloMarketDetail | SiloMarket;
  chainKey?: string;
  walletAddress?: string;
  refetchUserData?: () => void;
}

const isSiloTokenDetail = (
  token: SiloToken | SiloTokenDetail | undefined
): token is SiloTokenDetail => {
  return !!token && "tokenBalance" in token;
};

// Wrapped Sonic address
const WRAPPED_SONIC_ADDRESS = "0x039e2fb66102314Ce7b64Ce5Ce3E5183bc94aD38";

export const Deposit = ({
  market,
  chainKey,
  walletAddress,
  refetchUserData,
}: DepositProps) => {
  const [amount, setAmount] = useState("");
  const [activeToken, setActiveToken] = useState("token0");
  const [isDepositing, setIsDepositing] = useState(false);
  const [assetType, setAssetType] = useState(1); // 1 = Collateral (Borrowable), 0 = Protected (Non-borrowable)
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Use notification store for notifications
  const { addNotification } = useNotificationStore();

  // Initialize deposit transaction preparation hook
  const depositMutation = useExecuteDeposit();

  const silo0 = market?.silo0;
  const silo1 = market?.silo1;
  const token = activeToken === "token0" ? silo0 : silo1;

  if (!market || (!silo0 && !silo1)) {
    return (
      <Card>
        <CardContent className="p-4 text-center">
          <p className="text-muted-foreground">No market data available</p>
        </CardContent>
      </Card>
    );
  }

  // Token details and calculations
  const tokenDetail = isSiloTokenDetail(token) ? token : null;
  const decimals = token?.decimals || 18;

  // Get appropriate balance based on token type
  const tokenBalance = isSiloTokenDetail(token) ? token.tokenBalance : "0";
  const nativeBalance = tokenDetail?.nativeBalance || "0";
  const tokenAddress = tokenDetail?.tokenAddress || (token as any).address;

  // Check if this is a wrapped Sonic token
  const isWrappedSonic =
    token?.symbol === "S" ||
    (tokenAddress &&
      tokenAddress.toLowerCase() === WRAPPED_SONIC_ADDRESS.toLowerCase());

  // For wrapped Sonic, use native balance if available
  const displayBalance =
    isWrappedSonic && parseFloat(nativeBalance) > 0
      ? nativeBalance
      : tokenBalance;

  // Format balance with full precision using ethers.js
  const formattedBalance = ethers.formatUnits(displayBalance || "0", decimals);

  // Calculate balance in USD for display
  const balanceUsd = displayBalance
    ? (parseFloat(displayBalance) / 10 ** decimals) *
      (parseInt(token?.priceUsd || "0") / 1e6)
    : 0;

  // Check if amount exceeds balance with proper precision comparison
  const isAmountTooLarge = (() => {
    if (!amount || !displayBalance) return false;
    try {
      const amountBigInt = ethers.parseUnits(amount, decimals);
      const balanceBigInt = BigInt(displayBalance);
      return amountBigInt > balanceBigInt;
    } catch (e) {
      console.error("Error checking amount:", e);
      // Fallback to less precise comparison if ethers fails
      return parseFloat(amount) > parseFloat(displayBalance) / 10 ** decimals;
    }
  })();

  // Set maximum balance with proper precision handling
  const handleSetMaxBalance = () => {
    if (!displayBalance || displayBalance === "0") return;

    try {
      let maxBalanceBigInt = BigInt(displayBalance);

      // If it's a native token, leave some for gas
      if (isWrappedSonic) {
        // Reserve approximately 1% or 0.01 tokens (whichever is higher) for gas
        const onePercent = (maxBalanceBigInt * BigInt(1)) / BigInt(100);
        const minReserve = ethers.parseUnits("0.01", decimals);
        const gasReserve = onePercent > minReserve ? onePercent : minReserve;

        // Never go below zero
        maxBalanceBigInt =
          maxBalanceBigInt > gasReserve
            ? maxBalanceBigInt - gasReserve
            : BigInt(0);
      }

      // Format with full precision
      setAmount(ethers.formatUnits(maxBalanceBigInt, decimals));
    } catch (e) {
      console.error("Error setting max balance:", e);
      // Fallback to less precise calculation
      const balanceNum = parseFloat(displayBalance) / 10 ** decimals;
      if (isWrappedSonic) {
        const gasBuffer = Math.max(0.01, balanceNum * 0.01);
        setAmount(Math.max(0, balanceNum - gasBuffer).toString());
      } else {
        setAmount(balanceNum.toString());
      }
    }
  };

  // Calculate amount USD value for display
  const amountUsd = amount
    ? parseFloat(amount) * (parseInt(token?.priceUsd || "0") / 1e6)
    : 0;

  const initiateDeposit = () => {
    if (
      !amount ||
      parseFloat(amount) <= 0 ||
      !token ||
      isAmountTooLarge ||
      !walletAddress
    ) {
      return;
    }

    // Show confirmation modal
    setShowConfirmModal(true);
  };

  const handleDeposit = async () => {
    if (!token || !walletAddress || !market) return;

    // Close the confirmation modal
    setShowConfirmModal(false);

    try {
      setIsDepositing(true);

      if (!tokenDetail || !tokenDetail.siloAddress) {
        addNotification(
          "error",
          "Cannot deposit: complete token details not available"
        );
        return;
      }

      // Get token address
      if (!tokenAddress) {
        addNotification("error", "Token address not available");
        return;
      }

      // Parse the amount to TokenUnits based on token decimals with maximum precision
      const amountInTokenUnits = ethers
        .parseUnits(amount, token.decimals)
        .toString();

      // Determine if this is a native token (e.g., Sonic)
      const isNative = isWrappedSonic;

      // Execute the deposit transaction
      addNotification("info", `Executing ${amount} ${token.symbol} deposit...`);

      const result = await depositMutation.mutateAsync({
        siloAddress: tokenDetail.siloAddress,
        tokenAddress: tokenAddress,
        amount: amountInTokenUnits,
        userAddress: walletAddress,
        assetType: assetType,
        isNative,
      });

      if (result.success) {
        // If there was an approval transaction
        if (result.approvalTxHash) {
          addNotification(
            "success",
            `Token approval confirmed!`,
            undefined,
            result.approvalTxHash || undefined,
            result.approvalExplorerUrl || undefined
          );
        }

        // Show deposit success message with more details
        addNotification(
          "success",
          `Transaction complete! Successfully deposited ${amount} ${token.symbol}.`,
          undefined,
          result.depositTxHash,
          result.depositExplorerUrl
        );

        // Reset the form
        setAmount("");

        // Refresh user data to show updated balances
        if (refetchUserData) {
          refetchUserData();
        }
      } else {
        addNotification("error", "Deposit failed. Please try again.");
      }
    } catch (error) {
      console.error("Deposit error:", error);
      addNotification("error", "Failed to complete deposit transaction");
    } finally {
      setIsDepositing(false);
    }
  };

  // Check if token can be borrowed
  const isBorrowable = !token?.isNonBorrowable;

  return (
    <>
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
            <h3 className="text-lg font-medium flex items-center">
              {token?.symbol ? (
                <>
                  <div className="w-6 h-6 mr-2 rounded-full bg-blue-500/90 flex items-center justify-center text-white font-semibold text-xs overflow-hidden">
                    {token.logos &&
                    (token.logos.coinGecko?.small ||
                      token.logos.coinMarketCap?.small ||
                      token.logos.trustWallet?.small) ? (
                      <Image
                        src={
                          token.logos.coinGecko?.small ||
                          token.logos.coinMarketCap?.small ||
                          token.logos.trustWallet?.small ||
                          ""
                        }
                        alt={`${token.symbol} icon`}
                        width={24}
                        height={24}
                        className="object-cover"
                      />
                    ) : (
                      <span>{token.symbol.charAt(0)}</span>
                    )}
                  </div>
                  Deposit {token.symbol}
                </>
              ) : (
                "Deposit"
              )}
            </h3>
            <p className="text-sm text-muted-foreground">
              Supply assets to the protocol and earn interest.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Amount</span>
              <div className="flex flex-col items-end">
                <span>
                  Balance: {formattedBalance} {token?.symbol}
                  {isWrappedSonic &&
                    parseFloat(nativeBalance) > 0 &&
                    " (Native)"}
                </span>
                {balanceUsd > 0 && (
                  <span className="text-xs text-muted-foreground">
                    ≈ {formatUSD(balanceUsd)}
                  </span>
                )}
              </div>
            </div>
            <div className="relative">
              <Input
                type="text"
                placeholder="0.00"
                value={amount}
                onChange={(e) => {
                  // Only accept valid decimal input
                  if (/^(\d*\.?\d*)$/.test(e.target.value)) {
                    setAmount(e.target.value);
                  }
                }}
                className="pr-16"
                step="any"
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8"
                onClick={handleSetMaxBalance}
                disabled={parseFloat(displayBalance) <= 0}
              >
                MAX
              </Button>
            </div>
            {amount && (
              <div className="text-xs text-muted-foreground text-right">
                ≈ {formatUSD(amountUsd)}
              </div>
            )}
          </div>

          {isBorrowable && (
            <div className="flex items-center justify-between border rounded-md p-3">
              <div className="space-y-1">
                <h4 className="font-medium">Deposit Type</h4>
                <p className="text-sm text-muted-foreground">
                  {assetType === 1
                    ? "Borrowable deposit (Yes): Deposits can be collateral for loans and accrue interest."
                    : "Borrowable deposit (No): Deposits can be collateral for loans without generating interest. Withdrawals are possible even when utilization reaches 100%."}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-sm ${assetType === 0 ? "text-muted-foreground" : "font-medium"}`}
                >
                  Borrowable
                </span>
                <Switch
                  checked={assetType === 1}
                  onCheckedChange={(checked) => setAssetType(checked ? 1 : 0)}
                />
              </div>
            </div>
          )}

          {token && (
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="text-muted-foreground">Supply APR</div>
              <div className="text-right">
                <div className="flex flex-row-reverse items-center gap-2">
                  <APRDisplay
                    apr={calculateDepositAPR(token)}
                    baseApr={calculateBaseDepositAPR(token)}
                    rewardsApr={calculateRewardsAPR(token)}
                    rewardTokenSymbol={
                      token.collateralPrograms?.[0]?.rewardTokenSymbol
                    }
                    hasPrograms={Boolean(token.collateralPrograms?.length)}
                  />
                </div>
              </div>

              <div className="text-muted-foreground">Price</div>
              <div className="text-right font-medium">
                {formatUSD(parseInt(token.priceUsd) / 1e6)}
              </div>

              {token.collateralPoints && (
                <>
                  <div className="text-muted-foreground col-span-2 pt-2 border-t border-border mt-1">
                    Points
                  </div>
                  <div className="col-span-2">
                    <PointsDisplay
                      points={token.collateralPoints}
                      title="Deposit Points"
                    />
                  </div>
                </>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter className="px-4 pb-4">
          <Button
            className="w-full"
            onClick={initiateDeposit}
            disabled={
              !amount ||
              parseFloat(amount) <= 0 ||
              !token ||
              isAmountTooLarge ||
              !walletAddress ||
              isDepositing ||
              depositMutation.isPending
            }
          >
            {!walletAddress
              ? "Connect Wallet to Deposit"
              : isDepositing || depositMutation.isPending
                ? "Executing Deposit..."
                : `Deposit ${token?.symbol}`}
          </Button>
        </CardFooter>
      </Card>

      {/* Confirmation Modal */}
      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Deposit</DialogTitle>
            <DialogDescription>
              You are about to deposit {token?.symbol} into the {market?.id}{" "}
              market. Please review the details below.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-muted-foreground">Amount</div>
              <div className="text-right font-medium">
                {amount} {token?.symbol}
              </div>

              <div className="text-muted-foreground">Value</div>
              <div className="text-right font-medium">
                {formatUSD(amountUsd)}
              </div>

              <div className="text-muted-foreground">Deposit Type</div>
              <div className="text-right font-medium">
                {assetType === 1 ? "Borrowable (Yes)" : "Borrowable (No)"}
              </div>

              <div className="text-muted-foreground">Expected APR</div>
              <div className="text-right">
                <APRDisplay
                  apr={calculateDepositAPR(token)}
                  baseApr={calculateBaseDepositAPR(token)}
                  rewardsApr={calculateRewardsAPR(token)}
                />
              </div>

              {isWrappedSonic && (
                <>
                  <div className="text-muted-foreground">Note</div>
                  <div className="text-right text-amber-600 font-medium">
                    Gas fees will be charged in {token?.symbol}
                  </div>
                </>
              )}
            </div>
          </div>

          <DialogFooter className="sm:justify-between">
            <Button
              variant="outline"
              onClick={() => setShowConfirmModal(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeposit}
              disabled={isDepositing || depositMutation.isPending}
            >
              Confirm Deposit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
