require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config({ path: ".env.local" });

module.exports = {
  solidity: "0.8.19",
  networks: {
    amoy: {
      url: process.env.ALCHEMY_RPC_URL,
      accounts: process.env.MASTER_WALLET_PRIVATE_KEY ? [process.env.MASTER_WALLET_PRIVATE_KEY] : [],
      chainId: 80002
    }
  }
};
