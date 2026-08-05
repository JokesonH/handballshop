import { NextRequest, NextResponse } from "next/server";

/**
 * Step 2 of the Decap CMS "github" backend OAuth dance.
 *
 * GitHub redirects here with a `code` after the user approves the OAuth
 * app. We exchange it server-side for an access token (client secret never
 * reaches the browser), then hand the token to the CMS via the postMessage
 * handshake Decap's github backend expects from its popup window:
 *
 *   1. Popup posts "authorizing:github" to window.opener.
 *   2. Opener (the CMS) replies with the same message, once it's listening.
 *   3. Popup posts "authorization:github:success:{...}" (or "...:error:...")
 *      back at the opener's own origin, then the CMS closes the popup.
 */
function messagePage(status: "success" | "error", payload: Record<string, unknown>) {
  const message = `authorization:github:${status}:${JSON.stringify(payload)}`;
  return `<!doctype html>
<html>
  <body>
    <script>
      (function () {
        function receiveMessage(e) {
          window.opener.postMessage(${JSON.stringify(message)}, e.origin);
          window.removeEventListener("message", receiveMessage, false);
        }
        window.addEventListener("message", receiveMessage, false);
        window.opener.postMessage("authorizing:github", "*");
      })();
    </script>
  </body>
</html>`;
}

function htmlResponse(body: string) {
  return new NextResponse(body, { headers: { "content-type": "text/html" } });
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const savedState = request.cookies.get("decap_oauth_state")?.value;

  const clientId = process.env.GITHUB_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GITHUB_OAUTH_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return htmlResponse(
      messagePage("error", { message: "OAuth app not configured on the server." })
    );
  }
  if (!code || !state || state !== savedState) {
    return htmlResponse(
      messagePage("error", { message: "Invalid or expired OAuth state." })
    );
  }

  const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: `${request.nextUrl.origin}/api/callback`,
    }),
  });

  const data = await tokenResponse.json();

  if (!tokenResponse.ok || data.error || !data.access_token) {
    return htmlResponse(
      messagePage("error", {
        message: data.error_description ?? "GitHub token exchange failed.",
      })
    );
  }

  const response = htmlResponse(
    messagePage("success", { token: data.access_token, provider: "github" })
  );
  response.cookies.delete("decap_oauth_state");
  return response;
}
