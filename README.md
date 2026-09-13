# LGTM — AI Tech Lead

> The AI that briefs you on what needs shipping, then ships it.

**Live demo:** https://devbrief-two.vercel.app
**Demo video:** https://www.loom.com/share/3b8a04650b114291afeac2bc705c7cd5

---

## What it does

Developers lose hours every day context-switching between Linear, GitHub, and Slack to figure out what to work on next — then more hours doing the actual work.

LGTM is an AI tech lead that:
1. **Briefs you** — pulls your assigned Linear issues + open GitHub PRs into a ranked P0–P3 priority list
2. **Executes** — you click Exe on any task, pick a model, and the agent plans, writes code, opens a PR, updates Linear, and posts to Slack
3. **Tracks impact** — every execution logs hours saved and cost saved to a live dashboard

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
