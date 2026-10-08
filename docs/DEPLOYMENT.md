# Deployment

The game is a static site. Vercel serves the committed `offline/` folder as-is — there is **no build step on Vercel** (`vercel.json`: `outputDirectory: "offline"`, empty build/install commands). Build locally and commit.

## Accounts

This is a personal project: GitHub **isaac1310**, Vercel **personal Hobby scope**. Never deploy it under a work account or team.

## Release

```bash
python3 build.py
tools/smoke.sh
git add -A && git commit -m "…" && git push origin main
```

Pushing to `main` triggers a production deployment through the Vercel Git integration.

## First-time Vercel setup

1. vercel.com → **Add New… → Project**.
2. **Scope selector (top left): pick your personal Hobby account**, not a team — it may default to a team.
3. Import `isaac1310/Muskets` (grant the Vercel GitHub app access to that repo if asked).
4. Framework preset: **Other**. Leave Root Directory as the repo root. `vercel.json` supplies the rest.
5. Deploy.

## Things that fail silently

- **Wrong Root Directory** → `404: NOT_FOUND`. It must be the repo root (where `vercel.json` lives).
- **Forgot to rebuild** → the site serves the old game. `offline/index.html` must be rebuilt and committed with every source change.
- **Stale installed app** → `sw.js` and `index.html` are served `no-cache`, and the cache key changes on every build, so an installed copy updates on the next online launch. If it doesn't, reopen once while online.

## Headers

`vercel.json` sets `Referrer-Policy: no-referrer`, `X-Content-Type-Options: nosniff`, a restrictive `Permissions-Policy`, `no-cache` on the page and service worker, and the manifest content type.
