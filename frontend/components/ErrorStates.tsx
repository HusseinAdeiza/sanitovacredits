"use client";

export function EmptyState({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="paper mx-4 mt-6 flex flex-col items-center justify-center p-10 text-center">
      <div className="mb-2 text-3xl">🛰️</div>
      <div className="mb-1 font-medium">{title}</div>
      <div className="max-w-sm text-sm text-slate-400">{hint}</div>
    </div>
  );
}

export function LoadingDots({ label = "Loading" }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-slate-400">
      <span className="spin inline-block h-4 w-4 rounded-full border-2 border-slate-500 border-t-aqua" />
      {label}
    </div>
  );
}

export function Banner({ kind, children }: { kind: "error" | "info"; children: React.ReactNode }) {
  const cls = kind === "error" ? "border-red-500/30 bg-red-500/10 text-red-300" : "border-white/10 bg-white/5 text-slate-300";
  return <div className={`mx-4 mt-4 rounded-xl border px-4 py-3 text-sm ${cls}`}>{children}</div>;
}
