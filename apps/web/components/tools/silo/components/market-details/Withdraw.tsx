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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useExecuteWithdraw } from "@/hooks/silo";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { SiloMarket, SiloMarketDetail, SiloTokenDetail } from "../../types";
import {
  calculateBaseDepositAPR,
  calculateTokenValueUSD,
  calculateWithdrawShares,
} from "../../utils/calculators";
import { formatPercent, formatUSD } from "../../utils/formatters";

interface WithdrawProps {
  market?: SiloMarketDetail | SiloMarket;
  chainKey?: string;
  walletAddress?: string;
  refetchUserData?: () => void;
}

/**
 * Type guard to check if a token is a SiloTokenDetail
 */
const isSiloTokenDetail = (token: any): token is SiloTokenDetail => {
  return Boolean(
    token && "tokenBalance" in token && "collateralShares" in token
  );
};

/**
 * Withdraw component for withdrawing assets from a Silo market
 */
export const Withdraw = ({
  market,
  chainKey = "sonic",
  walletAddress,
  refetchUserData,
}: WithdrawProps) => {
  // Component state
  const [tokenAmount, setTokenAmount] = useState<string>("");
  const [activeToken, setActiveToken] = useState<"token0" | "token1">("token0");
  const [isWithdrawing, setIsWithdrawing] = useState<boolean>(false);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [calculatedShares, setCalculatedShares] = useState<string>("0");

  // Access notification store
  const { addNotification } = useNotificationStore();

  // Initialize withdraw mutation hook
  const withdrawMutation = useExecuteWithdraw();

  // Extract token data from market
  const silo0 = market?.silo0;
  const silo1 = market?.silo1;
  const token = activeToken === "token0" ? silo0 : silo1;
  const tokenDetail = isSiloTokenDetail(token) ? token : null;
  const decimals = token?.decimals || 18;

  // Extract balances
  const shareBalance = tokenDetail?.collateralShares || "0";
  const suppliedAssets = tokenDetail?.collateralBalance || "0";

  // Format supplied assets with full precision using ethers.js
  const formattedSuppliedAssets = suppliedAssets
    ? ethers.formatUnits(suppliedAssets, decimals)
    : "0";

  // Calculate USD values for display
  const suppliedValueUsd = calculateTokenValueUSD(
    formattedSuppliedAssets,
    token?.priceUsd
  );

  const withdrawalUsd = calculateTokenValueUSD(tokenAmount, token?.priceUsd);

  // Calculate remaining assets after withdrawal
  const getRemainingAssets = (): string => {
    if (!tokenAmount || !suppliedAssets) return formattedSuppliedAssets;

    try {
      // Use BigInt for maximum precision
      const suppliedBigInt = BigInt(suppliedAssets);
      const withdrawalBigInt = BigInt(
        ethers.parseUnits(tokenAmount, decimals).toString()
      );

      // If withdrawal amount is greater than supplied, return 0
      if (withdrawalBigInt >= suppliedBigInt) return "0";

      // Calculate remaining with full precision
      const remainingBigInt = suppliedBigInt - withdrawalBigInt;
      return ethers.formatUnits(remainingBigInt.toString(), decimals);
    } catch (e) {
      console.error("Error calculating remaining assets:", e);
      // Fallback to less precise calculation
      const supplied = parseFloat(formattedSuppliedAssets);
      const withdrawal = parseFloat(tokenAmount);
      return Math.max(0, supplied - withdrawal).toString();
    }
  };

  // Get the remaining assets string with full precision
  const remainingAssets = getRemainingAssets();

  // Check if amount exceeds balance with proper precision comparison
  const isAmountTooLarge = (() => {
    if (!tokenAmount || !suppliedAssets) return false;
    try {
      const amountBigInt = ethers.parseUnits(tokenAmount, decimals);
      const totalBigInt = BigInt(suppliedAssets);
      return amountBigInt > totalBigInt;
    } catch (e) {
      console.error("Error checking withdrawal amount:", e);
      // Fallback to less precise comparison
      return parseFloat(tokenAmount) > parseFloat(formattedSuppliedAssets);
    }
  })();

  // Update calculated shares when token amount changes
  useEffect(() => {
    const shares = calculateWithdrawShares(tokenAmount, tokenDetail, decimals);
    setCalculatedShares(shares);
  }, [tokenAmount, tokenDetail, decimals]);

  /**
   * Handle input change with validation
   */
  const handleTokenAmountChange = (value: string): void => {
    // Only accept valid numeric input with decimal
    if (/^(\d*\.?\d*)$/.test(value)) {
      setTokenAmount(value);
    }
  };

  /**
   * Set maximum withdrawable amount with full precision
   */
  const handleSetMaxAmount = (): void => {
    if (!suppliedAssets || suppliedAssets === "0") return;

    try {
      // Use ethers to get exact precision
      setTokenAmount(formattedSuppliedAssets);
    } catch (e) {
      console.error("Error setting max withdrawal amount:", e);
    }
  };

  /**
   * Begin withdrawal process
   */
  const initiateWithdraw = (): void => {
    if (
      !tokenAmount ||
      parseFloat(tokenAmount) <= 0 ||
      !token ||
      isAmountTooLarge ||
      !walletAddress ||
      !tokenDetail
    ) {
      return;
    }

    setShowConfirmModal(true);
  };

  /**
   * Execute withdrawal transaction
   */
  const handleWithdraw = async (): Promise<void> => {
    if (!token || !walletAddress || !market || !tokenDetail) return;

    setShowConfirmModal(false);

    try {
      setIsWithdrawing(true);

      if (!tokenDetail.siloAddress || !tokenDetail.tokenAddress) {
        addNotification(
          "error",
          "Cannot withdraw: complete token details not available"
        );
        return;
      }

      // Log detailed information for debugging
      console.log("Withdrawal details:", {
        siloAddress: tokenDetail.siloAddress,
        tokenAddress: tokenDetail.tokenAddress,
        totalShares: shareBalance,
        calculatedShares,
        tokenAmount,
        decimals,
      });

      // Execute the withdraw transaction
      addNotification(
        "info",
        `Executing withdrawal for ${tokenAmount} ${token.symbol}...`
      );

      const result = await withdrawMutation.mutateAsync({
        siloAddress: tokenDetail.siloAddress,
        tokenAddress: tokenDetail.tokenAddress,
        shares: calculatedShares,
        userAddress: walletAddress,
        collateralType: 1, // Default to collateral
      });

      if (result.success) {
        addNotification(
          "success",
          `Successfully withdrew ${tokenAmount} ${token.symbol}`,
          undefined,
          result.withdrawTxHash,
          result.withdrawExplorerUrl
        );

        // Reset form and refresh data
        setTokenAmount("");
        if (refetchUserData) {
          refetchUserData();
        }
      } else {
        addNotification("error", "Withdraw failed. Please try again.");
      }
    } catch (error) {
      console.error("Withdrawal error:", error);
      addNotification("error", "Failed to complete withdraw transaction");
    } finally {
      setIsWithdrawing(false);
    }
  };

  // If market data isn't available, show placeholder
  if (!market || (!silo0 && !silo1)) {
    return (
      <Card>
        <CardContent className="p-4 text-center">
          <p className="text-muted-foreground">No market data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardContent className="p-4 space-y-4">
          {silo0 && silo1 && (
            <Tabs
              value={activeToken}
              onValueChange={(v) => setActiveToken(v as "token0" | "token1")}
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
              <div className="flex flex-col items-end">
                <span>
                  Balance: {formattedSuppliedAssets} {token?.symbol}
                </span>
                {suppliedValueUsd > 0 && (
                  <span className="text-xs text-muted-foreground">
                    ≈ {formatUSD(suppliedValueUsd)}
                  </span>
                )}
              </div>
            </div>
            <div className="relative">
              <Input
                type="text"
                placeholder="0.00"
                value={tokenAmount}
                onChange={(e) => handleTokenAmountChange(e.target.value)}
                className="pr-16"
                step="any"
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1 h-8"
                onClick={handleSetMaxAmount}
                disabled={parseFloat(suppliedAssets) <= 0}
              >
                MAX
              </Button>
            </div>
            {tokenAmount && parseFloat(tokenAmount) > 0 && (
              <div className="text-xs text-muted-foreground text-right">
                ≈ {formatUSD(withdrawalUsd)}
              </div>
            )}
          </div>

          {token && (
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="text-muted-foreground">Current Supply</div>
              <div className="text-right font-medium">
                {formattedSuppliedAssets} {token.symbol} (
                {formatUSD(suppliedValueUsd)})
              </div>

              <div className="text-muted-foreground">Remaining Supply</div>
              <div className="text-right font-medium">
                {remainingAssets} {token.symbol} (
                {formatUSD(
                  calculateTokenValueUSD(remainingAssets, token.priceUsd)
                )}
                )
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
            onClick={initiateWithdraw}
            disabled={
              !tokenAmount ||
              parseFloat(tokenAmount) <= 0 ||
              !token ||
              isAmountTooLarge ||
              !walletAddress ||
              !tokenDetail ||
              isWithdrawing ||
              withdrawMutation.isPending
            }
          >
            {!walletAddress
              ? "Connect Wallet to Withdraw"
              : isWithdrawing || withdrawMutation.isPending
                ? "Processing Withdrawal..."
                : `Withdraw ${token?.symbol}`}
          </Button>
        </CardFooter>
      </Card>

      {/* Confirmation Modal */}
      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Withdrawal</DialogTitle>
            <DialogDescription>
              You are about to withdraw {token?.symbol} from the {market?.id}{" "}
              market.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="text-muted-foreground">Amount</div>
              <div className="text-right font-medium">
                {tokenAmount} {token?.symbol}
              </div>

              <div className="text-muted-foreground">Value</div>
              <div className="text-right font-medium">
                {formatUSD(withdrawalUsd)}
              </div>

              <div className="text-muted-foreground">Remaining Balance</div>
              <div className="text-right font-medium">
                {remainingAssets} {token?.symbol} (
                {formatUSD(
                  calculateTokenValueUSD(remainingAssets, token?.priceUsd)
                )}
                )
              </div>
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
              onClick={handleWithdraw}
              disabled={isWithdrawing || withdrawMutation.isPending}
            >
              Confirm Withdrawal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
