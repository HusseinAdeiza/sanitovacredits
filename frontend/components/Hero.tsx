"use client";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(900px 380px at 25% -12%, rgba(232,176,75,0.14), transparent 62%), radial-gradient(700px 320px at 88% -6%, rgba(56,130,246,0.10), transparent 60%)",
        }}
      />
      <div className="relative mx-auto max-w-6xl px-4 pb-10 pt-16">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-gold/25 bg-gold/10 px-3.5 py-1.5 text-xs font-medium tracking-wide text-gold">
          <span className="h-1.5 w-1.5 rounded-full bg-gold shadow-[0_0_6px_rgba(232,176,75,0.9)]" />
          Real-World Assets · X Layer Testnet
        </div>
        <h1 className="max-w-3xl font-display text-5xl font-semibold leading-[1.08] tracking-tight sm:text-6xl">
          Impact you can <span className="italic text-gold">verify</span>,
          <br />
          on-chain, in minutes.
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-300">
          SanitovaCredits tokenizes verified water, sanitation &amp; hygiene (WASH) impact so
          corporates can buy it <b className="font-medium text-slate-100">without trusting NGO PDFs</b> —
          every credit, purchase and retirement is a transaction on X Layer.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <a
            href="#credits"
            className="rounded-xl bg-gradient-to-b from-[#f3c46b] to-gold px-6 py-3 text-sm font-semibold text-[#1a1205] shadow-[0_4px_20px_-6px_rgba(232,176,75,0.7)] transition hover:brightness-110"
          >
            Explore credits
          </a>
          <a
            href="#how"
            className="rounded-xl border border-white/15 px-6 py-3 text-sm font-semibold text-slate-200 transition hover:border-gold/40 hover:bg-white/5"
          >
            How it works
          </a>
          <a
            href="demo.mp4"
            className="inline-flex items-center gap-2 rounded-xl border border-gold/30 bg-gold/5 px-6 py-3 text-sm font-semibold text-gold transition hover:bg-gold/10"
          >
            ▶ Watch the real demo
            <span className="text-[11px] font-normal text-slate-400">2:01 · real MetaMask · real txs</span>
          </a>
        </div>
        <div className="mt-10 flex flex-wrap gap-x-10 gap-y-4 border-t border-white/8 pt-6 text-sm">
          <Stat k="Verification" v="sha256 inspection hash" />
          <Stat k="Buy → retire" v="2 minutes" />
          <Stat k="Chain" v="X Layer Testnet · 1952" />
        </div>
      </div>
    </section>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">{k}</div>
      <div className="mt-1 font-medium text-slate-200">{v}</div>
    </div>
  );
}
