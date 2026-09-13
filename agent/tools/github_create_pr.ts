import { defineTool } from "eve/tools";
import { z } from "zod";

export default defineTool({
  description: "Open a pull request on GitHub.",
  inputSchema: z.object({
    owner: z.string(),
    repo: z.string(),
    title: z.string(),
    body: z.string().describe("PR description in markdown"),
    head: z.string().describe("Source branch (e.g. devman/fix-auth-bug)"),
    base: z.string().default("main").describe("Target branch"),
  }),
  label: { start: ({ title }) => `Opening PR: ${title}…` },
  async execute({ owner, repo, title, body, head, base }, ctx) {
    const attrs = ctx.session.auth.current?.attributes as Record<string, string> | undefined;
    const token = attrs?.githubToken ?? "";
    if (!token) return { error: "GitHub token not set. Visit /connect to add it." };

    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title, body, head, base }),
    });
    const data = await res.json();
    if (!res.ok) return { error: data.message ?? "Failed to create PR" };
    return { number: data.number, url: data.html_url, title: data.title };
  },
});
