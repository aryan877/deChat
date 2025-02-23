export const ACTION_NAMES = {
  GET_SUPPORTED_CHAINS: "getSupportedChains",
  ASK_FOR_CONFIRMATION: "askForConfirmation",

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
} as const;
