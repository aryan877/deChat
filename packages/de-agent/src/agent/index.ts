import { PrivyClient } from "@privy-io/server-auth";
import { ethers } from "ethers";
import { Cluster } from "../types/cluster.js";
import { Config } from "../types/index.js";

interface PrivyConfig {
  privyClient: PrivyClient;
  address: string;
  appId: string;
  appSecret: string;
}

// Privy uses hex strings for quantities
type Quantity = `0x${string}`;

type PrivyTransaction = {
  from?: `0x${string}`;
  to?: `0x${string}`;
  nonce?: Quantity;
  chainId?: Quantity;
  data?: `0x${string}`;
  value?: Quantity;
  gasLimit?: Quantity;
  gasPrice?: Quantity;
  maxFeePerGas?: Quantity;
  maxPriorityFeePerGas?: Quantity;
};

// Extended type to include caip2 field
type PrivyTransactionRequest = {
  address: string;
  chainType: "ethereum";
  caip2: string;
  transaction: PrivyTransaction;
};

// New transaction status response interface
export interface TransactionResult {
  success: boolean;
  hash: string;
  receipt?: ethers.providers.TransactionReceipt;
  error?: string;
  errorCode?: string;
}

export class DeAgent {
  public provider: ethers.providers.JsonRpcProvider;
  public wallet_address: string;
  public config: Config;
  public cluster: Cluster;
  private privyConfig: PrivyConfig;

  constructor(
    rpc_url: string,
    configOrKey: Config | string | null,
    privyClient: PrivyClient,
    address: string,
    appId: string,
    appSecret: string,
    cluster: Cluster = "sonicMainnet"
  ) {
    if (!rpc_url) {
      throw new Error("RPC URL is required");
    }

    this.provider = new ethers.providers.JsonRpcProvider(rpc_url);

    if (configOrKey === null) {
      throw new Error("Config is required");
    }

    if (typeof configOrKey === "string") {
      if (!configOrKey) {
        throw new Error("OPENAI_API_KEY is required if passing string config");
      }
      this.config = { OPENAI_API_KEY: configOrKey };
    } else {
      this.config = configOrKey;
    }

    this.privyConfig = {
      privyClient,
      address,
      appId,
      appSecret,
    };

    this.wallet_address = address;
    this.cluster = cluster;
  }

  private toHexQuantity(value: ethers.BigNumberish): Quantity {
    // Convert to string first to handle BigInt or BigNumber values properly
    const valueStr = value.toString();
    // Remove the 'n' suffix if present (from BigInt)
    const cleanValue = valueStr.endsWith("n")
      ? valueStr.slice(0, -1)
      : valueStr;

    // Use ethers utility to convert to hex
    const hex = ethers.utils.hexlify(ethers.BigNumber.from(cleanValue));
    return hex as Quantity;
  }

  private formatTransactionForPrivy(
    tx: ethers.providers.TransactionRequest,
    chainId: bigint
  ): PrivyTransaction {
    // Ensure chainId is properly formatted
    const chainIdStr = chainId.toString().replace(/n$/, "");

    const formattedTx: PrivyTransaction = {
      from: this.wallet_address as `0x${string}`,
      chainId: this.toHexQuantity(chainIdStr),
    };

    if (tx.to) {
      formattedTx.to = tx.to.toString() as `0x${string}`;
    }
    if (tx.value) {
      formattedTx.value = this.toHexQuantity(tx.value);
    }
    if (tx.nonce) {
      formattedTx.nonce = this.toHexQuantity(tx.nonce);
    }
    if (tx.gasLimit) {
      formattedTx.gasLimit = this.toHexQuantity(tx.gasLimit);
    }
    if (tx.gasPrice) {
      formattedTx.gasPrice = this.toHexQuantity(tx.gasPrice);
    }
    if (tx.maxFeePerGas) {
      formattedTx.maxFeePerGas = this.toHexQuantity(tx.maxFeePerGas);
    }
    if (tx.maxPriorityFeePerGas) {
      formattedTx.maxPriorityFeePerGas = this.toHexQuantity(
        tx.maxPriorityFeePerGas
      );
    }
    if (tx.data) {
      formattedTx.data = tx.data as `0x${string}`;
    }

    return formattedTx;
  }

  async signTransaction(
    tx: ethers.providers.TransactionRequest
  ): Promise<string> {
    try {
      const network = await this.provider.getNetwork();
      const chainId = network.chainId;

      // Explicitly set the chainId in the transaction
      tx.chainId = chainId;

      const formattedTx = this.formatTransactionForPrivy(
        tx,
        BigInt(chainId.toString())
      );

      const request: PrivyTransactionRequest = {
        address: this.privyConfig.address,
        chainType: "ethereum",
        caip2: `eip155:${chainId.toString()}`,
        transaction: formattedTx,
      };

      const { signedTransaction } =
        await this.privyConfig.privyClient.walletApi.ethereum.signTransaction(
          request as any
        );
      return signedTransaction;
    } catch (error) {
      throw new Error(
        `Failed to sign transaction: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async signAllTransactions(
    txs: ethers.providers.TransactionRequest[]
  ): Promise<string[]> {
    try {
      return Promise.all(txs.map((tx) => this.signTransaction(tx)));
    } catch (error) {
      throw new Error(
        `Failed to sign transactions: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async waitForTransactionConfirmation(
    hash: string,
    confirmations: number = 1
  ): Promise<void> {
    try {
      await this.provider.waitForTransaction(hash, confirmations);
    } catch (error: any) {
      throw new Error(`Transaction confirmation failed: ${error.message}`);
    }
  }

  /**
   * Send a transaction and wait for it to confirm
   * @param tx Transaction to send
   * @param options Optional configuration
   * @returns Transaction result with confirmation status
   */
  async sendTransaction(
    tx: ethers.providers.TransactionRequest,
    options: {
      confirmations?: number;
      customRpcUrl?: string;
      gasMultiplier?: number;
    } = {}
  ): Promise<TransactionResult> {
    const confirmations = options.confirmations ?? 1;
    const gasMultiplier = options.gasMultiplier ?? 1.2;

    try {
      // Use custom RPC if provided
      const provider = options.customRpcUrl
        ? new ethers.providers.JsonRpcProvider(options.customRpcUrl)
        : this.provider;

      // Get chain info and set in transaction
      const network = await provider.getNetwork();
      tx.chainId = network.chainId;

      // Check balance for value transactions
      if (tx.value) {
        const balance = await provider.getBalance(this.wallet_address);
        if (balance.lt(tx.value)) {
          return {
            success: false,
            hash: "",
            error: `Insufficient balance: have ${ethers.utils.formatEther(balance)}, need ${ethers.utils.formatEther(tx.value)}`,
            errorCode: "INSUFFICIENT_BALANCE",
          };
        }
      }

      // Prepare transaction with nonce and gas params
      const feeData = await provider.getFeeData();
      const nonce = await provider.getTransactionCount(this.wallet_address);

      const preparedTx: ethers.providers.TransactionRequest = {
        ...tx,
        nonce,
      };

      // Estimate gas or use safe default
      if (!preparedTx.gasLimit) {
        try {
          const estimatedGas = await provider.estimateGas(preparedTx);
          preparedTx.gasLimit = ethers.BigNumber.from(
            Math.floor(estimatedGas.toNumber() * gasMultiplier)
          );
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error";

          // Use safe defaults if estimation fails
          if (preparedTx.data && preparedTx.data !== "0x") {
            preparedTx.gasLimit = ethers.BigNumber.from(500000);
          } else {
            preparedTx.gasLimit = ethers.BigNumber.from(21000);
          }

          // If transaction would revert, report it but continue
          if (errorMessage.includes("revert")) {
            console.warn(
              `Gas estimation indicates transaction might revert: ${errorMessage}`
            );
          }
        }
      }

      // Set gas price parameters
      if (feeData.maxFeePerGas && feeData.maxPriorityFeePerGas) {
        preparedTx.maxFeePerGas =
          preparedTx.maxFeePerGas ||
          ethers.BigNumber.from(
            Math.floor(feeData.maxFeePerGas.toNumber() * gasMultiplier)
          );
        preparedTx.maxPriorityFeePerGas =
          preparedTx.maxPriorityFeePerGas ||
          ethers.BigNumber.from(
            Math.floor(feeData.maxPriorityFeePerGas.toNumber() * gasMultiplier)
          );
      } else if (feeData.gasPrice) {
        preparedTx.gasPrice =
          preparedTx.gasPrice ||
          ethers.BigNumber.from(
            Math.floor(feeData.gasPrice.toNumber() * gasMultiplier)
          );
      }

      // Sign and send transaction
      const signedTx = await this.signTransaction(preparedTx);
      const txResponse = await provider.sendTransaction(signedTx);
      const txHash = txResponse.hash;

      // Wait for confirmation
      const receipt = await provider.waitForTransaction(txHash, confirmations);

      // Check transaction success
      if (receipt.status === 0) {
        return {
          success: false,
          hash: txHash,
          receipt,
          error: "Transaction reverted on chain",
          errorCode: "TX_REVERTED",
        };
      }

      // Return successful result
      return {
        success: true,
        hash: txHash,
        receipt,
      };
    } catch (error) {
      // Handle and categorize errors
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      let errorCode = "TX_FAILED";

      if (errorMessage.includes("insufficient funds")) {
        errorCode = "INSUFFICIENT_FUNDS";
      } else if (errorMessage.includes("nonce")) {
        errorCode = "NONCE_ERROR";
      } else if (errorMessage.includes("gas")) {
        errorCode = "GAS_ERROR";
      } else if (
        errorMessage.includes("timeout") ||
        errorMessage.includes("timed out")
      ) {
        errorCode = "TIMEOUT";
      }

      return {
        success: false,
        hash: "",
        error: errorMessage,
        errorCode,
      };
    }
  }
}
