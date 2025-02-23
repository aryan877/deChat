export const SONIC_API_KEY = process.env.SONIC_API_KEY;

// API Base URLs
export const SONIC_MAINNET_API_URL = "https://api.sonicscan.org/api";
export const SONIC_TESTNET_API_URL = "https://api-testnet.sonicscan.org/api";

// Explorer URLs
export const SONIC_MAINNET_EXPLORER_URL = "https://sonicscan.org";
export const SONIC_TESTNET_EXPLORER_URL = "https://testnet.sonicscan.org";

// Common API parameters
export const DEFAULT_PAGE = 1;
export const DEFAULT_OFFSET = 10;
export const DEFAULT_SORT = "desc";

// API Modules
export const API_MODULES = {
  ACCOUNT: "account",
  CONTRACT: "contract",
  TRANSACTION: "transaction",
  BLOCK: "block",
  LOGS: "logs",
  STATS: "stats",
} as const;

// API Actions
export const API_ACTIONS = {
  // Account actions
  BALANCE: "balance",
  BALANCE_MULTI: "balancemulti",
  TX_LIST: "txlist",
  TX_LIST_INTERNAL: "txlistinternal",
  TOKEN_TX: "tokentx",
  TOKEN_NFT_TX: "tokennfttx",
  TOKEN_1155_TX: "token1155tx",
  MINED_BLOCKS: "getminedblocks",

  // Contract actions
  GET_ABI: "getabi",
  GET_SOURCE_CODE: "getsourcecode",
  GET_CONTRACT_CREATION: "getcontractcreation",

  // Transaction actions
  GET_TX_STATUS: "getstatus",
  GET_TX_RECEIPT_STATUS: "gettxreceiptstatus",

  // Block actions
  GET_BLOCK_REWARD: "getblockreward",
  GET_BLOCK_COUNTDOWN: "getblockcountdown",
  GET_BLOCK_BY_TIME: "getblocknobytime",

  // Logs actions
  GET_LOGS: "getLogs",

  // Stats actions
  TOKEN_SUPPLY: "tokensupply",
  S_SUPPLY: "ethsupply",
  S_PRICE: "ethprice",
} as const;
