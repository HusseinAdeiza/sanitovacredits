"use client";
import { useState, useEffect } from "react";
import type { LiveCredit } from "./CreditCard";
import { ethers } from "ethers";

type Props = {
  credit: LiveCredit;
  onClose: () => void;
  onConfirm: (id: number, amount: number) => Promise<string>;
  wrongNetwork: boolean;
  connected: boolean;
  onConnect: () => void;
};

export default function BuyModal({ credit, onClose, onConfirm, wrongNetwork, connected, onConnect }: Props) {
  const [amount, setAmount] = useState(1);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const price = ethers.parseEther(credit.priceOKB) * BigInt(amount);

  useEffect(() => {
    setAmount(1);
    setErr(null);
  }, [credit.id]);

  if (txHash) {
    return (
      <Overlay onClose={onClose}>
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gold/15 text-2xl text-gold">✓</div>
          <h3 className="mb-1 font-display text-xl font-semibold">Purchase confirmed</h3>
          <p className="mb-3 text-sm text-slate-400">
            You now hold <b className="text-slate-200">{amount.toLocaleString()}</b> {credit.impactUnit}
            credits of <b className="text-slate-200">{credit.name}</b>.
          </p>
          <a
            href={`https://www.okx.com/web3/explorer/xlayer-test/transaction/${txHash}`}
            target="_blank"
            rel="noreferrer"
            className="mb-4 inline-block break-all rounded-lg bg-white/5 px-3 py-2 font-mono text-[11px] text-aqua hover:bg-white/10"
          >
            {txHash}
          </a>
          <div className="flex gap-2">
            <button onClick={onClose} className="flex-1 rounded-lg border border-white/15 px-4 py-2 text-sm hover:bg-white/5">Done</button>
          </div>
        </div>
      </Overlay>
    );
  }

  return (
    <Overlay onClose={onClose}>
      <div className="mb-3 flex items-start justify-between">
        <div>
          <h3 className="font-display text-xl font-semibold">Buy {credit.name}</h3>
          <p className="text-xs text-slate-400">{credit.location}</p>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-2 text-sm">
        <Field label="Impact unit" value={credit.impactUnit} />
        <Field label="Price / unit" value={`${credit.priceOKB} OKB`} />
        <Field label="Available" value={credit.available.toLocaleString()} />
        <Field label="Verification" value={credit.verificationHash.slice(0, 10) + "…"} />
      </div>

      <label className="mb-1 block text-xs text-slate-400">Quantity</label>
      <input
        type="number"
        min={1}
        max={credit.available}
        value={amount}
        onChange={(e) => {
          const n = Math.max(1, Math.min(credit.available, Number(e.target.value) || 1));
          setAmount(n);
          setErr(null);
        }}
        className="mb-3 w-full rounded-lg border border-gold/25 bg-white/5 px-3 py-2 text-sm outline-none focus:border-gold"
      />

      <div className="mb-4 flex items-center justify-between rounded-lg border border-gold/20 bg-gold/10 px-3 py-2.5">
        <span className="text-sm text-slate-300">Total</span>
        <span className="font-display text-xl font-semibold text-gold">
          {ethers.formatEther(price)} OKB
        </span>
      </div>

      {wrongNetwork && (
        <p className="mb-3 rounded-lg bg-amber-500/10 p-2 text-xs text-amber-300">
          You're on the wrong network. Switch to X Layer Testnet to buy.
        </p>
      )}
      {!connected && (
        <button onClick={onConnect} className="mb-3 w-full rounded-lg bg-aqua px-3 py-2 text-sm font-semibold text-ink">
          Connect wallet to buy
        </button>
      )}
      {err && <p className="mb-3 rounded-lg bg-red-500/10 p-2 text-xs text-red-300">{err}</p>}

      <button
        disabled={!connected || wrongNetwork || busy}
        onClick={async () => {
          setBusy(true);
          setErr(null);
          try {
            const h = await onConfirm(credit.id, amount);
            setTxHash(h);
          } catch (e: any) {
            setErr(e?.shortMessage || e?.message || "Transaction failed or rejected.");
          } finally {
            setBusy(false);
          }
        }}
        className="w-full rounded-lg bg-gradient-to-b from-[#f3c46b] to-gold px-3 py-2.5 text-sm font-semibold text-[#1a1205] shadow-[0_2px_14px_-4px_rgba(232,176,75,0.55)] transition hover:brightness-110 disabled:opacity-40"
      >
        {busy ? "Confirming in wallet…" : `Confirm Purchase · ${ethers.formatEther(price)} OKB`}
      </button>
    </Overlay>
  );
}

function Overlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="paper w-full max-w-md p-5"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white/5 px-3 py-2">
      <div className="text-[11px] text-slate-400">{label}</div>
      <div className="truncate text-sm font-medium">{value}</div>
    </div>
  );
}
