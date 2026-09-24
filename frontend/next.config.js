/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  ...(process.env.NEXT_PUBLIC_BASE_PATH
    ? { output: "export", trailingSlash: true, basePath: process.env.NEXT_PUBLIC_BASE_PATH, images: { unoptimized: true } }
    : {}),
  env: {
    NEXT_PUBLIC_CONTRACT_ADDRESS: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "",
    NEXT_PUBLIC_RPC_URL: process.env.NEXT_PUBLIC_RPC_URL || "https://testrpc.xlayer.tech/terigon",
    NEXT_PUBLIC_CHAIN_ID: process.env.NEXT_PUBLIC_CHAIN_ID || "1952",
  },
};

module.exports = nextConfig;
