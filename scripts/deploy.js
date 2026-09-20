/**
 * Deploy SanitovaCredits to X Layer TESTNET (terigon, chainId 1952).
 * Usage: npx hardhat run scripts/deploy.js --network xlayerTestnet
 * Requires DEPLOYER_PRIVATE_KEY in .env and testnet OKB balance.
 */
const { ethers, network } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  const chainId = (await ethers.provider.getNetwork()).chainId;
  console.log("Network:", network.config.name, "chainId:", chainId.toString());
  console.log("Deployer:", deployer.address);

  const bal = await ethers.provider.getBalance(deployer.address);
  console.log("Deployer OKB balance:", ethers.formatEther(bal));
  if (bal < ethers.parseEther("0.1")) {
    console.error("\nNOT ENOUGH OKB. Fund the deployer at an X Layer testnet faucet first:\n  - https://web3.okx.com/xlayer/faucet (OKX wallet)\n  - https://www.l2faucet.com/x-layer (no-gate)\n  Deployer:", deployer.address);
    process.exit(1);
  }

  const F = await ethers.getContractFactory("SanitovaCredits");
  const c = await F.deploy();
  console.log("Deploy tx sent, awaiting confirmation...");
  await c.waitForDeployment();
  const addr = await c.getAddress();
  console.log("DEPLOYED SanitovaCredits at:", addr);

  const size = (c.interface ? null : null);
  const code = await ethers.provider.getCode(addr);
  console.log("on-chain bytecode size (hex chars):", code.length - 2);

  // persist the address
  const fs = require("fs");
  const lines = fs.existsSync(".env") ? fs.readFileSync(".env", "utf8").split("\n") : [];
  const next = lines
    .map((l) => (l.startsWith("CONTRACT_ADDRESS=") ? `CONTRACT_ADDRESS=${addr}` : l))
    .filter((l) => l !== "");
  if (!next.some((l) => l.startsWith("CONTRACT_ADDRESS="))) next.push(`CONTRACT_ADDRESS=${addr}`);
  fs.writeFileSync(".env", next.join("\n") + "\n");
  console.log("CONTRACT_ADDRESS written to .env");

  // Explorer link
  console.log("\nExplorer:", `https://www.okx.com/explorer/xlayer-test/address/${addr}`);
  console.log("\nNext: npm run seed");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
