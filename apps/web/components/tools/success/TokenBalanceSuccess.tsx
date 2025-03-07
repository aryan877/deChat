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

export interface TokenBalanceSuccessData {
  address: string;
  tokenAddress: string;
  balance: string;
  symbol: string;
  name: string;
  decimals: number;
}

interface TokenBalanceSuccessProps {
  data: TokenBalanceSuccessData;
}

export function TokenBalanceSuccess({ data }: TokenBalanceSuccessProps) {
  const { address, tokenAddress, balance, symbol, name, decimals } = data;
  const formattedBalance = balance
    ? ethers.formatUnits(balance, decimals)
    : "0";
  const balanceInWei = balance || "0";

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Coins className="w-5 h-5 text-primary" />
          <CardTitle>Token Balance</CardTitle>
        </div>
        <CardDescription>
          {name} ({symbol}) token balance
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Wallet Address</p>
          <code className="font-mono text-sm break-all bg-muted px-2 py-1 rounded">
            {address}
          </code>
        </div>

        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Token Contract</p>
          <code className="font-mono text-sm break-all bg-muted px-2 py-1 rounded">
            {tokenAddress}
          </code>
        </div>

        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Balance</p>
          <p className="text-2xl font-bold">
            {Number(formattedBalance).toFixed(6)} {symbol}
          </p>
          <p className="text-xs text-muted-foreground">
            {balanceInWei} (raw amount)
          </p>
        </div>

        <div className="bg-muted/30 rounded-md p-3 text-sm text-muted-foreground">
          <p>
            This shows your balance of {name} ({symbol}) tokens. The balance is
            shown in both human-readable format and raw amount.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
