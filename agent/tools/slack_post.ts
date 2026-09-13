import { defineTool } from "eve/tools";
import { z } from "zod";

export default defineTool({
  description: "Post a message to a Slack channel.",
  inputSchema: z.object({
    channel: z.string().describe("Channel name (e.g. #dev-standup) or channel ID"),
    message: z.string().describe("The message text to post (markdown supported)"),
  }),
  label: {
    start: ({ channel }) => `Posting to Slack ${channel}…`,
    complete: () => "Posted to Slack",
  },
  async execute({ channel, message }, ctx) {
    const attrs = ctx.session.auth.current?.attributes as Record<string, string> | undefined;
    const token = attrs?.slackToken ?? process.env.SLACK_BOT_TOKEN ?? "";
    if (!token) return { error: "Slack token not set. Visit /connect to add it." };

    const res = await fetch("https://slack.com/api/chat.postMessage", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ channel, text: message, mrkdwn: true }),
    });

    const data = await res.json();
    if (!data.ok) return { error: data.error };
    return { ok: true, ts: data.ts, channel: data.channel };
  },
});
