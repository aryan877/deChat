import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AaveUserDataResponse } from "@repo/de-agent";
import {
  Activity,
  AlertTriangle,
  CreditCard,
  ExternalLink,
  Wallet,
} from "lucide-react";

export interface AaveUserDataSuccessProps {
  data: AaveUserDataResponse;
}

export function AaveUserDataSuccess({ data }: AaveUserDataSuccessProps) {
  const { userSummary, hasActivePosition } = data;

  // Function to determine health factor status color
  const getHealthFactorColor = (healthFactor: string) => {
    const value = parseFloat(healthFactor);
    if (value > 2) return "text-green-500";
    if (value > 1.1) return "text-amber-500";
    return "text-red-500";
  };

  // Function to determine borrow power color
  const getBorrowPowerColor = (borrowPower: string) => {
    const value = parseFloat(borrowPower);
    if (value < 65) return "text-green-500";
    if (value < 85) return "text-amber-500";
    return "text-red-500";
  };

  // If user has no active position
  if (!hasActivePosition) {
    return (
      <Card>
        <CardHeader className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-blue-500" />
            <CardTitle>No Active Aave Position</CardTitle>
          </div>
          <Badge className="bg-blue-600">
            <Wallet className="h-3 w-3 mr-1" />
            Aave v3
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6">
            <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mb-4">
              <Wallet className="w-8 h-8 text-blue-500" />
            </div>
            <p className="text-center text-muted-foreground mb-6">
              This address doesn&apos;t have any active positions on Aave
              protocol.
            </p>
            <Button
              variant="outline"
              className="w-full max-w-md"
              onClick={() => window.open("https://app.aave.com", "_blank")}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Visit Aave App
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-green-500" />
            <div>
              <CardTitle>Aave Position Summary</CardTitle>
              <CardDescription className="mt-1">
                Overview of your Aave position on Sonic
              </CardDescription>
            </div>
          </div>
          <Badge className="bg-blue-600">
            <CreditCard className="h-3 w-3 mr-1" />
            Aave v3
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Health Factor Card */}
        <div className="p-4 border rounded-lg bg-background/50">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium">Health Factor</h3>
            <Badge
              variant={
                parseFloat(userSummary.healthFactor) > 2
                  ? "default"
                  : parseFloat(userSummary.healthFactor) > 1.1
                    ? "secondary"
                    : "destructive"
              }
              className={`px-2 py-0.5 ${parseFloat(userSummary.healthFactor) > 1.1 && parseFloat(userSummary.healthFactor) <= 2 ? "bg-amber-500" : ""}`}
            >
              {parseFloat(userSummary.healthFactor) > 2
                ? "Safe"
                : parseFloat(userSummary.healthFactor) > 1.1
                  ? "Caution"
                  : "At Risk"}
            </Badge>
          </div>
          <p
            className={`text-2xl font-bold ${getHealthFactorColor(userSummary.healthFactor)}`}
          >
            {userSummary.healthFactor}
          </p>
        </div>

        {/* Main metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="border rounded-lg p-4 bg-muted/30">
            <div className="text-muted-foreground text-xs mb-1 flex items-center gap-1">
              <Wallet className="h-3.5 w-3.5" />
              Total Collateral
            </div>
            <div className="text-xl font-semibold text-green-500">
              ${userSummary.totalCollateralUSD}
            </div>
          </div>
          <div className="border rounded-lg p-4 bg-muted/30">
            <div className="text-muted-foreground text-xs mb-1 flex items-center gap-1">
              <CreditCard className="h-3.5 w-3.5" />
              Total Debt
            </div>
            <div className="text-xl font-semibold text-red-500">
              ${userSummary.totalDebtUSD}
            </div>
          </div>
          <div className="border rounded-lg p-4 bg-muted/30">
            <div className="text-muted-foreground text-xs mb-1 flex items-center gap-1">
              <Activity className="h-3.5 w-3.5" />
              Available to Borrow
            </div>
            <div className="text-xl font-semibold text-blue-500">
              ${userSummary.availableBorrowsUSD}
            </div>
          </div>
        </div>

        {/* Additional metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="border rounded-lg p-3 bg-background">
            <div className="text-muted-foreground text-xs mb-1">
              Liquidation Threshold
            </div>
            <div className="text-base font-medium">
              {userSummary.liquidationThreshold}
            </div>
          </div>
          <div className="border rounded-lg p-3 bg-background">
            <div className="text-muted-foreground text-xs mb-1">Net APY</div>
            <div
              className={`text-base font-medium ${parseFloat(userSummary.netAPY) >= 0 ? "text-green-500" : "text-red-500"}`}
            >
              {userSummary.netAPY}
            </div>
          </div>
          <div className="border rounded-lg p-3 bg-background">
            <div className="text-muted-foreground text-xs mb-1">
              Borrow Power Used
            </div>
            <div
              className={`text-base font-medium ${getBorrowPowerColor(userSummary.borrowPowerUsed)}`}
            >
              {userSummary.borrowPowerUsed}
            </div>
          </div>
        </div>

        {/* User reserves table */}
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Asset</TableHead>
                <TableHead className="text-right">Supplied</TableHead>
                <TableHead className="text-right">Borrowed</TableHead>
                <TableHead className="text-right">Supply APY</TableHead>
                <TableHead className="text-right">Borrow APY</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {userSummary.userReserves.map((reserve, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{reserve.symbol}</Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium text-green-500">
                    {parseFloat(reserve.supplied) > 0 ? reserve.supplied : "-"}
                  </TableCell>
                  <TableCell className="text-right font-medium text-red-500">
                    {parseFloat(reserve.borrowed) > 0 ? reserve.borrowed : "-"}
                  </TableCell>
                  <TableCell className="text-right text-cyan-500">
                    {reserve.supplyAPY}
                  </TableCell>
                  <TableCell className="text-right text-purple-500">
                    {reserve.borrowAPY}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Info box */}
        <div className="p-3 bg-blue-500/10 text-foreground rounded-lg text-sm flex items-start gap-2 border border-blue-500/20">
          <AlertTriangle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium mb-1">Understanding Health Factor</p>
            <p className="text-muted-foreground text-xs">
              A health factor below 1.0 puts your position at risk of
              liquidation. Aim to keep it above 2.0 for safety. Increase your
              health factor by adding more collateral or repaying borrowed
              assets.
            </p>
          </div>
        </div>

        {/* External link */}
        <Button
          variant="outline"
          className="w-full"
          onClick={() =>
            window.open(
              "https://app.aave.com/?marketName=proto_sonic_v3",
              "_blank"
            )
          }
        >
          <ExternalLink className="mr-2 h-4 w-4" />
          Manage on Aave App
        </Button>
      </CardContent>
    </Card>
  );
}
