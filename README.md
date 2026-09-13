# LGTM — AI Tech Lead

> The AI that briefs you on what needs shipping, then ships it.

**Live demo:** https://devbrief-two.vercel.app

**Demo video:** https://www.loom.com/share/3b8a04650b114291afeac2bc705c7cd5

---

## Why LGTM — not Claude Code or Codex?

Tools like Claude Code and Codex are **reactive** — you bring the task, they execute it. LGTM is **proactive**: it surfaces what needs doing across your entire stack before you even ask.

The other key difference is **model freedom**. Claude Code locks you into one model. LGTM shows you the task, presents your model options (Haiku, Sonnet, Opus, DeepSeek R1) with a real cost estimate upfront, and lets you choose the right tool for the job — a 5-line fix doesn't need Opus.

**The vision:** in a future version, LGTM runs on a schedule, autonomously executes your entire backlog overnight, and presents a review queue in the morning — a diff of everything it shipped for you to approve. Coding tools go from reactive to proactive. You stop managing tasks and start reviewing outcomes.

---

## What it does today

Developers lose hours every day context-switching between Linear, GitHub, and Slack to figure out what to work on — then more hours doing it.

LGTM is an AI tech lead that:
1. **Briefs you** — pulls assigned Linear issues + open GitHub PRs into a ranked P0–P3 priority list
2. **Lets you choose** — pick the model and see the cost before committing a single token
3. **Executes** — plans, writes code, opens a PR, updates Linear, posts to Slack
4. **Tracks impact** — every execution logs hours saved and cost saved to a live dashboard

---

## External apps connected (3+)

| App | How it's used |
|-----|--------------|
| **Linear** | Reads assigned issues via MCP; updates ticket status to "In Review" after execution |
| **GitHub** | Reads open PRs + review requests; creates branches, pushes code, opens PRs |
| **Slack** | Posts execution summaries to any channel |
| **Upstash Redis** | Persists analytics data (tasks shipped, hours saved) per user |

---

## Demo flow

1. Go to `/connect` → paste your Linear API key, GitHub token (repo + workflow scopes), Slack bot token
2. Ask: **"debrief me"** → agent fetches all three sources in parallel, renders a P0–P3 task list with **[Exe]** buttons
3. Click **Exe** on a task → agent asks for context → you pick a model (Haiku / Sonnet / Opus / DeepSeek R1 with cost estimates)
4. Agent plans → creates a branch → pushes code → opens PR → updates Linear → posts to Slack
5. Impact bar at the bottom of the chat updates in real time: tasks shipped, hours saved, $ value

---

## Setup (local)

**Prerequisites:** Node 20+, a Vercel account (free tier works)

```bash
git clone https://github.com/gondar00/devman
cd devman
npm install

# Link to Vercel (pulls env vars including KV credentials)
npx vercel link
npx vercel env pull

# Start
npm run dev          # Next.js on localhost:3000
# Agent runs embedded via withEve() — no separate process needed
```

Open `http://localhost:3000/connect` and paste your three tokens:

| Token | Where to get it |
|-------|----------------|
| Linear API key | linear.app → Settings → API → Personal API keys |
| GitHub token | github.com/settings/tokens → `repo` + `read:user` + `workflow` scopes |
| Slack bot token | api.slack.com/apps → create app → OAuth → `chat:write` scope → install to workspace |

Tokens are stored in your browser and sent securely as request headers — nothing is hardcoded.

---

## Stack

- **[eve](https://eve.dev)** — durable AI agent framework (filesystem-first, built-in web chat)
- **Next.js 16** on **Vercel** — frontend + API routes
- **Claude Sonnet 5** via Vercel AI Gateway — default model
- **Upstash Redis** via Vercel Marketplace — analytics persistence
- **Linear MCP** (`mcp.linear.app`) — issues and project management
- **GitHub REST API** — PR management and code execution
- **Slack Web API** — notifications

---

## Reliability & evaluation

4 evals under `evals/` cover the critical paths:

| Eval | What it checks |
|------|---------------|
| `smoke` | Agent boots and responds coherently |
| `briefing` | `get_github_work` + `show_tasks` are both called on a debrief request |
| `execute-flow` | Execute command asks for context/model before touching any GitHub tools |
| `error-handling` | Missing token produces a `/connect` message, not a crash |

```bash
npm run dev:eve &   # start agent
npx eve eval        # run all 4 evals
```

Additional reliability design:
- Each tool call returns structured `{ error }` instead of throwing — the agent surfaces "visit /connect" rather than a 500
- Linear + GitHub calls run in parallel during briefing (no sequential bottlenecks)
- Analytics writes to Redis are best-effort (failure never blocks execution)

---

## Repo for demo tasks

[gondar00/devman-demo](https://github.com/gondar00/devman-demo) — a small API with an open PR and an assigned Linear issue (STR-10) ready to demo against.
