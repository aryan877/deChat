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

  // Helper function to safely format currency values
  const formatCurrency = (value: number): string => {
    // Handle extremely large values
    if (value > 1e12) {
      return "Value too large";
    }

    try {
      return value.toLocaleString(undefined, {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 2,
      });
    } catch (error) {
      console.error("Error formatting currency:", error);
      return "$0.00";
    }
  };

  // Helper function to safely format token amounts
  const formatTokenAmount = (amount: string, decimals: number): string => {
    try {
      const value = Number(amount) / 10 ** decimals;
      return value.toLocaleString(undefined, {
        maximumFractionDigits: 6,
      });
    } catch (error) {
      console.error("Error formatting token amount:", error);
      return "0";
    }
  };

  // Helper function to truncate addresses
  const truncateAddress = (address: string) => {
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

  // Render wallet connection UI if no wallet is connected
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
              <Button
                variant="outline"
                size="icon"
                onClick={() => refreshBalances()}
                disabled={isLoadingBalances || isRefetchingBalances}
              >
                {isRefetchingBalances ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
              </Button>
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
                        balances.reduce((sum, token) => {
                          // Skip tokens with unreasonably large values
                          if (token.value_usd > 1e12) return sum;
                          return sum + token.value_usd;
                        }, 0)
                      )}
                    </span>
                  </div>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Token</TableHead>
                        <TableHead>Balance</TableHead>
                        <TableHead className="text-right">Value</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {balances.map((token, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">
                            <div className="flex flex-col">
                              <div className="flex items-center gap-2">
                                <span>{token.symbol}</span>
                                {token.low_liquidity && (
                                  <Badge variant="outline" className="text-xs">
                                    Low Liquidity
                                  </Badge>
                                )}
                              </div>
                              {token.name && (
                                <span className="text-xs text-muted-foreground">
                                  {token.name}
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {formatTokenAmount(token.amount, token.decimals)}
                          </TableCell>
                          <TableCell className="text-right">
                            {token.value_usd > 1e12
                              ? "Value too large"
                              : formatCurrency(token.value_usd)}
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
                variant="outline"
                size="icon"
                onClick={() => refreshTransactions()}
                disabled={isLoadingTransactions || isFetchingNextPage}
              >
                {isFetchingNextPage ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
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
