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

  async sendTransaction(
    tx: ethers.providers.TransactionRequest,
    options: {
      confirmations?: number;
      customRpcUrl?: string;
      gasMultiplier?: number;
    } = {}
  ): Promise<string> {
    try {
      const provider = options.customRpcUrl
        ? new ethers.providers.JsonRpcProvider(options.customRpcUrl)
        : this.provider;

      const network = await provider.getNetwork();
      const chainId = network.chainId;

      tx.chainId = chainId;

      if (tx.value) {
        const balance = await provider.getBalance(this.wallet_address);
        if (balance.lt(tx.value)) {
          throw new Error(
            `Insufficient balance. You have ${ethers.utils.formatEther(balance)} ETH but need ${ethers.utils.formatEther(tx.value)} ETH`
          );
        }
      }

      const feeData = await provider.getFeeData();

      const gasMultiplier = options.gasMultiplier || 1.2;

      const preparedTx: ethers.providers.TransactionRequest = {
        ...tx,
        nonce:
          tx.nonce || (await provider.getTransactionCount(this.wallet_address)),
      };

      // Try to estimate gas, but use a safe default if it fails
      if (!preparedTx.gasLimit) {
        try {
          const estimatedGas = await provider.estimateGas(preparedTx);
          // Apply a safety margin to the gas estimate (120% of the estimated value)
          preparedTx.gasLimit = ethers.BigNumber.from(
            Math.floor(estimatedGas.toNumber() * gasMultiplier)
          );

          // Ensure we don't exceed block gas limit
          const block = await provider.getBlock("latest");
          if (block && preparedTx.gasLimit.gt(block.gasLimit)) {
            preparedTx.gasLimit = ethers.BigNumber.from(
              Math.floor(block.gasLimit.toNumber() * 0.9) // 90% of block gas limit
            );
          }
        } catch (error) {
          // Get specific error message if available
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
          console.warn(`Gas estimation failed: ${errorMessage}`);

          // Use appropriate fallback gas limits based on transaction type
          if (preparedTx.data && preparedTx.data !== "0x") {
            // Contract interaction - higher gas limit
            preparedTx.gasLimit = ethers.BigNumber.from(500000);
          } else {
            // Simple transfer - lower gas limit
            preparedTx.gasLimit = ethers.BigNumber.from(21000);
          }
        }
      }

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

      const signedTx = await this.signTransaction(preparedTx);

      const txResponse = await provider.sendTransaction(signedTx);
      const txHash = txResponse.hash;

      if (options.confirmations && options.confirmations > 0) {
        await provider.waitForTransaction(txHash, options.confirmations);
      }

      return txHash;
    } catch (error) {
      console.error("Error sending transaction", {
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
  }
}
