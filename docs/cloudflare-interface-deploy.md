# Cloudflare Interface Deploy

This guide deploys the Next.js application to Cloudflare using OpenNext.

## What This Deploys

- the public application interface
- the server-side API routes
- the app in `FABRIC_ACCESS_MODE=bridge` so it talks to your local blockchain bridge instead of holding Fabric secrets in Cloudflare

## Already Added In This Repo

- `wrangler.jsonc`
- `open-next.config.ts`
- `cf:build`, `cf:preview`, and `cf:deploy` package scripts
- `next.config.mjs` initialization for local Cloudflare development

## Required Cloudflare Variables

Set these in Cloudflare Workers/Pages before deploy:

- `APP_URL`
- `NEXT_PUBLIC_APP_URL`
- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`
- `DB_SSL_REJECT_UNAUTHORIZED`
- `JUDGE_AI_SERVICE_URL`
- `FABRIC_ACCESS_MODE=bridge`
- `FABRIC_BRIDGE_URL`
- `FABRIC_BRIDGE_TOKEN`
- `FABRIC_BRIDGE_TIMEOUT_MS=15000`

If your database requires a CA certificate, prefer using a platform-managed trusted CA or adapt the app to load the CA from a Cloudflare secret value rather than a file path.

## Local Validation

Run:

```powershell
cmd /c npm run cf:build
```

Optional local preview:

```powershell
cmd /c npm run cf:preview
```

## Deploy

Log in to Cloudflare from the CLI:

```powershell
cmd /c npx wrangler login
```

Then deploy:

```powershell
cmd /c npm run cf:deploy
```

## Recommended First Production Values

- `APP_URL=https://lesotho-justice-app.<your-subdomain>.workers.dev`
- `NEXT_PUBLIC_APP_URL=https://lesotho-justice-app.<your-subdomain>.workers.dev`
- `FABRIC_ACCESS_MODE=bridge`
- `FABRIC_BRIDGE_URL=<your Cloudflare tunnel URL>`
- `FABRIC_BRIDGE_TOKEN=<same token used by the local bridge>`

## Important Notes

- The blockchain still runs locally in this model.
- If the local bridge is down, blockchain-backed features will fail.
- Keep the bridge token secret and rotate it if exposed.
