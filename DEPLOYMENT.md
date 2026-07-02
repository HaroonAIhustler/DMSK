# Deployment Checklist

## Required environment variables

- `NEXT_PUBLIC_SITE_URL`: public production origin, for example `https://lp.aigrowthstudio.ai`
- `GHL_WEBHOOK_URL`: LeadConnector or GoHighLevel event webhook URL for general funnel events
- `QUESTION_WEBHOOK_URL`: LeadConnector or GoHighLevel webhook URL for per-question survey updates
- `NEXT_PUBLIC_RAZORPAY_KEY_ID`: Razorpay publishable key, only needed if `/starter-kit` checkout is live

Set `GHL_WEBHOOK_URL` and `QUESTION_WEBHOOK_URL` in production before going live. Do not commit live webhook URLs to the public repository.

## Preflight

Run these before deploying:

```bash
npm run lint
npm run typecheck
npm run build
```

## Production behavior

- `/` redirects to `/survey`.
- `/SURVEY` redirects to `/survey` through `src/proxy.ts`.
- `/api/events` and `/api/question-webhook` will not block the user journey if webhook delivery fails.
- `robots.txt` allows public pages and blocks `/api/`.
- `sitemap.xml` publishes the survey and result routes.
