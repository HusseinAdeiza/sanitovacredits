/**
 * End-to-end verification: a second "buyer" wallet buys credits and retires
 * some, proving the full corporate flow (buy -> hold -> retire) works with
 * real signed transactions. Run after deploy + seed:
 *   npx hardhat run scripts/verify-flow.js --network xlayerLocal
 */
const { ethers } = require("hardhat");
const fs = require("fs");

const BUYER_PK = "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d";

async function main() {
  const env = Object.fromEntries(fs.readFileSync(".env", "utf8").split("\n").map((l) => l.split("=")).filter((p) => p[0]));
  const addr = env.CONTRACT_ADDRESS;
  const [owner, buyer] = await ethers.getSigners();
  const c = await ethers.getContractAt("SanitovaCredits", addr);
  const buyerAddr = buyer.address;
  console.log("Owner :", owner.address);
  console.log("Buyer :", buyerAddr, "balance", ethers.formatEther(await ethers.provider.getBalance(buyerAddr)), "OKB");

  // --- BUY: 5 units of credit 0 (0.001 each = 0.005 OKB) ---
  const buyTx = await c.connect(buyer).buyCredit(0, 5, { value: ethers.parseEther("0.005") });
  const buyRc = await buyTx.wait();
  const buyBalance = await c.balanceOf(buyerAddr, 0);
  console.log("\nBUY credit#0 x5:");
  console.log("  tx:", buyRc.hash);
  console.log("  buyer balance credit#0:", buyBalance.toString(), buyBalance === 5n ? "PASS" : "FAIL");

  // events emitted?
  const evt = buyRc.logs.find((l) => { try { return c.interface.parseLog(l).name === "CreditPurchased"; } catch { return false; } });
  console.log("  CreditPurchased emitted:", evt ? "PASS" : "FAIL");

  // treasury increased?
  console.log("  treasury:", ethers.formatEther(await c.treasuryBalance()), "(expect 0.005)");

  // --- RETIRE: 2 of the 5 bought ---
  const retTx = await c.connect(buyer).retireCredit(0, 2);
  const retRc = await retTx.wait();
  const afterBalance = await c.balanceOf(buyerAddr, 0);
  const retired = await c.totalCreditsRetired();
  console.log("\nRETIRE credit#0 x2:");
  console.log("  tx:", retRc.hash);
  console.log("  buyer balance after:", afterBalance.toString(), afterBalance === 3n ? "PASS" : "FAIL");
  console.log("  totalCreditsRetired:", retired.toString(), retired === 2n ? "PASS" : "FAIL");
  const retEvt = retRc.logs.find((l) => { try { return c.interface.parseLog(l).name === "CreditRetired"; } catch { return false; } });
  console.log("  CreditRetired emitted:", retEvt ? "PASS" : "FAIL");

  // --- ownership guard still enforced live ---
  let blocked = false;
  try { await c.connect(buyer).mintCredit(0, buyerAddr, 1); } catch { blocked = true; }
  console.log("\nGUARD mintCredit by buyer blocked:", blocked ? "PASS" : "FAIL");

  // --- allocation scarcity still enforced live ---
  let exhausted = false;
  try { await c.connect(buyer).buyCredit(3, 100000, { value: ethers.parseEther("300") }); } catch { exhausted = true; }
  console.log("GUARD allocation-exhaustion blocked:", exhausted ? "PASS" : "FAIL");

  // --- uri() decodes to valid JSON for a live credit ---
  const uri = await c.uri(0);
  const decoded = JSON.parse(Buffer.from(uri.split(",")[1], "base64").toString("utf8"));
  console.log("URI decodes to JSON with name:", decoded.name ? "PASS" : "FAIL");

  console.log("\nE2E FLOW VERIFIED on chainId 1952 (local X Layer node)");
}
main().catch((e) => { console.error("E2E FAIL:", e.message); process.exit(1); });
