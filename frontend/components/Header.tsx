"use client";
import { useEffect, useRef, useState } from "react";
import type { Wallet } from "@/lib/useWallet";

function shortAddr(a: string) {
  return a.slice(0, 6) + "…" + a.slice(-4);
}

export default function Header({ wallet }: { wallet: Wallet }) {
  const { address, wrongNetwork, connecting } = wallet;
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // close on outside click / Escape
  useEffect(() => {
    if (!menuOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  async function copyAddr() {
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked; ignore */
    }
  }

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
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                className="flex items-center gap-2 rounded-lg border border-gold/20 bg-gold/5 px-3.5 py-2 transition hover:border-gold/40"
              >
                <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                <span className="font-mono text-xs tracking-wide text-slate-200">{shortAddr(address)}</span>
                <svg
                  width="10"
                  height="6"
                  viewBox="0 0 10 6"
                  className={"text-slate-400 transition-transform " + (menuOpen ? "rotate-180" : "")}
                >
                  <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                </svg>
              </button>

              {menuOpen && (
                <div
                  role="menu"
                  className="paper absolute right-0 top-[calc(100%+8px)] z-50 w-64 p-3 shadow-[0_16px_40px_-12px_rgba(0,0,0,0.7)]"
                >
                  <div className="mb-2 text-[11px] uppercase tracking-[0.14em] text-slate-500">Connected wallet</div>
                  <div className="mb-3 flex items-center justify-between gap-2 rounded-lg bg-white/5 px-3 py-2">
                    <span className="break-all font-mono text-[11px] leading-relaxed text-slate-200">{address}</span>
                    <button
                      onClick={copyAddr}
                      title="Copy address"
                      className="shrink-0 rounded-md border border-white/10 px-2 py-1 text-[11px] text-slate-300 transition hover:border-gold/40 hover:text-gold"
                    >
                      {copied ? "✓" : "Copy"}
                    </button>
                  </div>
                  <a
                    href={`https://www.okx.com/explorer/xlayer-test/address/${address}`}
                    target="_blank"
                    rel="noreferrer"
                    role="menuitem"
                    className="mb-1 flex items-center justify-between rounded-lg px-3 py-2 text-sm text-slate-300 transition hover:bg-white/5"
                  >
                    View on explorer
                    <span className="text-slate-500">↗</span>
                  </a>
                  <button
                    role="menuitem"
                    onClick={() => {
                      setMenuOpen(false);
                      wallet.disconnect();
                    }}
                    className="flex w-full items-center rounded-lg px-3 py-2 text-sm text-red-300/90 transition hover:bg-red-500/10"
                  >
                    Disconnect
                  </button>
                </div>
              )}
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
        <div className="flex items-center justify-center gap-3 border-t border-red-500/30 bg-red-500/10 px-4 py-2 text-center text-xs text-red-300">
          <span>{wallet.error}</span>
          <button
            onClick={wallet.clearError}
            className="shrink-0 text-red-200/70 hover:text-red-100"
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>
      )}
    </header>
  );
}
