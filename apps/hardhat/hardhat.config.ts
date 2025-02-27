import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config();

const PRIVATE_KEY = process.env.PRIVATE_KEY || "your-private-key";

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  networks: {
    sonicBlaze: {
      url: "https://rpc.blaze.soniclabs.com",
      chainId: 57054,
      accounts: [PRIVATE_KEY],
    },
    sonicMainnet: {
      url:
        process.env.SONIC_MAINNET_RPC_URL || "https://rpc.sonic.soniclabs.com",
      chainId: 146, // Sonic Mainnet chain ID (0x92 in hex)
      accounts: [PRIVATE_KEY],
    },
  },
};

export default config;
