import React from "react";
import { ACTION_NAMES } from "@repo/de-agent";
import { SupportedChainsSuccess } from "./SupportedChainsSuccess";
import type {
  deBridgeSupportedChainsResponse,
  ChainlinkPriceFeedInfo,
  ChainlinkPriceFeedResponse,
  SonicStakersResponse,
  SonicDelegationsByAddressResponse,
  SonicSearchResult,
  SonicTradeQuoteResponse,
  DuneBalancesResponse,
  deBridgeEnhancedQuoteResponse,
  ShadowTokenSearchResponse,
} from "@repo/de-agent";
import { TransferSuccess } from "./TransferSuccess";
import { ChainlinkPriceFeedsSuccess } from "./ChainlinkPriceFeedsSuccess";
import { ChainlinkPriceDataSuccess } from "./ChainlinkPriceDataSuccess";
import { StakersSuccess } from "./StakersSuccess";
import { DelegateSuccess, type DelegateSuccessData } from "./DelegateSuccess";
import { DelegationsSuccess } from "./DelegationsSuccess";
import { UnstakeSuccess, type UnstakeSuccessData } from "./UnstakeSuccess";
import { SearchSuccess } from "./SearchSuccess";
import { TradeSuccess } from "./TradeSuccess";
import { SwapSuccess, type SwapSuccessData } from "./SwapSuccess";
import {
  AccountInfoSuccess,
  type AccountInfoSuccessData,
} from "./AccountInfoSuccess";
import {
  TokenBalanceSuccess,
  type TokenBalanceSuccessData,
} from "./TokenBalanceSuccess";
import { BalancesSuccess } from "./BalancesSuccess";
import { BridgeQuoteSuccess } from "./BridgeQuoteSuccess";
import {
  BridgeStatusSuccess,
  type BridgeStatusSuccessProps,
} from "./BridgeStatusSuccess";
import {
  BridgeTransferSuccess,
  type BridgeTransferSuccessProps,
} from "./BridgeTransferSuccess";
import {
  SonicPointsSuccess,
  type SonicPointsSuccessProps,
} from "./SonicPointsSuccess";
import { TokenSearchSuccess } from "./TokenSearchSuccess";

// Define a mapping of tool names to their success result types
export type SuccessResultsMap = {
  [ACTION_NAMES.GET_SUPPORTED_CHAINS]: deBridgeSupportedChainsResponse;
  [ACTION_NAMES.SONIC_TRANSFER]: {
    txHash: string;
    explorerUrl: string;
  };
  [ACTION_NAMES.CHAINLINK_GET_PRICE_FEEDS]: {
    feeds: ChainlinkPriceFeedInfo[];
  };
  [ACTION_NAMES.CHAINLINK_GET_PRICE_DATA]: ChainlinkPriceFeedResponse & {
    formattedPrice: string;
  };
  [ACTION_NAMES.SONIC_GET_STAKERS]: SonicStakersResponse;
  [ACTION_NAMES.SONIC_STAKE]: DelegateSuccessData;
  [ACTION_NAMES.SONIC_GET_DELEGATIONS]: SonicDelegationsByAddressResponse;
  [ACTION_NAMES.SONIC_UNSTAKE]: UnstakeSuccessData;
  [ACTION_NAMES.SONIC_SEARCH]: SonicSearchResult[];
  [ACTION_NAMES.SONIC_TRADE_QUOTE]: SonicTradeQuoteResponse;
  [ACTION_NAMES.SONIC_SWAP]: SwapSuccessData;
  [ACTION_NAMES.SONIC_GET_ACCOUNT_INFO]: AccountInfoSuccessData;
  [ACTION_NAMES.SONIC_GET_TOKEN_BALANCE]: TokenBalanceSuccessData;
  [ACTION_NAMES.SONIC_GET_BALANCES]: DuneBalancesResponse;
  [ACTION_NAMES.DEBRIDGE_FETCH_BRIDGE_QUOTE]: deBridgeEnhancedQuoteResponse;
  [ACTION_NAMES.DEBRIDGE_VERIFY_TX_STATUS]: BridgeStatusSuccessProps["data"];
  [ACTION_NAMES.DEBRIDGE_EXECUTE_BRIDGE_TRANSFER]: BridgeTransferSuccessProps["data"];
  [ACTION_NAMES.SONIC_GET_POINTS]: SonicPointsSuccessProps["data"];
  [ACTION_NAMES.SHADOW_TOKEN_SEARCH]: ShadowTokenSearchResponse;
};

// Registry of tools that have success components
export const SUCCESS_COMPONENTS_REGISTRY = {
  [ACTION_NAMES.GET_SUPPORTED_CHAINS]: true,
  [ACTION_NAMES.SONIC_TRANSFER]: true,
  [ACTION_NAMES.CHAINLINK_GET_PRICE_FEEDS]: true,
  [ACTION_NAMES.CHAINLINK_GET_PRICE_DATA]: true,
  [ACTION_NAMES.SONIC_GET_STAKERS]: true,
  [ACTION_NAMES.SONIC_STAKE]: true,
  [ACTION_NAMES.SONIC_GET_DELEGATIONS]: true,
  [ACTION_NAMES.SONIC_UNSTAKE]: true,
  [ACTION_NAMES.SONIC_SEARCH]: true,
  [ACTION_NAMES.SONIC_TRADE_QUOTE]: true,
  [ACTION_NAMES.SONIC_SWAP]: true,
  [ACTION_NAMES.SONIC_GET_ACCOUNT_INFO]: true,
  [ACTION_NAMES.SONIC_GET_TOKEN_BALANCE]: true,
  [ACTION_NAMES.SONIC_GET_BALANCES]: true,
  [ACTION_NAMES.DEBRIDGE_FETCH_BRIDGE_QUOTE]: true,
  [ACTION_NAMES.DEBRIDGE_VERIFY_TX_STATUS]: true,
  [ACTION_NAMES.DEBRIDGE_EXECUTE_BRIDGE_TRANSFER]: true,
  [ACTION_NAMES.SONIC_GET_POINTS]: true,
  [ACTION_NAMES.SHADOW_TOKEN_SEARCH]: true,
} as const;

// Type guard to check if a tool has success results
export function hasSuccessComponent(
  toolName: string
): toolName is keyof SuccessResultsMap {
  return toolName in SUCCESS_COMPONENTS_REGISTRY;
}

interface SuccessResultsProps<T extends keyof SuccessResultsMap> {
  toolName: T;
  data: SuccessResultsMap[T];
}

export function SuccessResults<T extends keyof SuccessResultsMap>({
  toolName,
  data,
}: SuccessResultsProps<T>) {
  switch (toolName) {
    case ACTION_NAMES.GET_SUPPORTED_CHAINS:
      return (
        <SupportedChainsSuccess
          data={data as deBridgeSupportedChainsResponse}
        />
      );
    case ACTION_NAMES.SONIC_TRANSFER:
      return (
        <TransferSuccess
          data={data as SuccessResultsMap[typeof ACTION_NAMES.SONIC_TRANSFER]}
        />
      );
    case ACTION_NAMES.CHAINLINK_GET_PRICE_FEEDS:
      return (
        <ChainlinkPriceFeedsSuccess
          data={
            data as SuccessResultsMap[typeof ACTION_NAMES.CHAINLINK_GET_PRICE_FEEDS]
          }
        />
      );
    case ACTION_NAMES.CHAINLINK_GET_PRICE_DATA:
      return (
        <ChainlinkPriceDataSuccess
          data={
            data as SuccessResultsMap[typeof ACTION_NAMES.CHAINLINK_GET_PRICE_DATA]
          }
        />
      );
    case ACTION_NAMES.SONIC_GET_STAKERS:
      return <StakersSuccess data={data as SonicStakersResponse} />;
    case ACTION_NAMES.SONIC_STAKE:
      return <DelegateSuccess data={data as DelegateSuccessData} />;
    case ACTION_NAMES.SONIC_GET_DELEGATIONS:
      return (
        <DelegationsSuccess data={data as SonicDelegationsByAddressResponse} />
      );
    case ACTION_NAMES.SONIC_UNSTAKE:
      return <UnstakeSuccess data={data as UnstakeSuccessData} />;
    case ACTION_NAMES.SONIC_SEARCH:
      return <SearchSuccess data={data as SonicSearchResult[]} />;
    case ACTION_NAMES.SONIC_TRADE_QUOTE:
      return <TradeSuccess data={data as SonicTradeQuoteResponse} />;
    case ACTION_NAMES.SONIC_SWAP:
      return <SwapSuccess data={data as SwapSuccessData} />;
    case ACTION_NAMES.SONIC_GET_ACCOUNT_INFO:
      return <AccountInfoSuccess data={data as AccountInfoSuccessData} />;
    case ACTION_NAMES.SONIC_GET_TOKEN_BALANCE:
      return <TokenBalanceSuccess data={data as TokenBalanceSuccessData} />;
    case ACTION_NAMES.SONIC_GET_BALANCES:
      return <BalancesSuccess data={data as DuneBalancesResponse} />;
    case ACTION_NAMES.DEBRIDGE_FETCH_BRIDGE_QUOTE:
      return (
        <BridgeQuoteSuccess
          data={{ data: data as deBridgeEnhancedQuoteResponse }}
        />
      );
    case ACTION_NAMES.DEBRIDGE_VERIFY_TX_STATUS:
      return (
        <BridgeStatusSuccess data={data as BridgeStatusSuccessProps["data"]} />
      );
    case ACTION_NAMES.DEBRIDGE_EXECUTE_BRIDGE_TRANSFER:
      return (
        <BridgeTransferSuccess
          data={data as BridgeTransferSuccessProps["data"]}
        />
      );
    case ACTION_NAMES.SONIC_GET_POINTS:
      return (
        <SonicPointsSuccess data={data as SonicPointsSuccessProps["data"]} />
      );
    case ACTION_NAMES.SHADOW_TOKEN_SEARCH:
      return <TokenSearchSuccess data={data as ShadowTokenSearchResponse} />;
    default:
      return null;
  }
}
