"use client";
import { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { ethers } from "ethers";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import BeforeAfter from "@/components/BeforeAfter";
import ProofMetricBanner from "@/components/ProofMetricBanner";
import CreditCard, { type LiveCredit } from "@/components/CreditCard";
import BuyModal from "@/components/BuyModal";
import RetireModal from "@/components/RetireModal";
import { EmptyState, Banner, LoadingDots } from "@/components/ErrorStates";
import { useWallet } from "@/lib/useWallet";
import { loadCredits } from "@/lib/loadCredits";
import { getContract, getContractRead, CONTRACT_ADDRESS, CHAIN_ID } from "@/lib/web3";
import { SEED_CREDITS } from "@/lib/data";

const Map = dynamic(() => import("@/components/Map"), { ssr: false });

export default function Home() {
  const wallet = useWallet();
  const [credits, setCredits] = useState<LiveCredit[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [buying, setBuying] = useState<LiveCredit | null>(null);
  const [retiring, setRetiring] = useState<LiveCredit | null>(null);
  const [lastAction, setLastAction] = useState<{ type: string; hash: string } | null>(null);

  const refresh = useCallback(async () => {
    try {
      const viewer = wallet.address;
      const data = await loadCredits(viewer);
      if (data) {
        setCredits(data);
        setLoadError(null);
      }
    } catch (e: any) {
      setLoadError(e?.shortMessage || e?.message || "Failed to load on-chain credits.");
    } finally {
      setLoading(false);
    }
  }, [wallet.address]);

  // initial + polling + on-account-change
  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 15000);
    return () => clearInterval(t);
  }, [refresh]);

  const doBuy = async (id: number, amount: number): Promise<string> => {
    const c = credits?.find((x) => x.id === id);
    if (!c) throw new Error("Credit not found");
    const price = ethers.parseEther(c.priceOKB) * BigInt(amount);
    const contract = await getContract();
    const tx = await contract.buyCredit(id, amount, { value: price });
    const rcpt = await tx.wait();
    setLastAction({ type: "buy", hash: rcpt.hash });
    await refresh();
    return rcpt.hash;
  };

  const doRetire = async (id: number, amount: number): Promise<string> => {
    const contract = await getContract();
    const tx = await contract.retireCredit(id, amount);
    const rcpt = await tx.wait();
    setLastAction({ type: "retire", hash: rcpt.hash });
    await refresh();
    return rcpt.hash;
  };

  const noContract = !CONTRACT_ADDRESS;

  return (
    <>
      <Header wallet={wallet} />
      <Hero />
      <ProofMetricBanner />

      {lastAction && (
        <Banner kind="info">
          {lastAction.type === "buy" ? "Purchase" : "Retirement"} confirmed on-chain:{" "}
          <a
            href={`https://www.okx.com/explorer/xlayer-test/transaction/${lastAction.hash}`}
            target="_blank"
            rel="noreferrer"
            className="font-mono text-[11px] text-gold break-all"
          >
            {lastAction.hash.slice(0, 18)}…
          </a>
        </Banner>
      )}

      {noContract ? (
        <EmptyState
          title="Contract address not set"
          hint="Deploy the contract, then set NEXT_PUBLIC_CONTRACT_ADDRESS and rebuild."
        />
      ) : loading ? (
        <div className="flex justify-center py-16">
          <LoadingDots label="Reading on-chain credits…" />
        </div>
      ) : loadError ? (
        <Banner kind="error">
          <b>Couldn't read on-chain state.</b> {loadError} — check the contract is deployed at
          {CONTRACT_ADDRESS} and the RPC is reachable.
          <div className="mt-2">
            <button onClick={refresh} className="rounded bg-white/10 px-3 py-1 text-xs">Retry</button>
          </div>
        </Banner>
      ) : (
        <>
          <section className="mx-auto mt-6 max-w-6xl px-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="gold-rule font-display text-sm font-semibold uppercase tracking-[0.18em] text-slate-300">
              Verified credits · live from X Layer
            </h2>
              <span className="text-xs text-slate-500">{credits?.length ?? 0} classes</span>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {credits!.map((c) => (
                <CreditCard
                  key={c.id}
                  credit={c}
                  connected={!!wallet.address}
                  wrongNetwork={wallet.wrongNetwork}
                  onBuy={setBuying}
                  onRetire={setRetiring}
                />
              ))}
            </div>
          </section>

          {/* Map + before/after */}
          <section className="mx-auto mt-6 max-w-6xl px-4">
            <h2 className="gold-rule font-display text-sm font-semibold uppercase tracking-[0.18em] text-slate-300">
              Where your impact lands
            </h2>
            <div className="paper h-[420px] overflow-hidden p-2">
              <Map
                live={credits!}
                selectedId={selected}
                onSelect={(id) => setSelected(id === selected ? null : id)}
              />
            </div>
            <div className="mt-6">
              <BeforeAfter />
            </div>
          </section>
        </>
      )}

      <footer className="mx-auto max-w-6xl px-4 py-10 text-center text-xs text-slate-500">
        <div className="mb-1 font-medium text-slate-400">Built by SanitovaEHS</div>
        Environmental Health Verification Infrastructure · X Layer Testnet (chain {CHAIN_ID})
        {CONTRACT_ADDRESS && (
          <>
            {" · "}
            <a href={`https://www.okx.com/explorer/xlayer-test/address/${CONTRACT_ADDRESS}`} target="_blank" rel="noreferrer" className="text-gold">
              {CONTRACT_ADDRESS.slice(0, 10)}…
            </a>
          </>
        )}
      </footer>

      {buying && (
        <BuyModal
          credit={buying}
          onClose={() => setBuying(null)}
          onConfirm={doBuy}
          wrongNetwork={wallet.wrongNetwork}
          connected={!!wallet.address}
          onConnect={wallet.connect}
        />
      )}
      {retiring && (
        <RetireModal
          credit={retiring}
          onClose={() => setRetiring(null)}
          onConfirm={doRetire}
          wrongNetwork={wallet.wrongNetwork}
          connected={!!wallet.address}
          onConnect={wallet.connect}
        />
      )}
    </>
  );
}
