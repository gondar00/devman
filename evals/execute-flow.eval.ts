import { defineEval } from "eve/evals";

export default defineEval({
  description: "Execute command asks for context or model before coding.",
  timeoutMs: 90_000,
  async test(t) {
    await t.send("Execute: STR-10 — Add rate limiting to auth endpoints");
    t.succeeded();
    // Agent must ask for context or present model options — not jump straight to git ops
    t.messageIncludes(/context|model|haiku|sonnet|deepseek|additional/i);
    // Must NOT immediately create a branch without asking
    t.notCalledTool("github_create_branch");
  },
});
