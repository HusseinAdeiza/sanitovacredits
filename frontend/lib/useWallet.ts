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
    if (!hasWallet()) {
      setError("No EVM wallet detected (MetaMask / OKX Wallet).");
      return;
    }
    const eth = (window as any).ethereum;
    setError(null);
    try {
      await eth.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: XLAYER_TESTNET_CHAIN.chainId }],
      });
    } catch (e: any) {
      const code = Number(e?.code ?? e?.data?.originalError?.code);
      if (code === 4902) {
        // chain not added yet -> ask the wallet to add it
        try {
          await eth.request({
            method: "wallet_addEthereumChain",
            params: [XLAYER_TESTNET_CHAIN],
          });
        } catch (e2: any) {
          const code2 = Number(e2?.code ?? e2?.data?.originalError?.code);
          if (code2 === 4001 || code2 === -32603) {
            setError("Network add was rejected in your wallet. Open MetaMask and approve the 'Add network' prompt.");
          } else {
            setError(e2?.message || "Failed to add X Layer Testnet to your wallet.");
          }
          return;
        }
      } else if (code === -32002) {
        setError("A network request is already pending — open your wallet and approve it.");
        return;
      } else if (code === 4001) {
        setError("Network switch was rejected in your wallet.");
        return;
      } else {
        setError(e?.message || "Network switch failed.");
        return;
      }
    }
    // read the wallet's chain directly (chainChanged event also updates state)
    try {
      const cidHex = await eth.request({ method: "eth_chainId" });
      setChainId(Number(cidHex));
    } catch {
      const cid = await getProvider().getNetwork();
      setChainId(Number(cid.chainId));
    }
  }, []);

  const setBusy = useCallback((b: boolean, h?: string) => {
    setPending(b);
    if (h) setTxHash(h);
  }, []);

  // silent reconnect on mount: if the site is already permitted, restore the session
  useEffect(() => {
    if (!hasWallet()) return;
    (async () => {
      try {
        const accounts: string[] = await (window as any).ethereum.request({ method: "eth_accounts" });
        if (accounts && accounts.length) {
          setAddress(accounts[0]);
          const cidHex = await (window as any).ethereum.request({ method: "eth_chainId" });
          setChainId(Number(cidHex));
        }
      } catch {
        /* not permitted yet — user will press Connect */
      }
    })();
  }, []);

  // read chainId straight from the wallet; keep it fresh on mount + interval + events
  const readChain = useCallback(async () => {
    if (!hasWallet()) return;
    try {
      const cidHex = await (window as any).ethereum.request({ method: "eth_chainId" });
      setChainId(Number(cidHex));
    } catch {
      /* ignore */
    }
  }, []);

  // subscribe to account / chain changes
  useEffect(() => {
    if (!hasWallet()) return;
    const eth = (window as any).ethereum;
    const onAcc = (a: string[]) => setAddress(a[0] || null);
    const onChain = (c: string | { chainId: string }) => {
      const hex = typeof c === "string" ? c : c?.chainId;
      if (hex) setChainId(Number(hex));
    };
    eth.on?.("accountsChanged", onAcc);
    eth.on?.("chainChanged", onChain);
    // belt-and-braces: some wallets miss the event; poll the wallet chain
    readChain();
    const t = setInterval(readChain, 4000);
    return () => {
      eth.removeListener?.("accountsChanged", onAcc);
      eth.removeListener?.("chainChanged", onChain);
      clearInterval(t);
    };
  }, [readChain]);

  // re-check network on mount if we already have an account
  useEffect(() => {
    if (address && hasWallet()) {
      readChain();
    }
  }, [address, readChain]);

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
