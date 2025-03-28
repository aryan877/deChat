"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSiloMarketDetail, useSiloMarketDetailForUser } from "@/hooks/silo";
import { usePrivy } from "@privy-io/react-auth";
import { ArrowLeft, LockIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Deposit, Information, UserSummary } from "./market-details";
import { Withdraw } from "./market-details/Withdraw";

interface MarketDetailsPageProps {
  marketId?: string;
  chainKey?: string;
  onBack: () => void;
}

export const MarketDetailsPage = ({
  marketId,
  chainKey = "sonic",
  onBack,
}: MarketDetailsPageProps) => {
  const [activeTab, setActiveTab] = useState("information");

  // Get wallet address from Privy
  const { user } = usePrivy();
  const walletAddress = user?.wallet?.address;

  // Fetch regular market details for fallback
  const {
    data: marketDetail,
    isLoading: isLoadingMarket,
    refetch: refetchMarket,
  } = useSiloMarketDetail(chainKey, marketId || "");

  // Fetch user-specific market details
  const {
    data: userMarketDetail,
    isLoading: isLoadingUserMarket,
    refetch: refetchUserMarket,
  } = useSiloMarketDetailForUser(chainKey, marketId || "", walletAddress || "");

  // Function to refresh all market data
  const refreshAllMarketData = async () => {
    if (walletAddress) {
      await refetchUserMarket();
    }
    await refetchMarket();
  };

  // Refetch user data when wallet address changes
  useEffect(() => {
    if (walletAddress) {
      refetchUserMarket();
    }
  }, [walletAddress, refetchUserMarket]);

  // Use user-specific data if available, otherwise use regular market data
  const marketData = userMarketDetail || marketDetail;
  const isLoading = isLoadingMarket || isLoadingUserMarket;

  // Function to handle tab change - allow withdraw tab
  const handleTabChange = (value: string) => {
    // Allow information, deposit, and withdraw tabs
    if (
      value === "information" ||
      value === "deposit" ||
      value === "withdraw"
    ) {
      setActiveTab(value);
    }
  };

  return (
    <Card className="w-full shadow-md">
      <CardHeader className="border-b pb-2 flex-shrink-0 px-3 sm:px-4 py-2.5 sm:py-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="mb-2 -ml-2 h-8 w-8 p-0"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <CardTitle className="text-lg sm:text-xl">
          Market Details: {marketId || "Unknown"}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-60 w-full" />
          </div>
        ) : (
          <>
            {/* User summary section */}
            <UserSummary market={marketData} walletAddress={walletAddress} />

            <Tabs
              value={activeTab}
              onValueChange={handleTabChange}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="information">Information</TabsTrigger>
                <TabsTrigger value="deposit">Deposit</TabsTrigger>
                <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <TabsTrigger value="borrow" disabled className="relative">
                        Borrow
                        <LockIcon className="h-3 w-3 ml-1" />
                      </TabsTrigger>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Coming soon</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <TabsTrigger value="repay" disabled className="relative">
                        Repay
                        <LockIcon className="h-3 w-3 ml-1" />
                      </TabsTrigger>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Coming soon</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TabsList>
              <TabsContent value="information" className="mt-4">
                <Information marketDetail={marketData} />
              </TabsContent>
              <TabsContent value="deposit" className="mt-4">
                <Deposit
                  market={marketData}
                  chainKey={chainKey}
                  walletAddress={walletAddress}
                  refetchUserData={refreshAllMarketData}
                />
              </TabsContent>
              <TabsContent value="withdraw" className="mt-4">
                <Withdraw
                  market={marketData}
                  chainKey={chainKey}
                  walletAddress={walletAddress}
                  refetchUserData={refreshAllMarketData}
                />
              </TabsContent>
              <TabsContent value="borrow" className="mt-4">
                <div className="flex items-center justify-center h-60 text-muted-foreground">
                  <div className="text-center">
                    <LockIcon className="h-8 w-8 mx-auto mb-2" />
                    <p>Borrow functionality coming soon</p>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="repay" className="mt-4">
                <div className="flex items-center justify-center h-60 text-muted-foreground">
                  <div className="text-center">
                    <LockIcon className="h-8 w-8 mx-auto mb-2" />
                    <p>Repay functionality coming soon</p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
      </CardContent>
    </Card>
  );
};
