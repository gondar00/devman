"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const INTEGRATIONS = [
  {
    id: "linearToken",
    name: "Linear",
    icon: "◆",
    description: "Issues, priorities, and cycles assigned to you.",
    placeholder: "lin_api_...",
    link: "https://linear.app/settings/api",
    linkLabel: "Get API key →",
  },
  {
    id: "githubToken",
    name: "GitHub",
    icon: "⬡",
    description: "Read PRs, create branches, push files, and open PRs on your behalf.",
    placeholder: "ghp_...",
    link: "https://github.com/settings/tokens/new?scopes=repo,read:user,workflow",
    linkLabel: "Generate token (repo + workflow) →",
  },
  {
    id: "slackToken",
    name: "Slack",
    icon: "⊕",
    description: "Post your daily brief to any channel.",
    placeholder: "xoxb-...",
    link: "https://api.slack.com/apps",
    linkLabel: "Create app →",
  },
] as const;

type CredKey = (typeof INTEGRATIONS)[number]["id"];

function loadCreds(): Record<CredKey, string> {
  if (typeof window === "undefined") return { linearToken: "", githubToken: "", slackToken: "" };
  return {
    linearToken: localStorage.getItem("db_linearToken") ?? "",
    githubToken: localStorage.getItem("db_githubToken") ?? "",
    slackToken: localStorage.getItem("db_slackToken") ?? "",
  };
}

export default function ConnectPage() {
  const router = useRouter();
  const [values, setValues] = useState<Record<CredKey, string>>({
    linearToken: "",
    githubToken: "",
    slackToken: "",
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setValues(loadCreds());
  }, []);

  function save() {
    for (const key of Object.keys(values) as CredKey[]) {
      if (values[key]) localStorage.setItem(`db_${key}`, values[key]);
    }
    setSaved(true);
    setTimeout(() => router.push("/"), 800);
  }

  const connected = INTEGRATIONS.filter((i) => values[i.id]?.length > 0).length;

  return (
    <div className="min-h-screen bg-[#080808] flex flex-col">
      {/* Header */}
      <header className="border-b border-[#1a1a1a] px-8 py-4 flex items-center gap-3">
        <a href="/" className="text-teal-400 font-mono font-bold text-lg tracking-tight">LGTM</a>
        <span className="ml-2 text-xs text-zinc-500 font-mono">AI Tech Lead</span>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16">
        <div className="w-full max-w-2xl">
          {/* Title */}
          <div className="mb-10">
            <h1 className="text-2xl font-semibold text-white mb-2">Connect your tools</h1>
            <p className="text-zinc-400 text-sm">
              LGTM pulls from your dev stack, surfaces what needs attention, and ships it.
            </p>
          </div>

          {/* Integration cards */}
          <div className="space-y-3 mb-8">
            {INTEGRATIONS.map((integration) => {
              const isSet = values[integration.id]?.length > 0;
              return (
                <div
                  key={integration.id}
                  className="bg-[#111111] border border-[#1e1e1e] rounded-lg p-5"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-teal-400 text-lg font-mono">{integration.icon}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium">{integration.name}</span>
                          {isSet && (
                            <span className="text-[10px] font-mono bg-teal-900/40 text-teal-400 border border-teal-800/50 px-2 py-0.5 rounded-full">
                              CONNECTED
                            </span>
                          )}
                        </div>
                        <p className="text-zinc-500 text-xs mt-0.5">{integration.description}</p>
                      </div>
                    </div>
                    <a
                      href={integration.link}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-teal-400 hover:text-teal-300 font-mono whitespace-nowrap"
                    >
                      {integration.linkLabel}
                    </a>
                  </div>
                  <input
                    type="password"
                    value={values[integration.id]}
                    onChange={(e) =>
                      setValues((v) => ({ ...v, [integration.id]: e.target.value }))
                    }
                    placeholder={integration.placeholder}
                    className="w-full bg-[#0d0d0d] border border-[#2a2a2a] rounded-md px-3 py-2 text-sm text-zinc-300 placeholder:text-zinc-600 font-mono focus:outline-none focus:border-teal-700 focus:ring-1 focus:ring-teal-700/50"
                  />
                </div>
              );
            })}
          </div>

          {/* Status + CTA */}
          <div className="flex items-center justify-between">
            <span className="text-zinc-500 text-sm">
              {connected} of {INTEGRATIONS.length} connected
            </span>
            <button
              onClick={save}
              disabled={connected === 0 || saved}
              className="px-5 py-2 bg-teal-500 hover:bg-teal-400 disabled:opacity-40 disabled:cursor-not-allowed text-black font-semibold text-sm rounded-md transition-colors"
            >
              {saved ? "Saved — opening chat…" : "Save & open LGTM"}
            </button>
          </div>

          <p className="mt-4 text-xs text-zinc-600">
            Tokens are stored in your browser only and sent securely to the agent.
          </p>
        </div>
      </main>
    </div>
  );
}
