"use client";

import { useEffect, useState } from "react";

type Execution = {
  ts: number; title: string; priority: string;
  hoursEstimate?: number; model?: string; action?: string; url?: string;
};

const DEV_RATE = 150;

export function AnalyticsPanel() {
  const [execs, setExecs] = useState<Execution[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const uid = localStorage.getItem("lgtm_uid") ?? "anonymous";
    const load = () =>
      fetch(`/api/log-execution?uid=${uid}`)
        .then((r) => r.json())
        .then((d: Execution[]) => { if (Array.isArray(d)) setExecs(d); })
        .catch(() => {});
    void load();
    const id = setInterval(load, 5000);
    return () => clearInterval(id);
  }, []);

  const hours = execs.reduce((s, e) => s + (e.hoursEstimate ?? 2), 0);
  const cost = hours * DEV_RATE;

  return (
    <div className="border-t border-[#1a1a1a] bg-[#0a0a0a] shrink-0">
      {/* Toggle bar */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full px-6 py-2 flex items-center gap-4 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
      >
        <span className="font-mono text-teal-400 font-semibold">⚡ LGTM Impact</span>
        <span>{execs.length} tasks shipped</span>
        <span>·</span>
        <span>{hours}h saved</span>
        <span>·</span>
        <span className="text-teal-400">${cost.toLocaleString()} value</span>
        <span className="ml-auto">{open ? "▲" : "▼"}</span>
      </button>

      {/* Expanded log */}
      {open && (
        <div className="border-t border-[#1a1a1a] max-h-48 overflow-y-auto divide-y divide-[#151515]">
          {execs.length === 0 ? (
            <p className="px-6 py-4 text-xs text-zinc-600">No executions yet — click Exe on a task.</p>
          ) : (
            [...execs].reverse().map((e, i) => (
              <div key={i} className="px-6 py-2 flex items-center gap-3">
                <span className={`text-[10px] font-mono border px-1.5 py-0.5 rounded shrink-0 ${
                  e.priority === "P0" ? "text-red-400 border-red-900" :
                  e.priority === "P1" ? "text-orange-400 border-orange-900" :
                  "text-zinc-500 border-zinc-700"
                }`}>{e.priority}</span>
                <span className="text-zinc-300 text-xs flex-1 truncate">{e.title}</span>
                {e.url && (
                  <a href={e.url} target="_blank" rel="noreferrer" className="text-teal-500 text-xs font-mono hover:text-teal-300 shrink-0">PR →</a>
                )}
                <span className="text-zinc-600 text-xs shrink-0 font-mono">{e.hoursEstimate ?? 2}h</span>
                <span className="text-zinc-700 text-xs shrink-0 font-mono">
                  {new Date(e.ts).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
