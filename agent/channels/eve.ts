import { eveChannel } from "eve/channels/eve";
import { localDev, none, vercelOidc, type AuthFn } from "eve/channels/auth";

function credentialsAuth(): AuthFn<Request> {
  return (request) => {
    const linearToken = request.headers.get("x-linear-token") ?? "";
    const githubToken = request.headers.get("x-github-token") ?? "";
    const slackToken = request.headers.get("x-slack-token") ?? "";
    if (!linearToken && !githubToken && !slackToken) return null;
    const userId = request.headers.get("x-user-id") ?? `anon-${linearToken.slice(-6)}`;
    return {
      authenticator: "credentials",
      principalId: userId,
      principalType: "user" as const,
      attributes: { linearToken, githubToken, slackToken, userId },
    };
  };
}

export default eveChannel({
  auth: [
    vercelOidc(),
    localDev(),
    credentialsAuth(),
    none(),
  ],
});
