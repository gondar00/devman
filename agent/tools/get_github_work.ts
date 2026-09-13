import { defineTool } from "eve/tools";
import { z } from "zod";

export default defineTool({
  description: "Fetch the current user's open GitHub PRs and incoming review requests.",
  inputSchema: z.object({}),
  label: { start: () => "Fetching GitHub PRs and review requests…" },
  async execute(_input, ctx) {
    const attrs = ctx.session.auth.current?.attributes as Record<string, string> | undefined;
    const token = attrs?.githubToken ?? process.env.GITHUB_TOKEN ?? "";
    if (!token) return { error: "GitHub token not set. Visit /connect to add it." };

    const headers = {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    };

    const [myPRsRes, reviewsRes] = await Promise.all([
      fetch("https://api.github.com/search/issues?q=is:pr+is:open+author:@me&per_page=20", { headers }),
      fetch("https://api.github.com/search/issues?q=is:pr+is:open+review-requested:@me&per_page=20", { headers }),
    ]);

    const [myPRs, reviews] = await Promise.all([myPRsRes.json(), reviewsRes.json()]);

    return {
      myOpenPRs: (myPRs.items ?? []).map((pr: Record<string, unknown>) => ({
        title: pr.title,
        url: pr.html_url,
        repo: (pr.repository_url as string)?.split("/").slice(-1)[0],
        updatedAt: pr.updated_at,
        draft: pr.draft,
      })),
      reviewRequests: (reviews.items ?? []).map((pr: Record<string, unknown>) => ({
        title: pr.title,
        url: pr.html_url,
        repo: (pr.repository_url as string)?.split("/").slice(-1)[0],
        updatedAt: pr.updated_at,
      })),
    };
  },
});
