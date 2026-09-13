import { defineTool } from "eve/tools";
import { z } from "zod";

export default defineTool({
  description: "Get details and diff for a GitHub pull request.",
  inputSchema: z.object({
    owner: z.string(),
    repo: z.string(),
    pull_number: z.number(),
  }),
  label: { start: ({ owner, repo, pull_number }) => `Reading PR #${pull_number} in ${owner}/${repo}…` },
  async execute({ owner, repo, pull_number }, ctx) {
    const attrs = ctx.session.auth.current?.attributes as Record<string, string> | undefined;
    const token = attrs?.githubToken ?? "";
    if (!token) return { error: "GitHub token not set. Visit /connect to add it." };

    const headers = {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    };

    const [prRes, filesRes] = await Promise.all([
      fetch(`https://api.github.com/repos/${owner}/${repo}/pulls/${pull_number}`, { headers }),
      fetch(`https://api.github.com/repos/${owner}/${repo}/pulls/${pull_number}/files`, { headers }),
    ]);

    const [pr, files] = await Promise.all([prRes.json(), filesRes.json()]);
    if (!prRes.ok) return { error: pr.message ?? "Failed to fetch PR" };

    return {
      number: pr.number,
      title: pr.title,
      body: pr.body,
      state: pr.state,
      head: pr.head.ref,
      base: pr.base.ref,
      author: pr.user.login,
      url: pr.html_url,
      additions: pr.additions,
      deletions: pr.deletions,
      files: (files as { filename: string; patch?: string; status: string }[]).map((f) => ({
        filename: f.filename,
        status: f.status,
        patch: f.patch?.slice(0, 2000),
      })),
    };
  },
});
