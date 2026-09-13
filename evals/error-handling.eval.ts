import { defineEval } from "eve/evals";

export default defineEval({
  description: "Missing GitHub token produces a helpful message, not a crash.",
  timeoutMs: 60_000,
  async test(t) {
    await t.send("What GitHub PRs do I have open?");
    t.succeeded();
    // Agent must mention the token or /connect — not return a raw error
    t.messageIncludes(/connect|token|github/i);
    t.noFailedActions();
  },
});
