import { defineEval } from "eve/evals";

export default defineEval({
  description: "Briefing request calls get_github_work and show_tasks tools.",
  timeoutMs: 90_000,
  async test(t) {
    await t.send("debrief me");
    t.succeeded();
    t.calledTool("get_github_work");
    t.calledTool("show_tasks");
    t.messageIncludes(/p0|p1|p2|focus|priority/i);
  },
});
