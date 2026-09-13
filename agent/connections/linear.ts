import { defineMcpClientConnection } from "eve/connections";

export default defineMcpClientConnection({
  url: "https://mcp.linear.app/mcp",
  description: "Linear workspace: issues, projects, cycles, and comments.",
  auth: (ctx) => ({
    principalType: "user" as const,
    getToken: async () => {
      const attrs = ctx.session.auth.current?.attributes as Record<string, string> | undefined;
      const token = attrs?.linearToken ?? process.env.LINEAR_API_TOKEN ?? "";
      if (!token) throw new Error("Linear token not set. Visit /connect to add it.");
      return { token };
    },
  }),
});
