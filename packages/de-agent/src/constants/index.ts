/**
 * Common token addresses used across the toolkit
 */
export const TOKENS = {} as const;

export const DEFAULT_OPTIONS = {} as const;

/**
 * DEX related constants
 */
export const DEX_CONSTANTS = {} as const;

/**
 * Minimum gas price for complex transactions
 */
export const MINIMUM_GAS_PRICE = "0.1"; // in Gwei

export const DEBRIDGE_API = "https://dln.debridge.finance/v1.0";

/**
 * Chainlink price feed addresses for Sonic Mainnet
 */
export const CHAINLINK_SONIC_MAINNET_FEEDS = {
  "BTC/USD": "0x8Bcd59Cb7eEEea8e2Da3080C891609483dae53EF",
  "DAI/USD": "0x1654Df3d2543717534eE1c38eb9aF5F0407Ec708",
  "ETH/USD": "0x824364077993847f71293B24ccA8567c00c2de11",
  "LBTC/BTC": "0xA63b1614D17536C22fDB4c1a58023E35d08Cccef",
  "LINK/USD": "0x26e450ca14D7bF598C89f212010c691434486119",
  "S/USD": "0xc76dFb89fF298145b417d221B2c747d84952e01d",
  "USDC/USD": "0x55bCa887199d5520B3Ce285D41e6dC10C08716C9",
  "AAVE Network Emergency Count": "0xECB564e91f620fBFb59d0C4A41d7f10aDb0D1934",
} as const;

/**
 * Chainlink price feed addresses for Sonic Blaze Testnet
 */
export const CHAINLINK_SONIC_BLAZE_TESTNET_FEEDS = {
  "BTC/USD": "0x725F7B05D0568b15bA68cfE1AA0770FF7D62A517",
  "ETH/USD": "0x5cfF644dDcd40C2165e2C58d146F852f23fe1b0C",
  "LINK/USD": "0xd368e12D47F0c3A9D57E1A80C346853Ad276ce5B",
  "S/USD": "0xC13a2Af6076E1dc5673eA9f3476a60299eADf7AE",
  "USDC/USD": "0x0Cb75Ba04aAfEd69449920759055482F9BaDcdeD",
  "USDT/USD": "0xD6d2105a0abd7364A67589AC9D820c1516D88CC1",
} as const;
