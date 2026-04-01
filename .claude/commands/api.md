# API Reference — Shory SME

Hono REST API in `packages/api/`. The single source of truth for all data access.

## Endpoint Reference

### Quote Journey (no auth)

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/quotes` | Create a new quote (draft) |
| `GET` | `/api/quotes/:id` | Get quote by ID |
| `PATCH` | `/api/quotes/:id` | Update quote details |
| `POST` | `/api/quotes/:id/submit` | Submit quote for pricing |
| `GET` | `/api/quotes/:id/results` | Get pricing results |
| `POST` | `/api/quotes/:id/accept` | Accept a quote (mock checkout) |
| `GET` | `/api/quotes/:id/policy` | Get generated policy |

### AI Advisor (no auth)

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/ai/recommend` | Recommend coverage (body includes `quote_id`) |

### File Uploads (no auth)

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/uploads` | Upload document to Vercel Blob |
| `GET` | `/api/uploads/:id` | Get upload metadata/URL |

### Admin (requires `Authorization: Bearer <token>`)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/admin/quotes` | List all quotes (filterable, paginated) |
| `PATCH` | `/api/admin/quotes/:id` | Update quote status |
| `GET` | `/api/admin/stats` | Dashboard stats |

## File Structure

```
packages/api/src/
├── index.ts              # Hono app entrypoint + Vercel adapter
├── routes/
│   ├── quotes.ts         # /api/quotes/* handlers
│   ├── admin.ts          # /api/admin/* handlers
│   ├── uploads.ts        # /api/uploads handlers
│   └── ai.ts             # /api/ai/* handlers
├── pricing/
│   ├── engine.ts         # Runs providers in parallel, aggregates results
│   ├── types.ts          # PricingProvider interface
│   └── providers/
│       └── mock.ts       # MVP mock insurer (3 profiles)
├── ai/
│   └── advisor.ts        # Claude API integration
└── middleware/
    ├── auth.ts           # Admin auth validation
    └── cors.ts           # CORS allowlist
```

## Rules

- All request bodies validated by Zod schemas from `@shory/shared`
- Error responses use standard format: `{ error: { code, message, status } }`
- Use `@shory/db` for all database access — NEVER raw SQL
- Pricing providers implement the `PricingProvider` interface
- CORS allows only: `shory.ae`, `admin.shory.ae`, `localhost:3000`, `localhost:3001`
- Rate limiting on: quote creation, AI advisor, file uploads

## Error Codes

| Code | Status | When |
|------|--------|------|
| `VALIDATION_ERROR` | 400 | Zod validation fails |
| `QUOTE_NOT_FOUND` | 404 | Quote ID doesn't exist |
| `QUOTE_INVALID_STATE` | 409 | Action not allowed in current status |
| `UPLOAD_TOO_LARGE` | 413 | File exceeds 10MB |
| `UNAUTHORIZED` | 401 | Missing/invalid admin token |
| `PRICING_FAILED` | 502 | All pricing providers failed |
| `AI_UNAVAILABLE` | 503 | Claude API call failed |

## Adding a New Endpoint

1. Add Zod schema to `packages/shared/src/schemas/`
2. Add route handler to `packages/api/src/routes/`
3. Register route in `packages/api/src/index.ts`
4. Update typed API client in `apps/<app>/lib/api-client.ts`

## Adding a Pricing Provider

1. Implement `PricingProvider` interface in `packages/api/src/pricing/providers/`
2. Register in the engine's provider list in `packages/api/src/pricing/engine.ts`
