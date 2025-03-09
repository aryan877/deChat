import React from "react";
import { Coins } from "lucide-react";
import { ethers } from "ethers";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DuneBalancesResponse, DuneTokenBalance } from "@repo/de-agent";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface BalancesSuccessProps {
  data: DuneBalancesResponse;
}

export function BalancesSuccess({ data }: BalancesSuccessProps) {
  const { wallet_address, balances } = data;

  // Sort balances by value (highest first)
  const sortedBalances = [...balances].sort(
    (a, b) => b.value_usd - a.value_usd
  );

  // Calculate total value
  const totalValue = balances.reduce((sum, token) => sum + token.value_usd, 0);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Coins className="w-5 h-5 text-primary" />
          <CardTitle>Token Balances</CardTitle>
        </div>
        <CardDescription>All token balances for wallet address</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Wallet Address</p>
          <code className="font-mono text-sm break-all bg-muted px-2 py-1 rounded">
            {wallet_address}
          </code>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">Total Value</p>
            <p className="text-xl font-bold">${totalValue.toFixed(2)}</p>
          </div>
          <p className="text-xs text-muted-foreground">
            Total of {balances.length} tokens found
          </p>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Token</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead className="text-right">Value (USD)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedBalances.map((token, index) => (
                <TokenRow key={index} token={token} />
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="bg-muted/30 rounded-md p-3 text-sm text-muted-foreground">
          <p>
            This shows all token balances in your wallet. Tokens are sorted by
            value, with the most valuable tokens listed first.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

interface TokenRowProps {
  token: DuneTokenBalance;
}

function TokenRow({ token }: TokenRowProps) {
  const {
    symbol,
    name,
    amount,
    decimals,
    price_usd,
    value_usd,
    low_liquidity,
  } = token;

  // Format the balance
  const formattedBalance = ethers.formatUnits(amount, decimals);
  const displayBalance = Number(formattedBalance).toLocaleString(undefined, {
    maximumFractionDigits: 6,
  });

  return (
    <TableRow>
      <TableCell>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-medium">{symbol}</span>
            {low_liquidity && (
              <Badge variant="outline" className="text-xs">
                Low Liquidity
              </Badge>
            )}
          </div>
          <span className="text-xs text-muted-foreground">
            {name || symbol}
          </span>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex flex-col">
          <span>{displayBalance}</span>
          <span className="text-xs text-muted-foreground">
            ${price_usd.toFixed(4)} per token
          </span>
        </div>
      </TableCell>
      <TableCell className="text-right font-medium">
        ${value_usd.toFixed(2)}
      </TableCell>
    </TableRow>
  );
}
