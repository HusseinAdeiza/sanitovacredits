"use client";

const STEPS = [
  {
    n: "01",
    title: "Verify",
    sub: "The inspection becomes data",
    body: "A verification authority inspects the project — a borehole in Kogi, latrines in Lagos — and commits its report as a sha256 hash on-chain, together with GPS coordinates and a fixed certified supply. No open mint: the number of credits is the number that was verified.",
    meta: ["sha256 inspection hash", "GPS pin, not a claim", "fixed supply per class"],
  },
  {
    n: "02",
    title: "Buy",
    sub: "The credit becomes yours",
    body: "A corporate or donor connects a wallet and buys credits with OKB. Payment settles to the project treasury; the allocation draws down on-chain, so scarcity is enforced by the contract — not by a spreadsheet. Every purchase is a public, timestamped transaction.",
    meta: ["pays in OKB", "supply draws down", "public purchase trail"],
  },
  {
    n: "03",
    title: "Retire",
    sub: "The impact becomes proof",
    body: "When the credit is used in an ESG report, the holder retires it: the token burns permanently and emits CreditRetired. The retirement certificate is the transaction hash itself — any auditor can verify the exact impact, location and date on the X Layer explorer in one click.",
    meta: ["permanent burn", "certificate = tx hash", "auditor-verifiable"],
  },
];

export default function HowItWorks() {
  return (
    <div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {STEPS.map((s, i) => (
          <div key={s.n} className="paper relative flex flex-col p-6">
            <div className="mb-4 flex items-baseline justify-between">
              <span className="font-display text-5xl font-semibold text-gold/85">{s.n}</span>
              {i < STEPS.length - 1 && (
                <span aria-hidden className="hidden text-2xl text-gold/40 md:block">→</span>
              )}
            </div>
            <h3 className="font-display text-xl font-semibold tracking-wide">{s.title}</h3>
            <div className="mt-0.5 text-xs uppercase tracking-[0.14em] text-gold/80">{s.sub}</div>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">{s.body}</p>
            <ul className="mt-4 space-y-1.5 border-t border-white/8 pt-3">
              {s.meta.map((m) => (
                <li key={m} className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-gold/70" />
                  {m}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* trust strip */}
      <div className="paper mt-4 flex flex-col items-center justify-between gap-3 p-5 sm:flex-row">
        <div className="text-sm text-slate-300">
          <b className="font-medium text-slate-100">Why it's trustless:</b> the contract never mints on
          purchase — <code className="font-mono text-xs text-gold">buyCredit</code> transfers from the
          verified allocation and <code className="font-mono text-xs text-gold">retireCredit</code> burns.
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
          Every step below runs on live contract state — nothing on this page is mocked
        </div>
      </div>
    </div>
  );
}
