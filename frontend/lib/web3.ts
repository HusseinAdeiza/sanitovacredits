import { ethers } from "ethers";

export const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || "https://testrpc.xlayer.tech/terigon";
export const CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID || 1952);
export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "";

// X Layer testnet chain definition (for wallet network switching)
export const XLAYER_TESTNET_CHAIN = {
  chainId: "0x7a0", // 1952
  chainName: "X Layer Testnet (terigon)",
  nativeCurrency: { name: "OKB (Test)", symbol: "OKB", decimals: 18 },
  rpcUrls: [RPC_URL],
  blockExplorerUrls: ["https://www.okx.com/web3/explorer/xlayer-test"],
};

// Minimal ERC-1155 + our methods ABI
export const ABI = [
  "function getCreditMetadata(uint256) view returns (string name, string location, uint24 lat, uint24 lng, string impactUnit, uint256 pricePerUnit, bytes32 verificationHash, bool active)",
  "function nextCreditId() view returns (uint256)",
  "function owner() view returns (address)",
  "function totalSupplyCredit(uint256) view returns (uint256)",
  "function balanceOf(address,uint256) view returns (uint256)",
  "function totalCreditsIssued() view returns (uint256)",
  "function totalCreditsRetired() view returns (uint256)",
  "function buyCredit(uint256 id, uint256 amount) payable",
  "function retireCredit(uint256 id, uint256 amount)",
  "function uri(uint256) view returns (string)",
  "event CreditPurchased(uint256 indexed id, address indexed buyer, uint256 amount, uint256 priceOKB)",
  "event CreditRetired(uint256 indexed id, address indexed by, uint256 amount)",
];

declare global {
  interface Window {
    ethereum?: any;
  }
}

let providerCache: ethers.BrowserProvider | null = null;
export function getProvider(): ethers.BrowserProvider {
  if (!providerCache) providerCache = new ethers.BrowserProvider(window.ethereum);
  return providerCache;
}

export function hasWallet() {
  return typeof window !== "undefined" && !!window.ethereum;
}

export async function getContract(signer?: ethers.Signer | null): Promise<ethers.Contract> {
  const s = signer || (await getProvider().getSigner());
  return new ethers.Contract(CONTRACT_ADDRESS, ABI, s);
}

export async function getContractRead(): Promise<ethers.Contract> {
  const p = new ethers.JsonRpcProvider(RPC_URL, CHAIN_ID, { staticNetwork: true });
  return new ethers.Contract(CONTRACT_ADDRESS, ABI, p);
}

export function fmtOKB(wei: ethers.BigNumberish): string {
  return ethers.formatEther(wei);
}
