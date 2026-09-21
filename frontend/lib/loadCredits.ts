import { ethers } from "ethers";
import { getContractRead, getContract, CONTRACT_ADDRESS } from "@/lib/web3";
import { SEED_CREDITS } from "@/lib/data";

// read-only helper that merges on-chain live state with seeded metadata
export async function loadCredits(viewer: string | null) {
  if (!CONTRACT_ADDRESS) return null;
  const c = await getContractRead();
  const n = Number(await c.nextCreditId());
  const owner = await c.owner();
  const retiredTotal = Number(await c.totalCreditsRetired());
  const out = [];
  for (let id = 0; id < n; id++) {
    const [name, location, lat, lng, impactUnit, price, hash, active] =
      await c.getCreditMetadata(id);
    const seed = SEED_CREDITS.find((s) => s.id === id);
    out.push({
      id,
      name,
      location,
      lat: Number(lat) / 1e4,
      lng: Number(lng) / 1e4,
      impactUnit,
      priceOKB: ethers.formatEther(price),
      verificationHash: hash,
      active,
      certified: seed?.initialSupply ?? 0,
      available: Number(await c.balanceOf(owner, id)),
      retiredTotal,
      yourBalance: viewer ? Number(await c.balanceOf(viewer, id)) : 0,
      lastTx: null,
    });
  }
  return out;
}
