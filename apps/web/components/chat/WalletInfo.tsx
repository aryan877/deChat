"use client";

import { useCreateWallet, usePrivy } from "@privy-io/react-auth";
import {
  Copy,
  Wallet,
  Plus,
  LogOut,
  Send,
  RefreshCw,
  Download,
  Coins,
} from "lucide-react";
import { useState } from "react";
import { useClusterStore } from "@/app/store/clusterStore";
import { useStoreWallet, useWalletBalance } from "@/hooks/wallet";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Cluster } from "@repo/de-agent";
import { useRouter } from "next/navigation";

interface WalletInfoProps {
  onLogoutClick: () => void;
  isCollapsed?: boolean;
}

export function WalletInfo({
  onLogoutClick,
  isCollapsed = false,
}: WalletInfoProps) {
  const { user, ready, exportWallet } = usePrivy();
  const router = useRouter();
  const { createWallet } = useCreateWallet();
  const { selectedCluster, setSelectedCluster } = useClusterStore();
  const { mutateAsync: storeWallet } = useStoreWallet();
  const {
    balance,
    isLoading: isLoadingBalance,
    isRefetching: isRefetchingBalance,
    refreshBalance,
  } = useWalletBalance(user?.wallet?.address);
  const [copied, setCopied] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  if (!ready) return null;

  const handleLogout = async () => {
    await onLogoutClick();
    router.push("/");
  };

  const copyAddress = async () => {
    if (user?.wallet?.address) {
      await navigator.clipboard.writeText(user.wallet.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCreateWallet = async () => {
    try {
      setIsCreating(true);
      const wallet = await createWallet();
      await storeWallet({
        address: wallet.address,
        chainType: "ethereum",
      });
    } catch (error) {
      console.error("Error creating EVM wallet:", error);
    } finally {
      setIsCreating(false);
    }
  };

  if (isCollapsed) {
    return (
      <div className="p-2 flex flex-col items-center">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={handleLogout}
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Logout</TooltipContent>
        </Tooltip>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Wallet className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">
            EVM Wallet
          </span>
        </div>
        {user && (
          <Button
            onClick={handleLogout}
            variant="ghost"
            size="sm"
            className="h-8 px-3 text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-4 w-4 mr-2" />
            <span className="text-sm">Logout</span>
          </Button>
        )}
      </div>

      <div className="mb-4">
        <Select
          value={selectedCluster}
          onValueChange={(value) => setSelectedCluster(value as Cluster)}
        >
          <SelectTrigger className="w-full h-9 text-sm">
            <SelectValue placeholder="Select network" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sonicBlaze" className="text-sm">
              Sonic Blaze
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {user?.wallet ? (
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            <Card className="p-4 space-y-3 bg-muted/50">
              <div className="flex items-center justify-between">
                <span className="font-medium text-foreground">Address</span>
                <Tooltip open={copied}>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={copyAddress}
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {copied ? "Copied!" : "Copy address"}
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="break-all text-foreground text-sm opacity-90">
                {user.wallet.address}
              </div>
              <div className="pt-2">
                <Button
                  onClick={() =>
                    user?.wallet?.address &&
                    exportWallet({ address: user.wallet.address })
                  }
                  variant="outline"
                  size="sm"
                  className="w-full h-9 text-sm bg-background hover:bg-background flex items-center justify-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export Wallet
                </Button>
              </div>
            </Card>
          </div>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Coins className="h-4 w-4" />
              <Card className="px-3 py-1.5 text-sm bg-muted/50 whitespace-nowrap">
                {balance || "0"} SONIC
              </Card>
            </div>
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={refreshBalance}
                    disabled={isLoadingBalance || isRefetchingBalance}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                  >
                    <RefreshCw
                      className={`h-4 w-4 ${isRefetchingBalance ? "animate-spin" : ""}`}
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Refresh balance</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    disabled={true}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Withdraw</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>
      ) : (
        <Card className="p-4 bg-muted/50">
          {isCreating ? (
            <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
              <span>Creating EVM wallet...</span>
            </div>
          ) : (
            <div className="flex flex-col gap-3 text-sm text-muted-foreground">
              <p>Create a EVM wallet to get started</p>
              <Button
                onClick={handleCreateWallet}
                disabled={isCreating}
                size="default"
                className="w-full h-9"
              >
                <Plus className="h-4 w-4 mr-2" />
                {isCreating ? "Creating..." : "Create EVM wallet"}
              </Button>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
