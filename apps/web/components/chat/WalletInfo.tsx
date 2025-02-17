"use client";

import { useCreateWallet, usePrivy } from "@privy-io/react-auth";
import { Copy, Wallet, Plus, LogOut, Send, RefreshCw } from "lucide-react";
import { useState } from "react";
import { useClusterStore } from "@/app/store/clusterStore";
import { useStoreWallet } from "@/hooks/wallet";
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
import Link from "next/link";
import { useRouter } from "next/navigation";

interface WalletInfoProps {
  onLogoutClick: () => void;
  isCollapsed?: boolean;
}

export function WalletInfo({
  onLogoutClick,
  isCollapsed = false,
}: WalletInfoProps) {
  const { user, ready } = usePrivy();
  const router = useRouter();
  const { createWallet } = useCreateWallet();
  const { selectedCluster, setSelectedCluster } = useClusterStore();
  const { mutateAsync: storeWallet } = useStoreWallet();
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
    <div className="p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Wallet className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs font-medium text-foreground">
            EVM Wallet
          </span>
        </div>
        {user && (
          <Button
            onClick={handleLogout}
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-3 w-3 mr-1" />
            <span className="text-xs">Logout</span>
          </Button>
        )}
      </div>

      <div className="mb-2">
        <Select
          value={selectedCluster}
          onValueChange={(value) => setSelectedCluster(value as Cluster)}
        >
          <SelectTrigger className="w-full h-8 text-xs">
            <SelectValue placeholder="Select network" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sonicBlaze" className="text-xs">
              Sonic Blaze
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {user?.wallet ? (
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground">
            <Card className="p-2 space-y-2 bg-muted/50">
              <div className="flex items-center justify-between">
                <span className="font-medium text-foreground">Address</span>
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
              <div className="break-all text-foreground text-xs opacity-90">
                {user.wallet.address}
              </div>
              <div className="pt-1">
                <Link href="/wallet" className="no-underline w-full block">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full h-8 text-xs bg-background hover:bg-background"
                  >
                    Manage Wallet
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Balance:</span>
            <div className="flex items-center gap-1.5">
              <Card className="px-2 py-1 text-xs bg-muted/50">0.5 SONIC</Card>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    disabled={true}
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                  >
                    <RefreshCw className="h-3 w-3" />
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
                    className="h-6 w-6 p-0"
                  >
                    <Send className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Withdraw</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>
      ) : (
        <Card className="p-2 bg-muted/50">
          {isCreating ? (
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <div className="animate-spin rounded-full h-3 w-3 border-b border-primary" />
              <span>Creating EVM wallet...</span>
            </div>
          ) : (
            <div className="flex flex-col gap-2 text-xs text-muted-foreground">
              <p>Create a EVM wallet to get started</p>
              <Button
                onClick={handleCreateWallet}
                disabled={isCreating}
                size="sm"
                className="w-full h-8"
              >
                <Plus className="h-3 w-3 mr-1" />
                {isCreating ? "Creating..." : "Create EVM wallet"}
              </Button>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
