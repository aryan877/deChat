import { DeAgent } from "../../agent/index.js";
import { SonicDelegationsByAddressResponse } from "../../types/sonic.js";

/**
 * Get delegations for a specific address
 * @param agent DeAgent instance (used for default address)
 * @param address Optional address to get delegations for (defaults to agent's address)
 * @returns List of delegations for the address
 * @throws {Error} If the API request fails or returns an error
 */
export async function getSonicDelegationsByAddress(
  agent: DeAgent,
  address?: string
): Promise<SonicDelegationsByAddressResponse> {
  // Use provided address or fall back to agent's address
  const targetAddress = address || agent.wallet_address;

  if (!targetAddress) {
    throw new Error("No address provided and agent address not available");
  }

  const query = `
    query DelegationsByAddress($address: Address!) {
      delegationsByAddress(address: $address) {
        edges {
          delegation {
            address
            amount
            amountDelegated
            amountInWithdraw
            createdTime
            pendingRewards {
              amount
            }
            toStakerId
            withdrawRequests {
              amount
              createdTime
              withdrawRequestID
              withdrawTime
            }
          }
        }
      }
    }
  `;

  try {
    const response = await fetch(`https://xapi.sonic.soniclabs.com/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        variables: {
          address: targetAddress,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data as SonicDelegationsByAddressResponse;
  } catch (error) {
    throw new Error(
      `Failed to fetch delegations: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}
