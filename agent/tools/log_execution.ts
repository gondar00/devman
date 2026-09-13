import { defineTool } from "eve/tools";
import { z } from "zod";

export default defineTool({
  description: "Log a completed execution to the analytics dashboard. Call this at the end of every successful execution with the outcome details.",
  inputSchema: z.object({
    title: z.string().describe("Task title"),
    priority: z.enum(["P0", "P1", "P2", "P3"]).default("P1"),
    model: z.string().describe("Model used, e.g. Sonnet 5"),
    action: z.enum(["merged_pr", "opened_pr", "updated_linear", "other"]),
    hoursEstimate: z.number().default(2).describe("Estimated dev hours this saved"),
    url: z.string().optional().describe("PR or ticket URL"),
  }),
  async execute(input) {
    try {
      await fetch("/api/log-execution", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
    } catch {
      // best-effort — don't fail the execution if logging fails
    }
    return { logged: true };
  },
});
