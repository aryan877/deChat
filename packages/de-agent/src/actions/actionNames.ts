export const ACTION_NAMES = {
  GET_SUPPORTED_CHAINS: "getSupportedChains",
  ASK_FOR_CONFIRMATION: "askForConfirmation",

  // deBridge Actions
  DEBRIDGE_VERIFY_TX_STATUS: "debridgeVerifyTxStatus",
  DEBRIDGE_EXECUTE_BRIDGE_TRANSFER: "debridgeExecuteBridgeTransfer",
  DEBRIDGE_FETCH_BRIDGE_QUOTE: "debridgeFetchBridgeQuote",
  DEBRIDGE_FETCH_TOKEN_DATA: "debridgeFetchTokenData",
  DEBRIDGE_PROCESS_TRANSFER: "debridgeProcessTransfer",

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
  SONIC_GET_TOKEN_BALANCE: "sonicGetTokenBalance",
  SONIC_GET_BALANCES: "sonicGetBalances",

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

  SONIC_STAKE: "sonicStake",
  SONIC_GET_DELEGATIONS: "sonicGetDelegations",
  SONIC_UNSTAKE: "sonicUnstake",
  SONIC_TRADE_QUOTE: "sonicTradeQuote",
  SONIC_SWAP: "sonicSwap",
  SONIC_SEARCH: "sonicSearch",

  // Sonic Points Actions
  SONIC_GET_POINTS: "sonicGetPoints",

  // Knowledge Actions
  SHADOW_TOKEN_SEARCH: "shadowTokenSearch",
  SONIC_DOCS_SEARCH: "sonicDocsSearch",
} as const;
