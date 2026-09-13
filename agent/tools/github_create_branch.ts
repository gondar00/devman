import { defineTool } from "eve/tools";
import { z } from "zod";

export default defineTool({
  description: "Create a new branch in a GitHub repository.",
  inputSchema: z.object({
    owner: z.string(),
    repo: z.string(),
    branch: z.string().describe("New branch name, e.g. devman/fix-auth-bug"),
    from: z.string().default("main").describe("Base branch to branch from"),
  }),
  label: { start: ({ owner, repo, branch }) => `Creating branch ${branch} in ${owner}/${repo}…` },
  async execute({ owner, repo, branch, from }, ctx) {
    const attrs = ctx.session.auth.current?.attributes as Record<string, string> | undefined;
    const token = attrs?.githubToken ?? "";
    if (!token) return { error: "GitHub token not set. Visit /connect to add it." };

    const headers = {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
    };

    // Get base branch SHA
    const refRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/ref/heads/${from}`, { headers });
    if (!refRes.ok) return { error: `Could not find base branch '${from}': ${refRes.status}` };
    const { object } = await refRes.json();

    // Create new branch
    const createRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/refs`, {
      method: "POST",
      headers,
      body: JSON.stringify({ ref: `refs/heads/${branch}`, sha: object.sha }),
    });
    const data = await createRes.json();
    if (!createRes.ok) return { error: data.message ?? "Failed to create branch" };
    return { branch, sha: object.sha, url: `https://github.com/${owner}/${repo}/tree/${branch}` };
  },
});
