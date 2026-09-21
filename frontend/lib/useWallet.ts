"use client";
import { useEffect, useState, useCallback } from "react";
import { ethers } from "ethers";
import { getProvider, hasWallet, CHAIN_ID, XLAYER_TESTNET_CHAIN } from "@/lib/web3";

export function useWallet() {
  const [address, setAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const wrongNetwork = chainId != null && chainId !== CHAIN_ID;

  const connect = useCallback(async () => {
    if (!hasWallet()) {
      setError("No EVM wallet detected (MetaMask / OKX Wallet). Install one to continue.");
      return;
    }
    setConnecting(true);
    setError(null);
    try {
      const provider = getProvider();
      const accounts: string[] = await (window as any).ethereum.request({
        method: "eth_requestAccounts",
      });
      const cid = await provider.getNetwork();
      setAddress(accounts[0]);
      setChainId(Number(cid.chainId));
    } catch (e: any) {
      setError(e?.message || "Connection failed or rejected.");
    } finally {
      setConnecting(false);
    }
  }, []);

  const switchNetwork = useCallback(async () => {
    try {
      await (window as any).ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: XLAYER_TESTNET_CHAIN.chainId }],
      });
    } catch (e: any) {
      // 4902 = chain not added -> add it
      if (e?.code === 4902 || e?.data?.originalError?.code === 4902) {
        await (window as any).ethereum.request({
          method: "wallet_addEthereumChain",
          params: [XLAYER_TESTNET_CHAIN],
        });
      } else {
        setError(e?.message || "Network switch failed.");
        return;
      }
    }
    const cid = await getProvider().getNetwork();
    setChainId(Number(cid.chainId));
  }, []);

  const setBusy = useCallback((b: boolean, h?: string) => {
    setPending(b);
    if (h) setTxHash(h);
  }, []);

  // subscribe to account / chain changes
  useEffect(() => {
    if (!hasWallet()) return;
    const eth = (window as any).ethereum;
    const onAcc = (a: string[]) => setAddress(a[0] || null);
    const onChain = (c: { chainId: string }) => setChainId(Number(c.chainId));
    eth.on?.("accountsChanged", onAcc);
    eth.on?.("chainChanged", onChain);
    return () => {
      eth.removeListener?.("accountsChanged", onAcc);
      eth.removeListener?.("chainChanged", onChain);
    };
  }, []);

  // re-check network on mount if we already have an account
  useEffect(() => {
    if (address && hasWallet()) {
      getProvider()
        .getNetwork()
        .then((n) => setChainId(Number(n.chainId)))
        .catch(() => {});
    }
  }, [address]);

  return {
    address,
    chainId,
    connecting,
    wrongNetwork,
    error,
    clearError: () => setError(null),
    txHash,
    pending,
    connect,
    switchNetwork,
    setBusy,
  };
}

export type Wallet = ReturnType<typeof useWallet>;
