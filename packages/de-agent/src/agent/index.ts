import { ethers } from "ethers";
import { Config } from "../types/index.js";
import { PrivyClient } from "@privy-io/server-auth";

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
  public provider: ethers.JsonRpcProvider;
  public wallet_address: string;
  public config: Config;
  private privyConfig: PrivyConfig;

  constructor(
    rpc_url: string,
    configOrKey: Config | string | null,
    privyClient: PrivyClient,
    address: string,
    appId: string,
    appSecret: string
  ) {
    this.provider = new ethers.JsonRpcProvider(
      rpc_url || process.env.SONIC_TESTNET_RPC_URL
    );

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
  }

  private toHexQuantity(value: bigint | number | string): Quantity {
    const hex = BigInt(value).toString(16);
    return `0x${hex}` as Quantity;
  }

  private formatTransactionForPrivy(
    tx: ethers.TransactionRequest,
    chainId: bigint
  ): PrivyTransaction {
    const formattedTx: PrivyTransaction = {
      from: this.wallet_address as `0x${string}`,
      chainId: this.toHexQuantity(chainId),
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

  async signTransaction(tx: ethers.TransactionRequest): Promise<string> {
    try {
      const chainId = await this.provider.getNetwork().then((n) => n.chainId);
      const formattedTx = this.formatTransactionForPrivy(tx, chainId);

      const request: PrivyTransactionRequest = {
        address: this.privyConfig.address,
        chainType: "ethereum",
        caip2: `eip155:${chainId}`,
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
    txs: ethers.TransactionRequest[]
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
    tx: ethers.TransactionRequest,
    options: {
      confirmations?: number;
    } = {}
  ): Promise<string> {
    try {
      const chainId = await this.provider.getNetwork().then((n) => n.chainId);

      // Check balance if value is specified
      if (tx.value) {
        const balance = await this.provider.getBalance(this.wallet_address);
        if (balance < BigInt(tx.value.toString())) {
          throw new Error(
            `Insufficient balance. You have ${ethers.formatEther(balance)} ETH but need ${ethers.formatEther(tx.value)} ETH`
          );
        }
      }

      // Get gas estimate and nonce if not provided
      if (!tx.nonce || !tx.gasLimit) {
        const [gasEstimate, nonce] = await Promise.all([
          this.provider.estimateGas(tx),
          this.provider.getTransactionCount(this.wallet_address),
        ]);

        tx = {
          ...tx,
          gasLimit: tx.gasLimit || gasEstimate,
          nonce: tx.nonce || nonce,
        };
      }

      const formattedTx = this.formatTransactionForPrivy(tx, chainId);

      const request: PrivyTransactionRequest = {
        address: this.privyConfig.address,
        chainType: "ethereum",
        caip2: `eip155:${chainId}`,
        transaction: formattedTx,
      };

      const { hash } =
        await this.privyConfig.privyClient.walletApi.ethereum.sendTransaction(
          request as any
        );

      if (options.confirmations && options.confirmations > 0) {
        await this.waitForTransactionConfirmation(hash, options.confirmations);
      }

      return hash;
    } catch (error) {
      console.error("Error sending transaction", {
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
  }
}
