# CMS setup (Decap CMS)

The catalogue is still just JSON files in `content/`; this adds an editor UI
at `/admin` that reads and writes those same files by committing straight to
GitHub. No database, no separate backend, no change to `lib/catalog.ts` or
how the site builds — see the README's "No database, no CMS" line for why
that constraint mattered enough to pick a git-backed CMS over a hosted one.

## What's in the repo already

- `public/admin/index.html` — the CMS shell (loads Decap CMS from a CDN,
  nothing to build or install).
- `app/admin/config.yml/route.ts` — generates the CMS config **per request**
  instead of a static file, so two things can't drift out of sync:
  - `base_url` always matches whatever origin `/admin` is loaded from
    (production domain or a Vercel preview URL) — nothing to hardcode.
  - Each category's subcategory dropdown is read live from
    `content/categories.json`. Add a subcategory there and it appears in the
    CMS with no edit to this file, same promise the README makes for the
    site itself.
- `app/api/auth/route.ts` + `app/api/callback/route.ts` — a GitHub OAuth
  dance so editors can log in with their GitHub account. This exists because
  Decap's "github" backend needs *some* OAuth provider, and the common
  shortcut (Netlify's hosted one) only works when the site is hosted on
  Netlify.

`content/categories.json` and `content/products/**` on the `merch` category
are the only things **not** wired into a collection: `categories.json` is a
top-level JSON array, which doesn't fit Decap's file-collection model
cleanly, and it's structural taxonomy that changes rarely — keep editing it
directly.

## One-time setup

### 1. Create a GitHub OAuth App

GitHub → Settings → Developer settings → OAuth Apps → **New OAuth App**.

| Field | Value |
|---|---|
| Application name | anything, e.g. "Northcourt CMS" |
| Homepage URL | `https://handballshop.vercel.app` |
| Authorization callback URL | `https://handballshop.vercel.app/api/callback` |

(The repo is already linked to that Vercel project. If a custom domain gets
added later, update both fields here to match — `base_url` itself won't need
touching, since it's generated per-request from whatever origin `/admin` is
loaded from.)

Save it, then generate a **client secret**. You'll get a client ID and a
client secret — both go into environment variables, never into the repo.

If you deploy preview URLs per-branch (Vercel does this by default), the
callback URL is fixed per OAuth App, so previews can't complete the OAuth
flow — only whatever domain you register above can. That's fine: log into
`/admin` on the production domain, not a preview URL.

### 2. Set environment variables

In your host's project settings (e.g. Vercel → Project → Settings →
Environment Variables):

```
GITHUB_OAUTH_CLIENT_ID=<from the OAuth App>
GITHUB_OAUTH_CLIENT_SECRET=<from the OAuth App>
```

Optional, only needed if the CMS should point at a different repo/branch
than `JokesonH/handballshop` on `main`:

```
GITHUB_REPO=<owner>/<repo>
GITHUB_BRANCH=<branch>
```

### 3. Give editors repo access

Decap commits as whoever authenticates, using the `repo` OAuth scope. An
editor needs at least **write** access to the repository to save anything.

## Using it

Visit `/admin` on the deployed site, sign in with GitHub, and edit. Every
save is a commit to `main` — there's no draft/review step by default. If you
want one, add `publish_mode: editorial_workflow` to the generated config
(edit `productFields`'s sibling `config` object in
`app/admin/config.yml/route.ts`); Decap will then open a small Kanban view
and commit each entry to its own branch instead of `main` directly.

## Gotchas

- **Uploaded images land in `public/uploads`** (`media_folder` /
  `public_folder` in the config) and get committed to the repo like any
  other file. Fine at this catalogue's size; if that folder grows large,
  that's the point to move to a real asset host and change those two
  config keys.
- **Local dev**: `/admin` works against `npm run dev` too, but the OAuth
  callback URL is fixed to whatever domain you registered in step 1, so
  `http://localhost:3000/api/callback` won't complete unless you register a
  second, dev-only OAuth App pointed at localhost and swap the env vars
  locally.
- **This does not touch checkout or fulfillment.** Editors can still set any
  `status`/`fulfillment` combination on a product; what that does when a
  customer hits the page is entirely `components/BuyPanel.tsx`'s decision,
  unchanged by any of this.
