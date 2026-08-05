import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

/**
 * Step 1 of the Decap CMS "github" backend OAuth dance.
 *
 * The CMS admin UI (public/admin) opens this route in a popup. It redirects
 * to GitHub's authorize screen, then GitHub redirects back to /api/callback
 * with a code we exchange for an access token there.
 *
 * Requires a GitHub OAuth App — see docs/cms-setup.md. Client id/secret are
 * never shipped to the browser; only this server route touches them.
 */
export async function GET(request: NextRequest) {
  const clientId = process.env.GITHUB_OAUTH_CLIENT_ID;
  if (!clientId) {
    return new NextResponse(
      "Missing GITHUB_OAUTH_CLIENT_ID. See docs/cms-setup.md.",
      { status: 500 }
    );
  }

  const redirectUri = `${request.nextUrl.origin}/api/callback`;
  const state = randomUUID();

  const authorizeUrl = new URL("https://github.com/login/oauth/authorize");
  authorizeUrl.searchParams.set("client_id", clientId);
  authorizeUrl.searchParams.set("redirect_uri", redirectUri);
  authorizeUrl.searchParams.set("scope", "repo,user");
  authorizeUrl.searchParams.set("state", state);

  const response = NextResponse.redirect(authorizeUrl);
  // Short-lived, httpOnly — just here to verify the callback's `state` matches.
  response.cookies.set("decap_oauth_state", state, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });
  return response;
}
