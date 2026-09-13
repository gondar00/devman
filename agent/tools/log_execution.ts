import { defineTool } from "eve/tools";
import { kv } from "@vercel/kv";
import { z } from "zod";

export default defineTool({
  description:
    "Log a completed execution to the analytics dashboard. Call this at the end of every successful execution.",
  inputSchema: z.object({
    title: z.string(),
    priority: z.enum(["P0", "P1", "P2", "P3"]).default("P1"),
    model: z.string().describe("Model used, e.g. Sonnet 5"),
    action: z.enum(["merged_pr", "opened_pr", "updated_linear", "other"]),
    hoursEstimate: z.number().default(2),
    url: z.string().optional(),
  }),
  async execute(input, ctx) {
    const attrs = ctx.session.auth.current?.attributes as Record<string, string> | undefined;
    const userId = attrs?.userId ?? "anonymous";
    const entry = { ...input, ts: Date.now() };
    try {
      await kv.lpush(`executions:${userId}`, JSON.stringify(entry));
      await kv.ltrim(`executions:${userId}`, 0, 499); // keep last 500
    } catch (err) {
      console.error("KV log failed:", err);
    }
    return { logged: true, userId };
  },
});
