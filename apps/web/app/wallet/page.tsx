"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSonicBalances, useSonicTransactions } from "@/hooks/useSonic";
import {
  Loader2,
  RefreshCw,
  ArrowDown,
  ArrowUp,
  ExternalLink,
  Send,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { usePrivy } from "@privy-io/react-auth";
import { WalletInfo } from "@/components/chat/WalletInfo";
import { AppLayout } from "@/components/layout/AppLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useNotificationStore } from "@/app/store/notificationStore";
import { useSonicTransfer } from "@/hooks/useSonic";

interface Token {
  address?: string;
  symbol: string;
  name?: string;
  decimals: number;
  amount: string;
  value_usd: number;
  low_liquidity?: boolean;
}

export default function WalletPage() {
  const { user } = usePrivy();
  const walletAddress = user?.wallet?.address;

  // Balances data
  const {
    balances,
    isLoading: isLoadingBalances,
    isRefetching: isRefetchingBalances,
    refreshBalances,
  } = useSonicBalances(walletAddress);

  // Transactions data
  const {
    transactions,
    isLoading: isLoadingTransactions,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refreshTransactions,
  } = useSonicTransactions(walletAddress);

  // Transfer state
  const [recipientAddress, setRecipientAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedToken, setSelectedToken] = useState<Token>({
    symbol: "S",
    decimals: 18,
    amount: "0",
    value_usd: 0,
  });

  const { transferTokens, isTransferring, reset } = useSonicTransfer();

  // Notification store
  const { addNotification } = useNotificationStore();

  // Helper function to safely format currency values
  const formatCurrency = (value: number | undefined | null): string => {
    // Handle undefined, null, or NaN values
    if (value === undefined || value === null || isNaN(value)) {
      return "$0.00";
    }

    // Handle extremely large values
    if (value > 1e12) {
      return "Value too large";
    }

    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 2,
      }).format(value);
    } catch (error) {
      console.error("Error formatting currency:", error);
      return "$0.00";
    }
  };

  // Helper function to safely format token amounts
  const formatTokenAmount = (
    amount: string | undefined | null,
    decimals: number
  ): string => {
    if (!amount) {
      return "0";
    }

    try {
      const value = Number(amount) / 10 ** decimals;
      if (isNaN(value)) {
        return "0";
      }
      return new Intl.NumberFormat("en-US", {
        maximumFractionDigits: 6,
      }).format(value);
    } catch (error) {
      console.error("Error formatting token amount:", error);
      return "0";
    }
  };

  // Helper function to truncate addresses
  const truncateAddress = (address: string | undefined): string => {
    if (!address) {
      return "Invalid Address";
    }
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Helper function to get transaction icon based on type
  const getTransactionIcon = (txType: string) => {
    switch (txType) {
      case "Sent":
        return <ArrowUp className="h-4 w-4 text-red-500" />;
      case "Received":
        return <ArrowDown className="h-4 w-4 text-green-500" />;
      default:
        return <ExternalLink className="h-4 w-4 text-blue-500" />;
    }
  };

  const handleTransfer = async () => {
    if (!walletAddress || !recipientAddress || !amount) {
      addNotification("error", "Please fill all fields");
      return;
    }

    try {
      // Call the backend API to handle the transfer
      const result = await transferTokens({
        toAddress: recipientAddress,
        amount,
        tokenAddress:
          selectedToken.symbol === "SONIC" ? undefined : selectedToken.address,
      });

      addNotification("success", `Transfer successful!`, {
        txHash: result.txHash,
      });
      setIsDialogOpen(false);

      // Reset form
      setRecipientAddress("");
      setAmount("");
      setSelectedToken({
        symbol: "SONIC",
        decimals: 18,
        amount: "0",
        value_usd: 0,
      });

      // Refresh balances
      refreshBalances();
    } catch (err) {
      addNotification(
        "error",
        `Transfer failed: ${err instanceof Error ? err.message : "Unknown error"}`
      );
    }
  };

  // Reset form when dialog closes
  const handleDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setRecipientAddress("");
      setAmount("");
      setSelectedToken({
        symbol: "S",
        decimals: 18,
        amount: "0",
        value_usd: 0,
      });
      reset();
    } else if (open && !isDialogOpen) {
      // This is triggered when opening from the top button
      // Find the native S token in balances
      const nativeToken = balances.find((token) => token.symbol === "S");
      if (nativeToken) {
        setSelectedToken(nativeToken);
      }
    }
  };

  const handleTokenTransfer = (token: Token) => {
    setSelectedToken(token);
    setIsDialogOpen(true);
  };

  // Handle setting max amount
  const handleSetMaxAmount = () => {
    if (selectedToken) {
      setAmount(
        formatTokenAmount(selectedToken.amount, selectedToken.decimals)
      );
    }
  };

  // Handle setting half amount
  const handleSetHalfAmount = () => {
    if (selectedToken) {
      const tokenAmount =
        Number(selectedToken.amount) / 10 ** selectedToken.decimals;
      const halfAmount = (tokenAmount / 2).toString();
      setAmount(halfAmount);
    }
  };

  if (!walletAddress) {
    return (
      <AppLayout title="Sonic Wallet">
        <p className="text-muted-foreground mb-6">
          Connect your wallet to view balances and transactions on the Sonic
          chain.
        </p>

        <div className="max-w-md mx-auto border border-border rounded-lg p-6 bg-muted/30">
          <WalletInfo onLogoutClick={() => {}} />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Sonic Wallet">
      <p className="text-muted-foreground">
        View your balances and transactions on the Sonic chain.
      </p>

      <Tabs defaultValue="balances" className="mt-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="balances">Balances</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>

        {/* Balances Tab */}
        <TabsContent value="balances" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Token Balances</CardTitle>
                <CardDescription className="mt-1">
                  {truncateAddress(walletAddress)}
                </CardDescription>
              </div>
              <div className="flex gap-3 items-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => refreshBalances()}
                  disabled={isLoadingBalances || isRefetchingBalances}
                  className="h-10 w-10 p-0"
                >
                  {isRefetchingBalances ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <RefreshCw className="h-5 w-5" />
                  )}
                </Button>

                <Dialog
                  open={isDialogOpen}
                  onOpenChange={handleDialogOpenChange}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="default"
                      size="default"
                      className="h-10 px-4 font-medium"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Transfer S
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden">
                    <div className="bg-primary/5 px-6 py-5 border-b">
                      <DialogTitle className="text-xl">
                        Transfer {selectedToken.symbol}
                      </DialogTitle>
                      <DialogDescription className="mt-1.5">
                        Send {selectedToken.symbol} to another wallet on the
                        Sonic Mainnet.
                      </DialogDescription>
                    </div>

                    <div className="p-6">
                      <div className="space-y-5">
                        <div className="space-y-2.5">
                          <Label
                            htmlFor="recipient"
                            className="text-sm font-medium"
                          >
                            Recipient Address
                          </Label>
                          <Input
                            id="recipient"
                            placeholder="0x..."
                            className="h-11"
                            value={recipientAddress}
                            onChange={(e) =>
                              setRecipientAddress(e.target.value)
                            }
                          />
                        </div>

                        <div className="space-y-2.5">
                          <div className="flex justify-between items-center">
                            <Label
                              htmlFor="amount"
                              className="text-sm font-medium"
                            >
                              Amount
                            </Label>
                            <div className="flex gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-6 text-xs px-2"
                                onClick={handleSetHalfAmount}
                              >
                                Half
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-6 text-xs px-2"
                                onClick={handleSetMaxAmount}
                              >
                                Max
                              </Button>
                            </div>
                          </div>
                          <div className="relative">
                            <Input
                              id="amount"
                              type="number"
                              placeholder="0.01"
                              className="h-11 pr-16"
                              value={amount}
                              onChange={(e) => setAmount(e.target.value)}
                            />
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm font-medium text-muted-foreground">
                              {selectedToken.symbol}
                            </div>
                          </div>
                          {selectedToken && (
                            <p className="text-xs text-muted-foreground">
                              Balance:{" "}
                              {formatTokenAmount(
                                selectedToken.amount,
                                selectedToken.decimals
                              )}{" "}
                              {selectedToken.symbol}
                            </p>
                          )}
                        </div>

                        <div className="rounded-md bg-muted/50 p-3 text-xs text-muted-foreground">
                          <p>
                            Note: Only Sonic Mainnet transfers are supported.
                            Your transaction will be signed using your connected
                            wallet.
                          </p>
                        </div>
                      </div>

                      <div className="flex justify-end gap-3 mt-6">
                        <DialogClose asChild>
                          <Button
                            variant="outline"
                            size="default"
                            className="min-w-[80px]"
                          >
                            Cancel
                          </Button>
                        </DialogClose>
                        <Button
                          onClick={handleTransfer}
                          disabled={
                            isTransferring || !recipientAddress || !amount
                          }
                          size="default"
                          className="min-w-[100px]"
                        >
                          {isTransferring ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Sending...
                            </>
                          ) : (
                            "Transfer"
                          )}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingBalances ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ) : balances.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Total Value</h3>
                    <span className="text-lg font-bold">
                      {formatCurrency(
                        balances?.reduce((sum, token) => {
                          // Skip tokens with unreasonably large values or invalid values
                          if (
                            !token?.value_usd ||
                            token.value_usd > 1e12 ||
                            isNaN(token.value_usd)
                          ) {
                            return sum;
                          }
                          return sum + token.value_usd;
                        }, 0) ?? 0
                      )}
                    </span>
                  </div>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="h-11">Token</TableHead>
                        <TableHead className="h-11">Balance</TableHead>
                        <TableHead className="h-11 text-right">Value</TableHead>
                        <TableHead className="h-11 text-right">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {balances?.map((token, index) => (
                        <TableRow key={index} className="h-16">
                          <TableCell className="font-medium align-middle">
                            <div className="flex flex-col">
                              <div className="flex items-center gap-2">
                                <span className="inline-block">
                                  {token?.symbol || "Unknown"}
                                </span>
                                {token?.low_liquidity && (
                                  <Badge variant="outline" className="text-xs">
                                    Low Liquidity
                                  </Badge>
                                )}
                              </div>
                              {token?.symbol === "S" ? (
                                <span className="text-xs text-muted-foreground mt-0.5">
                                  Native
                                </span>
                              ) : token?.name ? (
                                <span className="text-xs text-muted-foreground mt-0.5">
                                  {token.name}
                                </span>
                              ) : (
                                <span className="text-xs text-transparent mt-0.5">
                                  placeholder
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="align-middle">
                            {formatTokenAmount(
                              token?.amount,
                              token?.decimals || 18
                            )}
                          </TableCell>
                          <TableCell className="text-right align-middle">
                            {token?.value_usd > 1e12
                              ? "Value too large"
                              : formatCurrency(token?.value_usd)}
                          </TableCell>
                          <TableCell className="text-right p-0 pr-4 align-middle">
                            <div className="flex justify-end">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleTokenTransfer(token)}
                                className="h-9"
                              >
                                <Send className="h-4 w-4 mr-1.5" />
                                Transfer
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    No tokens found for this wallet on Sonic chain.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Transaction History</CardTitle>
                <CardDescription className="mt-1">
                  {truncateAddress(walletAddress)}
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => refreshTransactions()}
                disabled={isLoadingTransactions || isFetchingNextPage}
                className="h-10 w-10 p-0"
              >
                {isFetchingNextPage ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <RefreshCw className="h-5 w-5" />
                )}
              </Button>
            </CardHeader>
            <CardContent>
              {isLoadingTransactions ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ) : transactions.length > 0 ? (
                <div className="space-y-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Hash</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead className="text-right">Value</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map((tx, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getTransactionIcon(tx.txType)}
                              <span>{tx.txType}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <a
                              href={`https://sonicscan.org/tx/${tx.hash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:underline flex items-center gap-1"
                            >
                              {truncateAddress(tx.hash)}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </TableCell>
                          <TableCell>{tx.formattedDate}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className="font-mono text-xs"
                            >
                              {tx.methodName}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {tx.valueInEth} S
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {hasNextPage && (
                    <div className="flex justify-center mt-4">
                      <Button
                        variant="outline"
                        onClick={() => fetchNextPage()}
                        disabled={isFetchingNextPage}
                      >
                        {isFetchingNextPage ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Loading...
                          </>
                        ) : (
                          "Load More"
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    No transactions found for this wallet on Sonic chain.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
}
