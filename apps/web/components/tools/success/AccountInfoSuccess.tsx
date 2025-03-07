import React from "react";
import { Wallet } from "lucide-react";
import { ethers } from "ethers";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export interface AccountInfoSuccessData {
  address: string;
  balance: string;
  tag: string;
}

interface AccountInfoSuccessProps {
  data: AccountInfoSuccessData;
}

export function AccountInfoSuccess({ data }: AccountInfoSuccessProps) {
  const { address, balance, tag } = data;
  const formattedBalance = balance ? ethers.formatEther(balance) : "0";
  const balanceInWei = balance || "0";

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Wallet className="w-5 h-5 text-primary" />
          <CardTitle>Account Information</CardTitle>
        </div>
        <CardDescription>
          Account balance and details from {tag} block
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Address</p>
          <code className="font-mono text-sm break-all bg-muted px-2 py-1 rounded">
            {address}
          </code>
        </div>

        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Balance</p>
          <p className="text-2xl font-bold">
            {Number(formattedBalance).toFixed(6)} SONIC
          </p>
          <p className="text-xs text-muted-foreground">{balanceInWei} wei</p>
        </div>

        <div className="bg-muted/30 rounded-md p-3 text-sm text-muted-foreground">
          <p>
            This balance information was fetched from the {tag} block. The
            balance shown is for native SONIC tokens.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
