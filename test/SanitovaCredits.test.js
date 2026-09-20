const { expect } = require("chai");
const { ethers } = require("hardhat");

const OKB = (n) => ethers.parseEther(n.toString());

// Demo credit classes (same as seed.js)
const CREDITS = [
  { name: "Safe Water Access — Kogi State", location: "Kogi State, Nigeria", lat: 78000, lng: 67400, impactUnit: "households served", price: "0.001", hash: "0x7a3f000000000000000000000000000000000000000000000000000000000001", supply: 1000 },
  { name: "Latrine Construction — Lagos", location: "Lagos, Nigeria", lat: 65244, lng: 33792, impactUnit: "latrines built", price: "0.002", hash: "0x8b2e000000000000000000000000000000000000000000000000000000000002", supply: 500 },
  { name: "Waste Safely Treated — Abuja", location: "Abuja, Nigeria", lat: 90765, lng: 73986, impactUnit: "tonnes", price: "0.0015", hash: "0x9c1d000000000000000000000000000000000000000000000000000000000003", supply: 2000 },
  { name: "Disease Cases Prevented — Kano", location: "Kano, Nigeria", lat: 120022, lng: 85920, impactUnit: "cases", price: "0.003", hash: "0x4f5a000000000000000000000000000000000000000000000000000000000004", supply: 300 },
];

describe("SanitovaCredits", function () {
  let c, owner, buyer, stranger;

  before(async () => {
    [owner, buyer, stranger] = await ethers.getSigners();
  });

  async function deploy() {
    const F = await ethers.getContractFactory("SanitovaCredits");
    c = await F.deploy();
    await c.waitForDeployment();
    // seed all four credits
    for (const cr of CREDITS) {
      await (
        await c.setCreditMetadata(cr.name, cr.location, cr.lat, cr.lng, cr.impactUnit, OKB(cr.price), cr.hash, cr.supply)
      ).wait();
    }
    // Verification authority onboards the registry: approve it to sell inventory.
    await (await c.connect(owner).setApprovalForAll(await c.getAddress(), true)).wait();
    return c;
  }

  describe("deployment & metadata", () => {
    before(async () => {
      c = await deploy();
    });

    it("owner is the deployer", async () => {
      expect(await c.owner()).to.equal(owner.address);
    });

    it("registers 4 credit classes with correct ids", async () => {
      expect(await c.nextCreditId()).to.equal(4);
      const [name, location, lat, lng, unit, price, hash, active] = await c.getCreditMetadata(0);
      expect(name).to.equal("Safe Water Access — Kogi State");
      expect(location).to.equal("Kogi State, Nigeria");
      expect(Number(lat)).to.equal(78000);
      expect(Number(lng)).to.equal(67400);
      expect(unit).to.equal("households served");
      expect(price).to.equal(OKB("0.001"));
      expect(hash).to.equal("0x7a3f000000000000000000000000000000000000000000000000000000000001");
      expect(active).to.equal(true);
    });

    it("mints initial supply to owner", async () => {
      expect(await c.balanceOf(owner.address, 0)).to.equal(1000);
      expect(await c.balanceOf(owner.address, 1)).to.equal(500);
      expect(await c.balanceOf(owner.address, 2)).to.equal(2000);
      expect(await c.balanceOf(owner.address, 3)).to.equal(300);
      expect(await c.totalSupplyCredit(0)).to.equal(1000);
      expect(await c.totalCreditsIssued()).to.equal(3800);
    });

    it("uri(id) returns valid self-contained base64 JSON", async () => {
      const uri = await c.uri(0);
      expect(uri.startsWith("data:application/json;base64,")).to.equal(true);
      const json = Buffer.from(uri.split(",")[1], "base64").toString("utf8");
      const parsed = JSON.parse(json);
      expect(parsed.name).to.equal("Safe Water Access — Kogi State");
      expect(parsed.lat1e4).to.equal(78000);
      expect(parsed.lng1e4).to.equal(67400);
      expect(parsed.impactUnit).to.equal("households served");
      expect(parsed.verificationHash.toLowerCase()).to.equal("0x7a3f000000000000000000000000000000000000000000000000000000000001");
    });

    it("supports ERC-1155 interface", async () => {
      expect(await c.supportsInterface("0xd9b67a26")).to.equal(true); // IERC1155
    });
  });

  describe("buyCredit (public purchase from verified allocation)", () => {
    before(async () => {
      c = await deploy();
    });

    it("buyer pays exact price and receives credits from issuer allocation", async () => {
      await expect(c.connect(buyer).buyCredit(0, 10, { value: OKB("0.01") }))
        .to.emit(c, "CreditPurchased")
        .withArgs(0, buyer.address, 10, OKB("0.01"));
      expect(await c.balanceOf(buyer.address, 0)).to.equal(10);
      expect(await c.balanceOf(owner.address, 0)).to.equal(990); // allocation draws down
      expect(await c.totalSupplyCredit(0)).to.equal(1000); // scarce: no new mint
      expect(await c.treasuryBalance()).to.equal(OKB("0.01"));
    });

    it("rejects wrong payment", async () => {
      await expect(c.connect(buyer).buyCredit(0, 10, { value: OKB("0.005") })).to.be.revertedWith("SAN: wrong amount");
    });

    it("rejects zero amount", async () => {
      await expect(c.connect(buyer).buyCredit(0, 0, { value: 0 })).to.be.revertedWith("SAN: zero amount");
    });

    it("cannot buy beyond the verified allocation", async () => {
      // class 3 has 300 units total; owner holds all 300
      await expect(c.connect(buyer).buyCredit(3, 301, { value: OKB("0.903") })).to.be.revertedWith("SAN: allocation exhausted");
    });

    it("rejects purchase of unknown credit", async () => {
      await expect(c.connect(buyer).buyCredit(99, 1, { value: 0 })).to.be.revertedWith("SAN: credit inactive");
    });
  });

  describe("retireCredit (ESG retirement)", () => {
    before(async () => {
      c = await deploy();
      // buyer buys 20 credits of class 0
      await (await c.connect(buyer).buyCredit(0, 20, { value: OKB("0.02") })).wait();
    });

    it("holder retires and balance is burned", async () => {
      await expect(c.connect(buyer).retireCredit(0, 8))
        .to.emit(c, "CreditRetired")
        .withArgs(0, buyer.address, 8);
      expect(await c.balanceOf(buyer.address, 0)).to.equal(12);
      expect(await c.totalSupplyCredit(0)).to.equal(992);
      expect(await c.totalCreditsRetired()).to.equal(8);
    });

    it("cannot retire more than balance", async () => {
      await expect(c.connect(buyer).retireCredit(0, 9999)).to.be.revertedWith("SAN: insufficient balance");
    });

    it("stranger cannot retire someone else's credits", async () => {
      await expect(c.connect(stranger).retireCredit(0, 1)).to.be.revertedWith("SAN: insufficient balance");
    });

    it("owner can retire on behalf of a holder (corporate treasury)", async () => {
      await expect(c.connect(owner).retireCreditBy(buyer.address, 0, 4))
        .to.emit(c, "CreditRetired")
        .withArgs(0, buyer.address, 4);
      expect(await c.balanceOf(buyer.address, 0)).to.equal(8);
    });
  });

  describe("ownership & governance", () => {
    before(async () => {
      c = await deploy();
    });

    it("mintCredit is owner-only", async () => {
      await expect(c.connect(buyer).mintCredit(0, buyer.address, 1)).to.be.revertedWithCustomError(
        c,
        "OwnableUnauthorizedAccount"
      );
    });

    it("owner mints to a corporate account", async () => {
      await (await c.mintCredit(3, buyer.address, 50)).wait();
      expect(await c.balanceOf(buyer.address, 3)).to.equal(50);
    });

    it("setCreditMetadata is owner-only and mints initial supply", async () => {
      await expect(
        c.connect(buyer).setCreditMetadata("X", "Y", 100000, 100000, "z", OKB("0.001"), ethers.ZeroHash, 10)
      ).to.be.revertedWithCustomError(c, "OwnableUnauthorizedAccount");

      await (
        await c.setCreditMetadata("New Credit — Bauchi", "Bauchi State, Nigeria", 100000, 100000, "wells", OKB("0.004"), ethers.ZeroHash, 100)
      ).wait();
      expect(await c.nextCreditId()).to.equal(5);
      expect(await c.balanceOf(owner.address, 4)).to.equal(100);
    });

    it("deactivateCredit blocks new purchases", async () => {
      await (await c.deactivateCredit(2)).wait();
      await expect(c.connect(buyer).buyCredit(2, 1, { value: OKB("0.0015") })).to.be.revertedWith("SAN: credit inactive");
      const [,, , , , , , active] = await c.getCreditMetadata(2);
      expect(active).to.equal(false);
    });

    it("withdrawOKB moves treasury to owner only", async () => {
      await (await c.connect(buyer).buyCredit(1, 10, { value: OKB("0.02") })).wait();
      const balBefore = await ethers.provider.getBalance(owner.address);
      const tx = await c.withdrawOKB(owner.address, OKB("0.015"));
      const rcpt = await tx.wait();
      const gasCost = rcpt.gasUsed * rcpt.gasPrice;
      const balAfter = await ethers.provider.getBalance(owner.address);
      expect(balAfter + gasCost - balBefore).to.equal(OKB("0.015"));
      await expect(c.connect(buyer).withdrawOKB(buyer.address, 1)).to.be.revertedWithCustomError(c, "OwnableUnauthorizedAccount");
      await expect(c.withdrawOKB(owner.address, OKB("1000"))).to.be.revertedWith("SAN: exceeds treasury");
    });
  });
});
