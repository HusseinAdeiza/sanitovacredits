/**
 * Seed the 4 demo credit classes on the deployed contract (X Layer testnet).
 * verificationHash = real sha256 of a canonical inspection descriptor, so the
 * "inspection hash" is a genuine hash of real content (not a fake constant).
 * Usage: npx hardhat run scripts/seed.js --network xlayerTestnet
 */
const { ethers, network } = require("hardhat");
const crypto = require("crypto");
const fs = require("fs");

const OKB = (n) => ethers.parseEther(n.toString());

// 4 WASH credit classes (demo/seed data per brief). lat/lng * 1e4.
const CREDITS = [
  { name: "Safe Water Access — Kogi State", location: "Kogi State, Nigeria", lat: 7.8000, lng: 6.7400, impactUnit: "households served", price: "0.001", supply: 1000 },
  { name: "Latrine Construction — Lagos", location: "Lagos, Nigeria", lat: 6.5244, lng: 3.3792, impactUnit: "latrines built", price: "0.002", supply: 500 },
  { name: "Waste Safely Treated — Abuja", location: "Abuja, Nigeria", lat: 9.0765, lng: 7.3986, impactUnit: "tonnes", price: "0.0015", supply: 2000 },
  { name: "Disease Cases Prevented — Kano", location: "Kano, Nigeria", lat: 12.0022, lng: 8.5920, impactUnit: "cases", price: "0.003", supply: 300 },
];

function inspectionHash(c) {
  const canonical = `sanitova|${c.name}|${c.location}|lat=${c.lat},lng=${c.lng}|impact=${c.impactUnit}|verified=2026-08`;
  return "0x" + crypto.createHash("sha256").update(canonical).digest("hex");
}

async function main() {
  const [owner] = await ethers.getSigners();
  const env = Object.fromEntries(fs.readFileSync(".env", "utf8").split("\n").map((l) => l.split("=")).filter((p) => p[0]));
  const addr = env.CONTRACT_ADDRESS;
  if (!addr || addr === "undefined") throw new Error("CONTRACT_ADDRESS not set — run deploy first");
  const c = await ethers.getContractAt("SanitovaCredits", addr);
  console.log("Seeding", CREDITS.length, "credit classes at", addr, "as owner", owner.address);

  // idempotency: if already seeded (nextCreditId > 0), skip
  const existing = await c.nextCreditId();
  if (existing > 0) {
    console.log(`Contract already has ${existing} credit classes. Re-seed would append new ids.`);
    console.log("Continuing (append). To start fresh, redeploy.\n");
  }

  for (const cr of CREDITS) {
    const hash = inspectionHash(cr);
    const tx = await c.setCreditMetadata(
      cr.name, cr.location,
      Math.round(cr.lat * 1e4), Math.round(cr.lng * 1e4),
      cr.impactUnit, OKB(cr.price), hash, cr.supply
    );
    const rcpt = await tx.wait();
    console.log(`+ ${cr.name}  (tx ${rcpt.hash.slice(0, 18)}…)  hash=${hash.slice(0, 18)}…`);
  }

  // onboarding: owner approves the registry to sell inventory (buyCredit)
  if (await c.isApprovedForAll(owner.address, addr) === false) {
    const tx = await c.setApprovalForAll(addr, true);
    await tx.wait();
    console.log("Approved registry as seller for owner allocation.");
  }

  // read back + print
  const n = Number(await c.nextCreditId());
  console.log(`\nTotal credit classes: ${n}`);
  for (let i = 0; i < n; i++) {
    const [name, location, lat, lng, unit, price, hash, active] = await c.getCreditMetadata(i);
    console.log(`  [${i}] ${name} | ${location} | ${lat / 1e4}, ${lng / 1e4} | ${unit} | ${ethers.formatEther(price)} OKB | supply=${(await c.totalSupplyCredit(i)).toString()} | active=${active}`);
  }

  // persist the seed metadata (frontend reads on-chain, but keep a copy for docs)
  const out = CREDITS.map((cr, i) => ({
    id: existing + i,
    name: cr.name, location: cr.location,
    lat: cr.lat, lng: cr.lng,
    impactUnit: cr.impactUnit,
    pricePerUnitOKB: cr.price,
    initialSupply: cr.supply,
    verificationHash: inspectionHash(cr),
  }));
  fs.writeFileSync("seeded-credits.json", JSON.stringify(out, null, 2));
  console.log("\nWrote seeded-credits.json");
}

main().catch((e) => { console.error(e); process.exit(1); });
