import Link from "next/link";
import { AgentChat } from "@/app/_components/agent-chat";
import { AnalyticsPanel } from "@/app/_components/analytics-panel";
import { ThemeToggle } from "@/app/_components/theme-toggle";

export default function Page() {
  return (
    <div className="flex flex-col h-screen">
      <header className="border-b border-[#1a1a1a] px-6 py-3 flex items-center gap-3 shrink-0">
        <Link href="/" className="text-teal-400 font-mono font-bold tracking-tight">LGTM</Link>
        <span className="text-zinc-600 text-xs font-mono">AI Tech Lead</span>
        <span className="flex-1" />
        <ThemeToggle />
        <Link
          href="/analytics"
          className="text-xs text-zinc-500 hover:text-zinc-300 font-mono transition-colors"
        >
          Analytics
        </Link>
        <Link
          href="/connect"
          className="text-xs text-zinc-500 hover:text-zinc-300 font-mono transition-colors"
        >
          Connections →
        </Link>
      </header>
      <div className="flex-1 min-h-0">
        <AgentChat />
      </div>
      <AnalyticsPanel />
    </div>
  );
}
