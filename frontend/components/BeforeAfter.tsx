"use client";
import { SEED_CREDITS } from "@/lib/data";

export default function BeforeAfter() {
  const pdf = SEED_CREDITS[0].pdf;
  return (
    <div className="paper mx-4 mt-6 p-5">
      <h2 className="gold-rule mb-4 font-display text-base font-semibold text-slate-200">
        The shift: an NGO PDF you have to trust → on-chain proof you can verify
      </h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* BEFORE — the unverifiable PDF */}
        <div className="relative">
          <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-wide text-red-300">
            <span>Before</span>
            <span className="text-slate-500">· email PDF, 6-week manual check</span>
          </div>
          <div className="ngo-pdf p-4 text-[13px] leading-relaxed">
            <div className="mb-2 flex items-center justify-between border-b border-black/20 pb-1">
              <span className="font-bold">{pdf.org}</span>
              <span className="text-[10px] opacity-60">CONFIDENTIAL</span>
            </div>
            <div className="font-semibold">{pdf.title}</div>
            <div className="mb-2 text-[11px] opacity-70">{pdf.period}</div>
            <p className="mb-2">“{pdf.claim}”</p>
            <p className="text-[11px] opacity-80">
              Verification: {pdf.verification}
            </p>
            <p className="mt-3 text-[10px] opacity-50">
              {pdf.pages} pages · no coordinates · no hash · counts unverifiable
            </p>
          </div>
        </div>

        {/* AFTER — on-chain credit */}
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-gold">
            <span>After</span>
            <span className="text-slate-500">· on-chain, 2 minutes, one click</span>
          </div>
          <div className="rounded-lg border border-aqua/30 bg-ink/60 p-4 text-[13px]">
            <div className="flex items-center gap-2">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-water" />
              <span className="font-semibold">SanitovaCredit #0</span>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-y-1 text-slate-300">
              <span className="text-slate-500">Location</span>
              <span>Lokoja, Kogi (7.8000, 6.7400)</span>
              <span className="text-slate-500">Map pin</span>
              <span className="text-water">pinned on Leaflet/OSM</span>
              <span className="text-slate-500">Impact</span>
              <span>1,000 households served</span>
              <span className="text-slate-500">Verification hash</span>
              <span className="font-mono text-[11px] text-aqua">sha256(inspection)</span>
              <span className="text-slate-500">Retirement</span>
              <span className="text-aqua">burn tx + on-chain receipt</span>
            </div>
            <div className="mt-3 rounded bg-white/5 p-2 text-[11px] text-slate-400">
              Every field is a contract state, not a claim in a document.
            </div>
          </div>
        </div>
      </div>
      <div className="mt-4 text-center text-sm text-slate-400">
        <span className="text-slate-500 line-through">6 weeks → 2 minutes</span>
        <span className="mx-2 text-slate-600">·</span>
        <span className="text-slate-500 line-through">$2,000 → $0.50</span>
      </div>
    </div>
  );
}
