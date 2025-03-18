import { Badge } from "@/components/ui/badge";
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
import { AlertTriangle, Check } from "lucide-react";

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
        <CardHeader className="flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mb-2">
            <AlertTriangle className="w-6 h-6 text-blue-500" />
          </div>
          <CardTitle>No Active Aave Position</CardTitle>
          <CardDescription>
            This address doesn&apos;t have any active positions on Aave.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-full">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                <Check className="w-5 h-5 text-green-500" />
              </div>
              <CardTitle>Aave Position Summary</CardTitle>
            </div>
            <CardDescription className="mt-2">
              Overview of your Aave position on Sonic
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {/* Main metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="border rounded-md p-4">
              <div className="text-muted-foreground text-sm">
                Total Collateral
              </div>
              <div className="text-xl font-medium text-green-500">
                ${userSummary.totalCollateralUSD}
              </div>
            </div>
            <div className="border rounded-md p-4">
              <div className="text-muted-foreground text-sm">Total Debt</div>
              <div className="text-xl font-medium text-red-500">
                ${userSummary.totalDebtUSD}
              </div>
            </div>
            <div className="border rounded-md p-4">
              <div className="text-muted-foreground text-sm">
                Available Borrowing Power
              </div>
              <div className="text-xl font-medium text-blue-500">
                ${userSummary.availableBorrowsUSD}
              </div>
            </div>
            <div className="border rounded-md p-4">
              <div className="text-muted-foreground text-sm">Health Factor</div>
              <div
                className={`text-xl font-medium ${getHealthFactorColor(userSummary.healthFactor)}`}
              >
                {userSummary.healthFactor}
              </div>
            </div>
          </div>

          {/* Additional metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="border rounded-md p-4">
              <div className="text-muted-foreground text-sm">
                Liquidation Threshold
              </div>
              <div className="text-lg">{userSummary.liquidationThreshold}</div>
            </div>
            <div className="border rounded-md p-4">
              <div className="text-muted-foreground text-sm">Net APY</div>
              <div
                className={`text-lg ${parseFloat(userSummary.netAPY) >= 0 ? "text-green-500" : "text-red-500"}`}
              >
                {userSummary.netAPY}
              </div>
            </div>
            <div className="border rounded-md p-4">
              <div className="text-muted-foreground text-sm">
                Borrow Power Used
              </div>
              <div
                className={`text-lg ${getBorrowPowerColor(userSummary.borrowPowerUsed)}`}
              >
                {userSummary.borrowPowerUsed}
              </div>
            </div>
          </div>

          {/* User reserves table */}
          <div className="rounded-md border mt-6">
            <Table>
              <TableHeader>
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
                    <TableCell className="text-right text-green-500">
                      {parseFloat(reserve.supplied) > 0
                        ? reserve.supplied
                        : "-"}
                    </TableCell>
                    <TableCell className="text-right text-red-500">
                      {parseFloat(reserve.borrowed) > 0
                        ? reserve.borrowed
                        : "-"}
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
          <div className="mt-6 bg-blue-50 dark:bg-blue-950 rounded-md p-4 text-sm text-muted-foreground border border-blue-200 dark:border-blue-800">
            <p className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-blue-500" />
              <span>
                Health Factor: A health factor below 1.0 puts your position at
                risk of liquidation. Aim to keep it above 2.0 for safety.
              </span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
