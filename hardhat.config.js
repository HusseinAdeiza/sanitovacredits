require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const pk = process.env.DEPLOYER_PRIVATE_KEY;

// Funded demo accounts (testnet dev keys — the first is our deployer).
const FUNDED = [
  { privateKey: pk, balance: "10000000000000000000000" }, // 10,000 OKB (deployer)
  { privateKey: "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d", balance: "5000000000000000000000" },
  { privateKey: "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a", balance: "5000000000000000000000" },
];

module.exports = {
  solidity: {
    version: "0.8.24",
    settings: { optimizer: { enabled: true, runs: 200 } },
  },
  networks: {
    // In-process node for `hardhat node` — pinned to X Layer testnet's chainId
    // so the local E2E flow runs against the exact same chainId as terigon.
    hardhat: {
      chainId: 1952,
      accounts: FUNDED,
    },
    // Local node (127.0.0.1:8545) for deploy/seed E2E verification.
    xlayerLocal: {
      url: "http://127.0.0.1:8545",
      chainId: 1952,
      accounts: pk
        ? [
            pk,
            "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d",
            "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a",
          ]
        : [],
    },
    // X Layer TESTNET (terigon) — NOT mainnet. chainId 1952 (0x7a0).
    xlayerTestnet: {
      url: process.env.RPC_URL || "https://testrpc.xlayer.tech/terigon",
      chainId: 1952,
      accounts: pk ? [pk] : [],
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  mocha: { timeout: 60000 },
};
