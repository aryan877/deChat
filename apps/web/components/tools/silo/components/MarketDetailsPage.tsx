"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { SiloMarket } from "../types";

interface MarketDetailsPageProps {
  market?: SiloMarket;
  onBack: () => void;
}

export const MarketDetailsPage = ({
  market,
  onBack,
}: MarketDetailsPageProps) => {
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
          Market Details: {market?.id || "Unknown"}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 text-center flex flex-col items-center justify-center min-h-[300px]">
        <p className="text-muted-foreground">
          Market details component placeholder
        </p>
        <p className="mt-2 text-sm">
          This is a dummy component for demonstration purposes
        </p>
      </CardContent>
    </Card>
  );
};
