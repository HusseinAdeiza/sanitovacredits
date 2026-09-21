"use client";
import { useState } from "react";
import type { LiveCredit } from "./CreditCard";

type Props = {
  credit: LiveCredit;
  onClose: () => void;
  onConfirm: (id: number, amount: number) => Promise<string>;
  wrongNetwork: boolean;
  connected: boolean;
  onConnect: () => void;
};

export default function RetireModal({ credit, onClose, onConfirm, wrongNetwork, connected, onConnect }: Props) {
  const [amount, setAmount] = useState(credit.yourBalance);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const clamped = Math.max(1, Math.min(credit.yourBalance, amount || 1));

  if (txHash) {
    const certId = "SAN-" + txHash.slice(2, 10).toUpperCase() + "-" + (credit.id + 1);
    return (
      <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
        <div className="paper w-full max-w-md p-5" onClick={(e) => e.stopPropagation()}>
          <div className="mb-3 text-center">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-gold/15 text-2xl text-gold">🏅</div>
            <h3 className="font-display text-xl font-semibold">Impact Retired</h3>
            <p className="text-xs text-slate-400">Burned on-chain · now yours to report</p>
          </div>

          {/* ESG certificate placeholder */}
          <div className="mb-4 rounded-xl border border-gold/25 bg-ink/80 p-4">
            <div className="mb-2 flex items-center justify-between border-b border-white/10 pb-2">
              <span className="text-[11px] uppercase tracking-[0.14em] text-gold">ESG Retirement Certificate</span>
              <span className="font-mono text-[10px] text-slate-400">{certId}</span>
            </div>
            <div className="grid grid-cols-2 gap-y-1.5 text-sm">
              <span className="text-slate-500">Holder</span>
              <span className="text-right font-medium text-slate-200">Your wallet</span>
              <span className="text-slate-500">Credit</span>
              <span className="text-right font-medium">{credit.name}</span>
              <span className="text-slate-500">Location</span>
              <span className="text-right font-medium">{credit.location}</span>
              <span className="text-slate-500">Retired</span>
              <span className="text-right font-medium text-gold">{clamped.toLocaleString()} {credit.impactUnit}</span>
              <span className="text-slate-500">Date</span>
              <span className="text-right font-medium">{new Date().toISOString().slice(0, 10)}</span>
            </div>
            <div className="mt-3 rounded bg-white/5 p-2 text-[11px] text-slate-400">
              Proof of retirement is the burn transaction below — permanently verifiable by your auditors.
            </div>
          </div>

          <a
            href={`https://www.okx.com/web3/explorer/xlayer-test/transaction/${txHash}`}
            target="_blank"
            rel="noreferrer"
            className="mb-4 block break-all rounded-lg bg-white/5 px-3 py-2 font-mono text-[11px] text-gold hover:bg-white/10"
          >
            {txHash}
          </a>
          <button onClick={onClose} className="w-full rounded-lg bg-gradient-to-b from-[#f3c46b] to-gold px-3 py-2.5 text-sm font-semibold text-[#1a1205] shadow-[0_2px_14px_-4px_rgba(232,176,75,0.55)]">
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div className="paper w-full max-w-md p-5" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-start justify-between">
          <div>
            <h3 className="font-display text-xl font-semibold">Retire for ESG Credit</h3>
            <p className="text-xs text-slate-400">Burns credits on-chain — irreversibly. Use for reporting.</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
        </div>

        <div className="mb-4 rounded-lg bg-white/5 p-3 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-400">Your balance</span>
            <span className="font-medium">{credit.yourBalance.toLocaleString()}</span>
          </div>
        </div>

        <label className="mb-1 block text-xs text-slate-400">Amount to retire (max {credit.yourBalance.toLocaleString()})</label>
        <input
          type="number"
          min={1}
          max={credit.yourBalance}
          value={clamped}
          onChange={(e) => setAmount(Number(e.target.value) || 0)}
          className="mb-2 w-full rounded-lg border border-gold/25 bg-white/5 px-3 py-2 text-sm outline-none focus:border-gold"
        />
        <div className="mb-4 flex gap-2">
          {[1, 25, 50, 100].map((p) => (
            <button
              key={p}
              onClick={() => setAmount(Math.max(1, Math.floor((credit.yourBalance * p) / 100)))}
              className="flex-1 rounded-md border border-white/10 px-2 py-1 text-xs hover:bg-white/5"
            >
              {p === 100 ? "Max" : p + "%"}
            </button>
          ))}
        </div>

        {wrongNetwork && (
          <p className="mb-3 rounded-lg bg-amber-500/10 p-2 text-xs text-amber-300">Switch to X Layer Testnet to retire.</p>
        )}
        {!connected && (
          <button onClick={onConnect} className="mb-3 w-full rounded-lg bg-aqua px-3 py-2 text-sm font-semibold text-ink">
            Connect wallet to retire
          </button>
        )}
        {err && <p className="mb-3 rounded-lg bg-red-500/10 p-2 text-xs text-red-300">{err}</p>}

        <button
          disabled={!connected || wrongNetwork || busy || credit.yourBalance === 0}
          onClick={async () => {
            setBusy(true);
            setErr(null);
            try {
              const h = await onConfirm(credit.id, clamped);
              setTxHash(h);
            } catch (e: any) {
              setErr(e?.shortMessage || e?.message || "Transaction failed or rejected.");
            } finally {
              setBusy(false);
            }
          }}
          className="w-full rounded-lg border border-gold/30 bg-gold/10 px-3 py-2.5 text-sm font-semibold text-gold hover:bg-gold/15 disabled:opacity-40"
        >
          {busy ? "Confirming in wallet…" : `Retire ${clamped.toLocaleString()} ${credit.impactUnit}`}
        </button>
      </div>
    </div>
  );
}
