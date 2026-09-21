"use client";
import { SEED_CREDITS, CATEGORY_META } from "@/lib/data";

export type LiveCredit = {
  id: number;
  name: string;
  location: string;
  lat: number;
  lng: number;
  impactUnit: string;
  priceOKB: string;
  verificationHash: string;
  active: boolean;
  certified: number; // impact magnitude (seed) — households/latrines/etc.
  available: number; // owner balance, live (still purchasable)
  retiredTotal: number; // totalCreditsRetired, live (global)
  yourBalance: number; // balanceOf(viewer, id), live
  lastTx: string | null;
};

type Props = {
  credit: LiveCredit;
  connected: boolean;
  wrongNetwork: boolean;
  onBuy: (c: LiveCredit) => void;
  onRetire: (c: LiveCredit) => void;
};

function shortHash(h: string) {
  if (!h) return "";
  return h.slice(0, 10) + "…" + h.slice(-6);
}

export default function CreditCard({ credit, connected, wrongNetwork, onBuy, onRetire }: Props) {
  const seed = SEED_CREDITS.find((s) => s.id === credit.id);
  const cat = CATEGORY_META[seed?.category ?? "water"];
  const pct = credit.certified > 0 ? credit.available / credit.certified : 0;

  return (
    <div className="paper group flex flex-col gap-3 p-5 transition-colors duration-300 hover:border-gold/35">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.25)]"
              style={{ background: cat.color }}
            />
            <h3 className="font-display text-[15px] font-semibold leading-tight tracking-wide">{credit.name}</h3>
          </div>
          <div className="mt-0.5 text-xs text-slate-400">{credit.location}</div>
        </div>
        <span
          className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium"
          style={{ background: cat.color + "22", color: cat.color }}
        >
          {cat.label}
        </span>
      </div>

      <div className="flex items-baseline gap-1.5">
        <span className="font-display text-3xl font-semibold text-gold">{credit.certified.toLocaleString()}</span>
        <span className="text-xs text-slate-400">{credit.impactUnit} certified</span>
      </div>

      <div className="text-xs text-slate-400">
        <div className="flex justify-between">
          <span>Available to buy</span>
          <span className="font-medium text-slate-200">{credit.available.toLocaleString()}</span>
        </div>
        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full" style={{ width: `${Math.max(0, Math.min(1, pct)) * 100}%`, background: cat.color }} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-lg bg-white/5 p-2">
          <div className="text-slate-400">Price / unit</div>
          <div className="font-medium">{credit.priceOKB} OKB</div>
        </div>
        <div className="rounded-lg bg-white/5 p-2">
          <div className="text-slate-400">Your balance</div>
          <div className="font-medium">{credit.yourBalance.toLocaleString()}</div>
        </div>
      </div>

      <div className="rounded-lg bg-white/5 p-2 text-[11px] text-slate-400">
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-400" />
          Verification hash
        </div>
        <div className="mt-0.5 font-mono text-slate-300">{shortHash(credit.verificationHash)}</div>
      </div>

      {!credit.active && (
        <div className="rounded-lg bg-red-500/10 p-2 text-[11px] text-red-300">
          Credit deactivated — no new purchases.
        </div>
      )}

      <div className="mt-auto flex gap-2">
        <button
          onClick={() => onBuy(credit)}
          disabled={!credit.active || credit.available === 0 || wrongNetwork}
          className="flex-1 rounded-lg bg-gradient-to-b from-[#f3c46b] to-gold px-3 py-2 text-sm font-semibold text-[#1a1205] shadow-[0_2px_12px_-4px_rgba(232,176,75,0.55)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-30"
        >
          Buy
        </button>
        <button
          onClick={() => onRetire(credit)}
          disabled={!connected || credit.yourBalance === 0 || wrongNetwork}
          className="flex-1 rounded-lg border border-gold/30 px-3 py-2 text-sm font-semibold text-gold transition hover:bg-gold/10 disabled:cursor-not-allowed disabled:border-white/10 disabled:text-slate-500"
          title={!connected ? "Connect wallet" : "Retire credits for ESG"}
        >
          Retire for ESG
        </button>
      </div>
    </div>
  );
}
