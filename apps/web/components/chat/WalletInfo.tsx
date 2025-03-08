"use client";

import { useCreateWallet, usePrivy } from "@privy-io/react-auth";
import {
  Copy,
  Plus,
  LogOut,
  RefreshCw,
  Download,
  Coins,
  ExternalLink,
  Zap,
  ChevronRight,
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

  // Helper function to truncate address
  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
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
    <div className="p-3">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">
            Sonic Wallet
          </span>
        </div>
        {user && (
          <Button
            onClick={handleLogout}
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-3 w-3 mr-1" />
            <span>Disconnect</span>
          </Button>
        )}
      </div>

      <div className="mb-3">
        <Select
          value={selectedCluster}
          onValueChange={(value) => setSelectedCluster(value as Cluster)}
        >
          <SelectTrigger className="w-full h-8 text-xs">
            <SelectValue placeholder="Select network" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sonicBlaze" className="text-xs">
              <div className="flex items-center gap-1">
                <Zap className="h-3 w-3 text-amber-500" />
                Sonic Blaze
              </div>
            </SelectItem>
            <SelectItem value="sonicMainnet" className="text-xs">
              <div className="flex items-center gap-1">
                <Zap className="h-3 w-3 text-blue-500" />
                Sonic Mainnet
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {user?.wallet ? (
        <div className="space-y-3">
          <Card className="p-3 space-y-2 bg-muted/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <span className="text-xs font-medium">Address</span>
              </div>
              <Tooltip open={copied}>
                <TooltipTrigger asChild>
                  <Button
                    onClick={copyAddress}
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {copied ? "Copied!" : "Copy address"}
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="font-mono text-xs bg-background/50 p-1.5 rounded-md truncate">
              {user?.wallet?.address
                ? truncateAddress(user.wallet.address)
                : ""}
            </div>
            <div className="pt-1 flex gap-1">
              <Button
                onClick={() =>
                  user?.wallet?.address &&
                  exportWallet({ address: user.wallet.address })
                }
                variant="outline"
                size="sm"
                className="flex-1 h-7 text-xs flex items-center justify-center gap-1"
              >
                <Download className="h-3 w-3" />
                Backup
              </Button>
              <Button
                onClick={() => {
                  if (user?.wallet?.address) {
                    window.open(
                      `https://sonicscan.org/address/${user.wallet.address}`,
                      "_blank"
                    );
                  }
                }}
                variant="outline"
                size="sm"
                className="flex-1 h-7 text-xs flex items-center justify-center gap-1"
              >
                <ExternalLink className="h-3 w-3" />
                Explorer
              </Button>
            </div>
          </Card>

          <div className="flex items-center justify-between bg-muted/50 p-2 rounded-md">
            <div className="flex items-center gap-2">
              <Coins className="h-4 w-4 text-primary" />
              <span className="font-mono text-sm font-medium">
                {balance || "0"}
              </span>
              <span className="text-xs text-muted-foreground">SONIC</span>
            </div>
            <Button
              onClick={refreshBalance}
              disabled={isLoadingBalance || isRefetchingBalance}
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
            >
              <RefreshCw
                className={`h-3 w-3 ${isRefetchingBalance ? "animate-spin" : ""}`}
              />
            </Button>
          </div>

          <Button
            onClick={() => router.push("/wallet")}
            variant="default"
            size="sm"
            className="w-full h-8 text-xs bg-primary hover:bg-primary/90 flex items-center justify-center"
          >
            <div className="flex items-center gap-1">
              <span>View Wallet</span>
            </div>
            <ChevronRight className="h-3 w-3 ml-2" />
          </Button>
        </div>
      ) : (
        <Card className="p-3 bg-muted/50">
          {isCreating ? (
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary" />
              <span>Creating wallet...</span>
            </div>
          ) : (
            <div className="flex flex-col gap-2 text-xs">
              <div className="flex items-center gap-1">
                <Zap className="h-3 w-3 text-primary" />
                <span className="font-medium">Get Started</span>
              </div>
              <p className="text-muted-foreground text-xs">
                Create a wallet to use Sonic
              </p>
              <Button
                onClick={handleCreateWallet}
                disabled={isCreating}
                size="sm"
                className="w-full h-8 bg-primary hover:bg-primary/90"
              >
                <Plus className="h-3 w-3 mr-1" />
                {isCreating ? "Creating..." : "Create Wallet"}
              </Button>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
