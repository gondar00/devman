"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Execution = {
  ts: number; title: string; priority: string;
  hoursEstimate?: number; hours?: number;
  model?: string; action?: string; url?: string;
};

const DEV_HOURLY_RATE = 150; // $USD

function useExecutions() {
  const [execs, setExecs] = useState<Execution[]>([]);
  useEffect(() => {
    fetch("/api/log-execution")
      .then((r) => r.json())
      .then((data: Execution[]) => {
        if (Array.isArray(data) && data.length > 0) { setExecs(data); return; }
        // fallback to localStorage
        const raw = localStorage.getItem("db_executions");
        if (raw) setExecs(JSON.parse(raw));
      })
      .catch(() => {
        const raw = localStorage.getItem("db_executions");
        if (raw) setExecs(JSON.parse(raw));
      });
  }, []);
  return execs;
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-[#111] border border-[#1e1e1e] rounded-lg p-5">
      <p className="text-zinc-500 text-xs font-mono uppercase tracking-wider mb-1">{label}</p>
      <p className="text-white text-3xl font-bold">{value}</p>
      {sub && <p className="text-teal-400 text-xs mt-1">{sub}</p>}
    </div>
  );
}

export default function AnalyticsPage() {
  const execs = useExecutions();

  const totalHours = execs.reduce((s, e) => s + (e.hoursEstimate ?? e.hours ?? 2), 0);
  const totalCost = totalHours * DEV_HOURLY_RATE;
  const byPriority = execs.reduce<Record<string, number>>((acc, e) => {
    acc[e.priority] = (acc[e.priority] ?? 0) + 1;
    return acc;
  }, {});

  const recentByDay: Record<string, number> = {};
  execs.forEach((e) => {
    const day = new Date(e.ts).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    recentByDay[day] = (recentByDay[day] ?? 0) + 1;
  });
  const days = Object.entries(recentByDay).slice(-7);
  const maxDay = Math.max(...days.map(([, v]) => v), 1);

  return (
    <div className="min-h-screen bg-[#080808] flex flex-col">
      <header className="border-b border-[#1a1a1a] px-8 py-4 flex items-center gap-3">
        <Link href="/" className="text-teal-400 font-mono font-bold text-lg">DB</Link>
        <span className="text-white font-semibold">DevBrief</span>
        <span className="text-zinc-600 text-sm">/</span>
        <span className="text-zinc-400 text-sm">Analytics</span>
        <span className="flex-1" />
        <Link href="/" className="text-xs text-zinc-500 hover:text-zinc-300 font-mono transition-colors">← Back to chat</Link>
      </header>

      <main className="flex-1 px-8 py-10 max-w-5xl mx-auto w-full">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-white mb-1">Impact dashboard</h1>
          <p className="text-zinc-500 text-sm">Tasks dev man has shipped for you.</p>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Tasks shipped"
            value={String(execs.length)}
            sub={execs.length > 0 ? `${byPriority["P0"] ?? 0} P0 · ${byPriority["P1"] ?? 0} P1` : "Get briefed to start"}
          />
          <StatCard
            label="Hours saved"
            value={`${totalHours}h`}
            sub={totalHours > 0 ? `≈ ${(totalHours / 8).toFixed(1)} work days` : "—"}
          />
          <StatCard
            label="Cost saved"
            value={totalCost > 0 ? `$${totalCost.toLocaleString()}` : "$0"}
            sub={`@ $${DEV_HOURLY_RATE}/hr dev rate`}
          />
          <StatCard
            label="This week"
            value={String(execs.filter((e) => Date.now() - e.ts < 7 * 24 * 3600 * 1000).length)}
            sub="executions"
          />
        </div>

        {/* Activity chart */}
        <div className="bg-[#111] border border-[#1e1e1e] rounded-lg p-6 mb-6">
          <p className="text-zinc-400 text-sm font-medium mb-4">Daily executions</p>
          {days.length === 0 ? (
            <div className="h-24 flex items-center justify-center text-zinc-600 text-sm">
              No executions yet — get a briefing and click Exe on a task
            </div>
          ) : (
            <div className="flex items-end gap-2 h-24">
              {days.map(([day, count]) => (
                <div key={day} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-teal-500/30 rounded-sm"
                    style={{ height: `${(count / maxDay) * 80}px`, minHeight: 4 }}
                  />
                  <span className="text-zinc-600 text-[10px] font-mono">{day}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Execution log */}
        <div className="bg-[#111] border border-[#1e1e1e] rounded-lg">
          <div className="px-5 py-3 border-b border-[#1e1e1e]">
            <p className="text-zinc-400 text-sm font-medium">Execution log</p>
          </div>
          {execs.length === 0 ? (
            <div className="px-5 py-8 text-center text-zinc-600 text-sm">
              No executions logged yet.
            </div>
          ) : (
            <div className="divide-y divide-[#1a1a1a]">
              {[...execs].reverse().map((e, i) => (
                <div key={i} className="px-5 py-3 flex items-center gap-3">
                  <span className={`text-[10px] font-mono border px-2 py-0.5 rounded-full shrink-0 ${
                    e.priority === "P0" ? "bg-red-900/40 text-red-400 border-red-800/50" :
                    e.priority === "P1" ? "bg-orange-900/40 text-orange-400 border-orange-800/50" :
                    "bg-zinc-800/60 text-zinc-400 border-zinc-700/50"
                  }`}>{e.priority}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-zinc-200 text-sm truncate">{e.title}</p>
                    {e.model && <p className="text-zinc-600 text-xs font-mono">{e.model} · {e.action?.replace("_", " ")}</p>}
                  </div>
                  {e.url && (
                    <a href={e.url} target="_blank" rel="noreferrer" className="text-teal-500 text-xs shrink-0 font-mono hover:text-teal-300">PR →</a>
                  )}
                  <span className="text-zinc-500 text-xs shrink-0">{e.hoursEstimate ?? e.hours ?? 2}h saved</span>
                  <span className="text-zinc-600 text-xs shrink-0 font-mono">
                    {new Date(e.ts).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
