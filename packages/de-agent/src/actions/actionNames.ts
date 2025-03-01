export const ACTION_NAMES = {
  GET_SUPPORTED_CHAINS: "getSupportedChains",
  ASK_FOR_CONFIRMATION: "askForConfirmation",

  // deBridge Actions
  DEBRIDGE_CHECK_TRANSACTION_STATUS: "debridgeCheckTransactionStatus",
  DEBRIDGE_CREATE_BRIDGE_ORDER: "debridgeCreateBridgeOrder",
  DEBRIDGE_EXECUTE_BRIDGE_ORDER: "debridgeExecuteBridgeOrder",
  DEBRIDGE_GET_BRIDGE_QUOTE: "debridgeGetBridgeQuote",
  DEBRIDGE_GET_TOKENS_INFO: "debridgeGetTokensInfo",

  // Sonic Account Actions
  SONIC_GET_ACCOUNT_INFO: "sonicGetAccountInfo",
  SONIC_GET_MULTI_ACCOUNT_INFO: "sonicGetMultiAccountInfo",
  SONIC_GET_ACCOUNT_TRANSACTIONS: "sonicGetAccountTransactions",
  SONIC_GET_ACCOUNT_INTERNAL_TRANSACTIONS:
    "sonicGetAccountInternalTransactions",

  // Sonic Transaction Actions
  SONIC_GET_TRANSACTION_STATUS: "sonicGetTransactionStatus",
  SONIC_GET_TRANSACTION_RECEIPT: "sonicGetTransactionReceipt",
  SONIC_GET_INTERNAL_TRANSACTIONS: "sonicGetInternalTransactions",
  SONIC_TRANSFER: "sonicTransfer",

  // Sonic Token Actions
  SONIC_GET_TOKEN_SUPPLY: "sonicGetTokenSupply",
  SONIC_GET_TOKEN_TRANSFERS: "sonicGetTokenTransfers",
  SONIC_GET_NFT_TRANSFERS: "sonicGetNFTTransfers",
  SONIC_GET_ERC1155_TRANSFERS: "sonicGetERC1155Transfers",

  // Sonic Block Actions
  SONIC_GET_BLOCK_REWARD: "sonicGetBlockReward",
  SONIC_GET_BLOCK_COUNTDOWN: "sonicGetBlockCountdown",
  SONIC_GET_BLOCK_BY_TIMESTAMP: "sonicGetBlockByTimestamp",
  SONIC_GET_VALIDATED_BLOCKS: "sonicGetValidatedBlocks",

  // Sonic Staking Actions
  SONIC_GET_STAKERS: "sonicGetStakers",

  // Chainlink Actions
  CHAINLINK_GET_PRICE_FEEDS: "chainlinkGetPriceFeeds",
  CHAINLINK_GET_PRICE_DATA: "chainlinkGetPriceData",

  SONIC_DELEGATE: "sonicDelegate",
  SONIC_GET_DELEGATIONS: "sonicGetDelegations",
} as const;
