import { DeAgent } from "../../agent/index.js";
import { Cluster } from "../../types/cluster.js";
import { ethers } from "ethers";
import {
  SonicBridgeResponse,
  SonicBridgeToSonicParams,
  SonicBridgeToEthereumParams,
  SonicClaimOnSonicParams,
  SonicClaimOnEthereumParams,
  SonicBridgeDepositResult,
  SonicBridgeWithdrawalResult,
  SonicBridgeClaimResult,
} from "../../types/nativeBridge.js";

// Contract addresses
const ETH_CONTRACTS = {
  TOKEN_DEPOSIT: "0x37ef98a3c46a921ce959e425cab5047f2a612f54",
  TOKEN_PAIRS: "0xf2b1510c2709072C88C5b14db90Ec3b6297193e4",
  STATE_ORACLE: "0xB7e8CC3F5FeA12443136f0cc13D81F109B2dEd7f",
};

// Sonic (L2) contracts
const SONIC_CONTRACTS = {
  BRIDGE: "0x9Ef7629F9B930168b76283AdD7120777b3c895b3",
  TOKEN_PAIRS: "0x134E4c207aD5A13549DE1eBF8D43c1f49b00ba94",
  STATE_ORACLE: "0x836664B0c0CB29B7877bCcF94159CC996528F2C3",
};

// Block explorer URLs
const BLOCK_EXPLORER_URLS = {
  ethereum: "https://etherscan.io/tx/",
  sonic: "https://sonicscan.org/tx/",
};

// ABIs
const STATE_ORACLE_ABI = [
  "function lastBlockNum() external view returns (uint256)",
  "function lastState() external view returns (bytes32)",
] as const;

const ERC20_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
] as const;

const TOKEN_PAIRS_ABI = [
  "function originalToMinted(address) external view returns (address)",
  "function mintedToOriginal(address) external view returns (address)",
] as const;

const TOKEN_DEPOSIT_ABI = [
  "function deposit(uint256 nonce, address token, uint256 amount) external",
  "function claim(bytes32 txHash, bytes calldata proof) external",
] as const;

const BRIDGE_ABI = [
  "function withdraw(uint256 nonce, address token, uint256 amount) external",
  "function claim(bytes32 txHash, bytes calldata proof) external",
  "event Deposit(uint256 indexed id, address indexed token, uint256 amount)",
  "event Withdrawal(uint256 indexed id, address indexed token, uint256 amount)",
] as const;

/**
 * Bridge tokens from Ethereum to Sonic
 * @param agent DeAgent instance
 * @param params Parameters for bridging tokens to Sonic
 * @param cluster Optional cluster parameter
 * @returns Promise with the bridge response
 */
export async function bridgeToSonic(
  agent: DeAgent,
  params: SonicBridgeToSonicParams,
  _?: Cluster
): Promise<SonicBridgeResponse> {
  try {
    if (!agent.provider) {
      throw new Error("Provider not available");
    }

    // 1. Check if token is supported
    const tokenPairs = new ethers.Contract(
      ETH_CONTRACTS.TOKEN_PAIRS,
      TOKEN_PAIRS_ABI,
      agent.provider
    ) as ethers.Contract & {
      originalToMinted(address: string): Promise<string>;
    };

    const mintedToken = await tokenPairs.originalToMinted(params.tokenAddress);
    if (mintedToken === ethers.ZeroAddress) {
      throw new Error("Token not supported");
    }

    // 2. Approve token spending
    const token = new ethers.Contract(
      params.tokenAddress,
      ERC20_ABI,
      agent.provider
    ) as ethers.Contract & {
      approve(
        spender: string,
        amount: string
      ): Promise<ethers.ContractTransactionResponse>;
    };

    const approveTx = await token.approve(
      ETH_CONTRACTS.TOKEN_DEPOSIT,
      params.amount
    );
    const approveReceipt = await approveTx.wait();
    if (!approveReceipt) {
      throw new Error("Failed to get approval receipt");
    }

    // 3. Deposit tokens
    const deposit = new ethers.Contract(
      ETH_CONTRACTS.TOKEN_DEPOSIT,
      TOKEN_DEPOSIT_ABI,
      agent.provider
    ) as ethers.Contract & {
      deposit(
        nonce: number,
        token: string,
        amount: string
      ): Promise<ethers.ContractTransactionResponse>;
    };

    const nonce = Date.now();
    const tx = await deposit.deposit(nonce, params.tokenAddress, params.amount);
    const receipt = await tx.wait();
    if (!receipt) {
      throw new Error("Failed to get transaction receipt");
    }

    const depositEvent = receipt.logs.find((log) => {
      const parsedLog = deposit.interface.parseLog(log as ethers.Log);
      return parsedLog?.name === "Deposit";
    });

    const depositId = depositEvent
      ? deposit.interface
          .parseLog(depositEvent as ethers.Log)
          ?.args?.[0]?.toString()
      : undefined;

    const result: SonicBridgeDepositResult = {
      transactionHash: receipt.hash,
      mintedToken,
      blockNumber: receipt.blockNumber,
      depositId,
    };

    return {
      status: "success",
      message: `Successfully bridged ${params.amount} of token ${params.tokenAddress} to Sonic`,
      data: result,
    };
  } catch (error) {
    return {
      status: "error",
      message: "Failed to bridge tokens to Sonic",
      error: {
        code: "BRIDGE_ERROR",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
        details: error,
      },
    };
  }
}

/**
 * Wait for state oracle update
 * @param blockNumber Block number to wait for
 * @param isEthereum Whether to check Ethereum or Sonic state oracle
 * @returns Promise that resolves when the state is updated
 */
async function waitForStateUpdate(
  blockNumber: number,
  isEthereum: boolean,
  provider: ethers.Provider
): Promise<void> {
  const stateOracle = new ethers.Contract(
    isEthereum ? ETH_CONTRACTS.STATE_ORACLE : SONIC_CONTRACTS.STATE_ORACLE,
    STATE_ORACLE_ABI,
    provider
  ) as ethers.Contract & {
    lastBlockNum(): Promise<bigint>;
  };

  while (true) {
    const currentBlockNum = await stateOracle.lastBlockNum();
    if (currentBlockNum >= blockNumber) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 30000));
  }
}

/**
 * Generate proof for deposits
 * @param depositId Deposit ID
 * @param provider Ethereum provider
 * @returns Promise with the generated proof
 */
async function generateDepositProof(
  depositId: string,
  provider: ethers.Provider
): Promise<string> {
  // Generate storage slot for deposit
  const storageSlot = ethers.keccak256(
    ethers.AbiCoder.defaultAbiCoder().encode(
      ["uint256", "uint8"],
      [depositId, 7]
    )
  );

  // Get proof from Ethereum node
  const jsonRpcProvider = provider as ethers.JsonRpcProvider;
  const proof = await jsonRpcProvider.send("eth_getProof", [
    ETH_CONTRACTS.TOKEN_DEPOSIT,
    [storageSlot],
    "latest",
  ]);

  // Encode proof in required format
  return ethers.encodeRlp([
    ethers.encodeRlp(proof.accountProof),
    ethers.encodeRlp(proof.storageProof[0].proof),
  ]);
}

/**
 * Generate proof for withdrawals
 * @param withdrawalId Withdrawal ID
 * @param provider Sonic provider
 * @returns Promise with the generated proof
 */
async function generateWithdrawalProof(
  withdrawalId: string,
  provider: ethers.Provider
): Promise<string> {
  // Generate storage slot for withdrawal
  const storageSlot = ethers.keccak256(
    ethers.AbiCoder.defaultAbiCoder().encode(
      ["uint256", "uint8"],
      [withdrawalId, 1]
    )
  );

  // Get proof from Sonic node
  const jsonRpcProvider = provider as ethers.JsonRpcProvider;
  const proof = await jsonRpcProvider.send("eth_getProof", [
    SONIC_CONTRACTS.BRIDGE,
    [storageSlot],
    "latest",
  ]);

  // Encode proof in required format
  return ethers.encodeRlp([
    ethers.encodeRlp(proof.accountProof),
    ethers.encodeRlp(proof.storageProof[0].proof),
  ]);
}

/**
 * Get explorer URL for a transaction
 * @param txHash Transaction hash
 * @param isEthereum Whether this is an Ethereum or Sonic transaction
 * @returns Explorer URL
 */
function getExplorerUrl(txHash: string, isEthereum: boolean): string {
  const baseUrl = isEthereum
    ? BLOCK_EXPLORER_URLS.ethereum
    : BLOCK_EXPLORER_URLS.sonic;
  return `${baseUrl}${txHash}`;
}

/**
 * Claim tokens on Sonic after bridging from Ethereum
 * @param agent DeAgent instance
 * @param params Parameters for claiming tokens on Sonic
 * @param cluster Optional cluster parameter
 * @returns Promise with the claim response
 */
export async function claimOnSonic(
  agent: DeAgent,
  params: SonicClaimOnSonicParams,
  _?: Cluster
): Promise<SonicBridgeResponse> {
  try {
    if (!agent.provider) {
      throw new Error("Provider not available");
    }

    const signer = await agent.provider.getSigner();
    if (!signer) {
      throw new Error("Signer not available");
    }

    // 1. Wait for state oracle update
    await waitForStateUpdate(params.depositBlockNumber, false, agent.provider);

    // 2. Generate proof
    const proof = await generateDepositProof(params.depositId, agent.provider);

    // 3. Claim tokens with proof
    const bridge = new ethers.Contract(
      SONIC_CONTRACTS.BRIDGE,
      BRIDGE_ABI,
      signer
    ) as ethers.Contract & {
      claim(
        txHash: string,
        proof: string
      ): Promise<ethers.ContractTransactionResponse>;
    };
    const tx = await bridge.claim(params.depositTxHash, proof);
    const receipt = await tx.wait();
    if (!receipt) {
      throw new Error("Failed to get transaction receipt");
    }

    const result: SonicBridgeClaimResult = {
      transactionHash: receipt.hash,
      explorerUrl: getExplorerUrl(receipt.hash, false),
    };

    return {
      status: "success",
      message: `Successfully claimed tokens on Sonic from deposit ${params.depositId}`,
      data: result,
    };
  } catch (error) {
    return {
      status: "error",
      message: "Failed to claim tokens on Sonic",
      error: {
        code: "CLAIM_ERROR",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
        details: error,
      },
    };
  }
}

/**
 * Bridge tokens from Sonic to Ethereum
 * @param agent DeAgent instance
 * @param params Parameters for bridging tokens to Ethereum
 * @param cluster Optional cluster parameter
 * @returns Promise with the bridge response
 */
export async function bridgeToEthereum(
  agent: DeAgent,
  params: SonicBridgeToEthereumParams,
  _?: Cluster
): Promise<SonicBridgeResponse> {
  try {
    if (!agent.provider) {
      throw new Error("Provider not available");
    }

    // 1. Check if token is supported
    const tokenPairs = new ethers.Contract(
      SONIC_CONTRACTS.TOKEN_PAIRS,
      TOKEN_PAIRS_ABI,
      agent.provider
    ) as ethers.Contract & {
      mintedToOriginal(address: string): Promise<string>;
    };

    const originalToken = await tokenPairs.mintedToOriginal(
      params.tokenAddress
    );
    if (originalToken === ethers.ZeroAddress) {
      throw new Error("Token not supported");
    }

    // 2. Initiate withdrawal
    const bridge = new ethers.Contract(
      SONIC_CONTRACTS.BRIDGE,
      BRIDGE_ABI,
      agent.provider
    ) as ethers.Contract & {
      withdraw(
        nonce: number,
        token: string,
        amount: string
      ): Promise<ethers.ContractTransactionResponse>;
    };

    const nonce = Date.now();
    const tx = await bridge.withdraw(nonce, originalToken, params.amount);
    const receipt = await tx.wait();
    if (!receipt) {
      throw new Error("Failed to get transaction receipt");
    }

    const withdrawalEvent = receipt.logs.find((log) => {
      const parsedLog = bridge.interface.parseLog(log as ethers.Log);
      return parsedLog?.name === "Withdrawal";
    });

    const withdrawalId = withdrawalEvent
      ? bridge.interface
          .parseLog(withdrawalEvent as ethers.Log)
          ?.args?.[0]?.toString()
      : undefined;

    const result: SonicBridgeWithdrawalResult = {
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      withdrawalId,
    };

    return {
      status: "success",
      message: `Successfully initiated withdrawal of ${params.amount} of token ${params.tokenAddress} to Ethereum`,
      data: result,
    };
  } catch (error) {
    return {
      status: "error",
      message: "Failed to bridge tokens to Ethereum",
      error: {
        code: "BRIDGE_ERROR",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
        details: error,
      },
    };
  }
}

/**
 * Claim tokens on Ethereum after bridging from Sonic
 * @param agent DeAgent instance
 * @param params Parameters for claiming tokens on Ethereum
 * @param cluster Optional cluster parameter
 * @returns Promise with the claim response
 */
export async function claimOnEthereum(
  agent: DeAgent,
  params: SonicClaimOnEthereumParams,
  _?: Cluster
): Promise<SonicBridgeResponse> {
  try {
    if (!agent.provider) {
      throw new Error("Provider not available");
    }

    // 1. Wait for state oracle update
    await waitForStateUpdate(
      params.withdrawalBlockNumber,
      true,
      agent.provider
    );

    // 2. Generate proof
    const proof = await generateWithdrawalProof(
      params.withdrawalId,
      agent.provider
    );

    // 3. Claim tokens with proof
    const deposit = new ethers.Contract(
      ETH_CONTRACTS.TOKEN_DEPOSIT,
      TOKEN_DEPOSIT_ABI,
      agent.provider
    ) as ethers.Contract & {
      claim(
        txHash: string,
        proof: string
      ): Promise<ethers.ContractTransactionResponse>;
    };

    const tx = await deposit.claim(params.withdrawalTxHash, proof);
    const receipt = await tx.wait();
    if (!receipt) {
      throw new Error("Failed to get transaction receipt");
    }

    const result: SonicBridgeClaimResult = {
      transactionHash: receipt.hash,
      explorerUrl: getExplorerUrl(receipt.hash, true),
    };

    return {
      status: "success",
      message: `Successfully claimed tokens on Ethereum from withdrawal ${params.withdrawalId}`,
      data: result,
    };
  } catch (error) {
    return {
      status: "error",
      message: "Failed to claim tokens on Ethereum",
      error: {
        code: "CLAIM_ERROR",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
        details: error,
      },
    };
  }
}
