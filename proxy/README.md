# CSKA BetsAPI Proxy

Minimal backend proxy for CSKA Explorer.

## Why this exists

BetsAPI pages are protected by anti-bot checks and should not be consumed directly from frontend code.
This proxy keeps the API key on the server and exposes only the endpoints you need.

## 1) Configure

1. Copy `.env.example` to `.env`
2. Set your real `BETSAPI_KEY`
3. Optionally change `BETSAPI_BASE_URL` and `CSKA_TEAM_ID`

## 2) Run

```bash
npm install
npm run dev
```

Default URL: `http://localhost:8787`

## 3) Endpoints

- `GET /api/health`
- `GET /api/cska/upcoming`
- `GET /api/cska/results`
- `GET /api/cska/odds?event_id=...`
- `GET /api/cska/raw?endpoint=/events/upcoming&team_id=44156&sport_id=1`

## Notes

- Keep this proxy server-side only (Railway/Render/Fly/your VPS).
- Do not expose `BETSAPI_KEY` in frontend code.
- If your plan/rate limits differ, adjust endpoint paths in `server.js`.
- Deployment is automated via GitHub Actions on each push that changes `proxy/**`.
