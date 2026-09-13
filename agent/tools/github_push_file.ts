import { defineTool } from "eve/tools";
import { z } from "zod";

export default defineTool({
  description: "Create or update a file in a GitHub repository on a specific branch.",
  inputSchema: z.object({
    owner: z.string(),
    repo: z.string(),
    branch: z.string(),
    path: z.string().describe("File path in the repo, e.g. src/auth.ts"),
    content: z.string().describe("Full file content (not a diff)"),
    message: z.string().describe("Commit message"),
  }),
  label: { start: ({ path }) => `Pushing ${path}…` },
  async execute({ owner, repo, branch, path, content, message }, ctx) {
    const attrs = ctx.session.auth.current?.attributes as Record<string, string> | undefined;
    const token = attrs?.githubToken ?? "";
    if (!token) return { error: "GitHub token not set. Visit /connect to add it." };

    const headers = {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
    };

    // Check if file exists to get its SHA (required for updates)
    let sha: string | undefined;
    const existingRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`,
      { headers }
    );
    if (existingRes.ok) {
      const existing = await existingRes.json();
      sha = existing.sha;
    }

    const body: Record<string, string> = {
      message,
      content: Buffer.from(content).toString("base64"),
      branch,
    };
    if (sha) body.sha = sha;

    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) return { error: data.message ?? "Failed to push file" };
    return { path, sha: data.content?.sha, url: data.content?.html_url };
  },
});
