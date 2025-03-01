import { SonicDelegationsByAddressResponse } from "@repo/de-agent";
import { Badge } from "@/components/ui/badge";
import { ethers } from "ethers";
import { formatDistanceToNow } from "date-fns";

interface DelegationsSuccessProps {
  data: SonicDelegationsByAddressResponse;
}

export function DelegationsSuccess({ data }: DelegationsSuccessProps) {
  const delegations = data.data.delegationsByAddress.edges;

  if (delegations.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-muted-foreground">No delegations found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Your Delegations</h3>
      <div className="grid gap-4">
        {delegations.map(({ delegation }, index) => {
          const amount = ethers.formatEther(delegation.amount);
          const amountDelegated = ethers.formatEther(
            delegation.amountDelegated
          );
          const amountInWithdraw = ethers.formatEther(
            delegation.amountInWithdraw
          );
          const pendingRewards = ethers.formatEther(
            delegation.pendingRewards.amount
          );
          const createdDate = new Date(
            parseInt(delegation.createdTime, 16) * 1000
          );

          return (
            <div
              key={`${delegation.address}-${index}`}
              className="bg-card rounded-lg border border-border p-4"
            >
              <div className="space-y-3">
                {/* Header with Staker ID */}
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">
                    Staker #{parseInt(delegation.toStakerId, 16)}
                  </h4>
                  <Badge variant="outline">
                    Created {formatDistanceToNow(createdDate)} ago
                  </Badge>
                </div>

                {/* Amounts Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Total Amount
                    </p>
                    <p className="text-lg font-medium">
                      {parseFloat(amount).toFixed(4)} SONIC
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Delegated</p>
                    <p className="text-lg font-medium">
                      {parseFloat(amountDelegated).toFixed(4)} SONIC
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">In Withdraw</p>
                    <p className="text-lg font-medium">
                      {parseFloat(amountInWithdraw).toFixed(4)} SONIC
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Pending Rewards
                    </p>
                    <p className="text-lg font-medium text-green-500">
                      {parseFloat(pendingRewards).toFixed(6)} SONIC
                    </p>
                  </div>
                </div>

                {/* Withdraw Requests */}
                {delegation.withdrawRequests.length > 0 && (
                  <div className="mt-4">
                    <h5 className="text-sm font-medium mb-2">
                      Withdraw Requests
                    </h5>
                    <div className="space-y-2">
                      {delegation.withdrawRequests.map((request) => {
                        const requestAmount = ethers.formatEther(
                          request.amount
                        );
                        const requestDate = new Date(
                          parseInt(request.createdTime, 16) * 1000
                        );
                        return (
                          <div
                            key={request.withdrawRequestID}
                            className="flex items-center justify-between text-sm p-2 bg-muted rounded"
                          >
                            <span>
                              {parseFloat(requestAmount).toFixed(4)} SONIC
                            </span>
                            <Badge variant="secondary">
                              Requested {formatDistanceToNow(requestDate)} ago
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
