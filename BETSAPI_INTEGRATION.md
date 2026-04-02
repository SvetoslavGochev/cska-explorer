# BetsAPI Integration Plan (Implemented Starter)

This repository now includes a starter backend proxy in `proxy/`.

## What is already done

- Added server-side proxy with environment-based API key.
- Added CSKA-focused endpoints for upcoming, results, and odds.
- Added a pass-through endpoint for quick testing.

## Deploy flow

1. Deploy `proxy/` as a Node service.
2. Set environment variables from `.env.example`.
3. Verify with `GET /api/health`.
4. Set `window.CSKA_PROXY_URL` in `runtime-config.js` to the deployed proxy URL.
5. Push to `main`.

## GitHub Actions auto-deploy (Railway)

Workflow file: `.github/workflows/deploy-proxy-railway.yml`

Required repository secrets:

- `RAILWAY_TOKEN`
- `RAILWAY_SERVICE` (optional, but recommended)
- `RAILWAY_PROJECT_ID` (optional, recommended if repo is not linked in CI)

The workflow deploys automatically on push when `proxy/**` changes.

## Frontend wiring suggestion

Use proxy data as optional enhancement and keep Flashscore/SportsDB as primary fallback chain.

Suggested order:

1. Flashscore (primary)
2. BetsAPI proxy (enhancement/live/odds)
3. SportsDB (fallback)
4. Cache snapshot

## Quick smoke tests

- `GET /api/health` should return `configured: true`.
- `GET /api/cska/upcoming` should return JSON payload.
- `GET /api/cska/results` should return JSON payload.
- `GET /api/cska/odds?event_id=<id>` should return odds for a valid event.

## Security

- Never store the API key in frontend files.
- Restrict CORS in production to your site domain.
- Add simple rate limiting if proxy is public.
