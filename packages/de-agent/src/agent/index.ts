import { ethers } from "ethers";
import { Config } from "../types/index.js";
import { PrivyClient } from "@privy-io/server-auth";

interface PrivyConfig {
  privyClient: PrivyClient;
  address: string;
  appId: string;
  appSecret: string;
}

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

  async signTransaction(tx: ethers.TransactionRequest): Promise<string> {
    try {
      const chainId = await this.provider.getNetwork().then((n) => n.chainId);
      const { signedTransaction } =
        await this.privyConfig.privyClient.walletApi.ethereum.signTransaction({
          address: this.privyConfig.address,
          chainType: "ethereum",
          transaction: {
            ...tx,
            chainId: Number(chainId),
          },
        });
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

      const { hash } =
        await this.privyConfig.privyClient.walletApi.ethereum.sendTransaction({
          address: this.privyConfig.address,
          chainType: "ethereum",
          transaction: {
            ...tx,
            chainId: Number(chainId),
          },
        });

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
