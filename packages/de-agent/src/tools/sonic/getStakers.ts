import { SonicStakersResponse } from "../../types/sonic.js";

/**
 * Get list of stakers/validators on the Sonic platform
 * @returns List of stakers with their information
 * @throws {Error} If the API request fails or returns an error
 */
export async function getSonicStakers(): Promise<SonicStakersResponse> {
  const query = `
    query Validators {
      stakers {
        id
        isActive
        stake
        stakerAddress
        stakerInfo {
          logoUrl
          name
        }
        delegatedLimit
        totalStake
        totalDelegatedLimit
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
        variables: {},
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data as SonicStakersResponse;
  } catch (error) {
    throw new Error(
      `Failed to fetch stakers: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}
