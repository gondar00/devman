import { defineTool } from "eve/tools";
import { z } from "zod";

export default defineTool({
  description: "Approve and merge a GitHub pull request.",
  inputSchema: z.object({
    owner: z.string(),
    repo: z.string(),
    pull_number: z.number(),
    review_comment: z.string().describe("Review body before merging"),
    merge_method: z.enum(["merge", "squash", "rebase"]).default("squash"),
  }),
  label: {
    start: ({ owner, repo, pull_number }) => `Merging PR #${pull_number} in ${owner}/${repo}…`,
    complete: ({ pull_number }) => `Merged PR #${pull_number}`,
  },
  async execute({ owner, repo, pull_number, review_comment, merge_method }, ctx) {
    const attrs = ctx.session.auth.current?.attributes as Record<string, string> | undefined;
    const token = attrs?.githubToken ?? "";
    if (!token) return { error: "GitHub token not set. Visit /connect to add it." };

    const headers = {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
    };

    // Submit approving review
    const reviewRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/pulls/${pull_number}/reviews`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({ body: review_comment, event: "APPROVE" }),
      }
    );
    if (!reviewRes.ok) {
      const err = await reviewRes.json();
      // Non-fatal: can't self-review, proceed to merge
      console.warn("Review submit:", err.message);
    }

    // Merge
    const mergeRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/pulls/${pull_number}/merge`,
      {
        method: "PUT",
        headers,
        body: JSON.stringify({
          merge_method,
          commit_title: `feat: merge PR #${pull_number}`,
        }),
      }
    );
    const mergeData = await mergeRes.json();
    if (!mergeRes.ok) return { error: mergeData.message ?? "Failed to merge PR" };
    return {
      merged: true,
      sha: mergeData.sha,
      url: `https://github.com/${owner}/${repo}/pull/${pull_number}`,
    };
  },
});
