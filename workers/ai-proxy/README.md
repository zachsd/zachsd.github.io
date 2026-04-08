# AI Proxy Worker

Cloudflare Worker for `api.zachdavis.org` that keeps the OpenRouter API key server-side and exposes two browser-safe endpoints:

- `GET /v1/models`
- `POST /v1/chat/completions`

## What It Does

- restricts browser access to approved origins
- fetches and returns the current free text-capable model list
- validates prompt size and model selection
- injects the portfolio context server-side
- forwards the request to OpenRouter with the secret key

## Required Secrets

Set this in Cloudflare:

```bash
wrangler secret put OPENROUTER_API_KEY
```

Optional vars are already declared in `wrangler.toml`, but you can override them per environment:

- `PUBLIC_SITE_URL`
- `SITE_TITLE`
- `ALLOWED_ORIGINS`

For local development, copy `.dev.vars.example` to `.dev.vars`.

## Local Run

```bash
cd workers/ai-proxy
wrangler dev
```

## Deploy

```bash
cd workers/ai-proxy
wrangler deploy
```

Then attach the Worker to the custom domain `api.zachdavis.org`.

## Recommended Hardening

- Add a Cloudflare Rate Limiting rule for `POST /v1/chat/completions`.
- Monitor Worker analytics and OpenRouter usage.
- Rotate the OpenRouter key if you suspect leakage.
