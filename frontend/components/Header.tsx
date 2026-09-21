"use client";
import type { Wallet } from "@/lib/useWallet";

function shortAddr(a: string) {
  return a.slice(0, 6) + "…" + a.slice(-4);
}

export default function Header({ wallet }: { wallet: Wallet }) {
  const { address, wrongNetwork, connecting } = wallet;
  return (
    <header className="sticky top-0 z-50 border-b border-gold/10 bg-ink/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3.5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-gold/40 bg-gradient-to-br from-gold/25 to-transparent">
            <span className="font-display text-lg font-semibold text-gold">S</span>
          </div>
          <div className="leading-tight">
            <div className="font-display text-[15px] font-semibold tracking-wide">SanitovaCredits</div>
            <div className="text-[11px] tracking-wide text-slate-400">Verified WASH impact · X Layer</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {wrongNetwork && (
            <button
              onClick={wallet.switchNetwork}
              className="rounded-lg bg-amber-500/15 px-3 py-1.5 text-xs font-medium text-amber-300 hover:bg-amber-500/25"
            >
              Wrong network — switch to X Layer Testnet
            </button>
          )}
          {address ? (
            <div className="flex items-center gap-2 rounded-lg border border-gold/20 bg-gold/5 px-3.5 py-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              <span className="font-mono text-xs tracking-wide text-slate-200">{shortAddr(address)}</span>
            </div>
          ) : (
            <button
              onClick={wallet.connect}
              disabled={connecting}
              className="rounded-lg bg-gradient-to-b from-[#f3c46b] to-gold px-4 py-2 text-xs font-semibold text-[#1a1205] shadow-[0_2px_14px_-4px_rgba(232,176,75,0.6)] transition hover:brightness-110 disabled:opacity-50"
            >
              {connecting ? "Connecting…" : "Connect Wallet"}
            </button>
          )}
        </div>
      </div>
      {wallet.error && (
        <div className="border-t border-red-500/30 bg-red-500/10 px-4 py-2 text-center text-xs text-red-300">
          {wallet.error}
        </div>
      )}
    </header>
  );
}
