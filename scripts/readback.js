const { ethers } = require("hardhat");
const fs = require("fs");
const crypto = require("crypto");
const CREDITS = [
  { name: "Safe Water Access — Kogi State", location: "Lokoja, Kogi State, Nigeria", lat: 7.8, lng: 6.74, impactUnit: "households served", price: "0.001", supply: 1000 },
  { name: "Latrine Construction — Lagos", location: "Ikorodu, Lagos, Nigeria", lat: 6.5244, lng: 3.3792, impactUnit: "latrines built", price: "0.002", supply: 500 },
  { name: "Waste Safely Treated — Abuja", location: "Kwali, FCT Abuja, Nigeria", lat: 9.0765, lng: 7.3986, impactUnit: "tonnes treated", price: "0.0015", supply: 2000 },
  { name: "Disease Cases Prevented — Kano", location: "Kano Municipal, Kano State, Nigeria", lat: 12.0022, lng: 8.592, impactUnit: "cases prevented", price: "0.003", supply: 300 },
];
function inspectionHash(c){const s=`sanitova|${c.name}|${c.location}|lat=${c.lat},lng=${c.lng}|impact=${c.impactUnit}|verified=2026-08`;return "0x"+crypto.createHash("sha256").update(s).digest("hex");}
(async () => {
  const env = Object.fromEntries(fs.readFileSync(".env","utf8").split("\n").map(l=>l.split("=")).filter(p=>p[0]));
  const c = await ethers.getContractAt("SanitovaCredits", env.CONTRACT_ADDRESS);
  const n = Number(await c.nextCreditId());
  console.log("on-chain credit classes:", n);
  const out=[];
  for (let i=0;i<n;i++){
    const [name,location,lat,lng,unit,price,hash,active]=await c.getCreditMetadata(i);
    const owner=await c.owner();
    const avail=Number(await c.balanceOf(owner,i));
    console.log(`  [${i}] ${name} | ${location} | ${Number(lat)/1e4},${Number(lng)/1e4} | ${unit} | ${ethers.formatEther(price)} OKB | avail=${avail} | active=${active}`);
    out.push({id:i,name,location,lat:Number(lat)/1e4,lng:Number(lng)/1e4,impactUnit:unit,pricePerUnitOKB:ethers.formatEther(price),initialSupply:avail,verificationHash:hash,active});
  }
  fs.writeFileSync("seeded-credits.json", JSON.stringify(out,null,2));
  console.log("wrote seeded-credits.json");
})();
