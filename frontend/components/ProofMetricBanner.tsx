"use client";
import { getContractRead, CHAIN_ID } from "@/lib/web3";

export default function ProofMetricBanner() {
  return (
    <div className="paper mx-4 mt-6 grid grid-cols-1 gap-4 p-5 sm:grid-cols-3">
      <Metric before="6 weeks" after="2 minutes" label="Verification time" />
      <Metric before="$2,000" after="$0.50" label="Cost per audit" />
      <div className="flex flex-col justify-center">
        <div className="font-display text-2xl font-semibold text-gold">On-chain, immutable</div>
        <div className="text-sm text-slate-400">
          Every credit &amp; retirement is a transaction on X Layer Testnet (chain {CHAIN_ID}).
        </div>
      </div>
    </div>
  );
}

function Metric({ before, after, label }: { before: string; after: string; label: string }) {
  return (
    <div>
      <div className="mb-1 text-xs uppercase tracking-wide text-slate-400">{label}</div>
      <div className="flex items-center gap-3">
        <span className="text-lg text-slate-500 line-through">{before}</span>
        <span aria-hidden>→</span>
        <span className="font-display text-2xl font-semibold text-gold">{after}</span>
      </div>
    </div>
  );
}
