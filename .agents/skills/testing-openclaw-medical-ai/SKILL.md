---
name: testing-openclaw-medical-ai
description: End-to-end testing of the OpenClaw Medical AI SaaS application. Use when verifying deployment, RAG pipeline, PubMed integration, or UI changes.
---

# Testing OpenClaw Medical AI

## Live Deployment

- **URL:** `https://openclaw-medical-ai.dawn-flower-35e5.workers.dev`
- **Stack:** Next.js 16 + Cloudflare Workers + D1 + KV + AI Gateway
- **Adapter:** `@opennextjs/cloudflare`

## Pages to Test

| Page | Path | Key Behavior |
|------|------|--------------|
| Landing | `/` | Hero, features grid, pricing ($29/$99/$299), PubMed demo search |
| Register | `/register` | 3-field form (Name/Email/Password), redirects to `/chat` |
| Login | `/login` | Email/Password form, redirects to `/chat` |
| Medical Chat | `/chat` | RAG pipeline: PubMed search → AI Gateway → response with citations |
| Research | `/research` | PubMed full search with article cards (15 results per page) |
| Billing | `/billing` | Plan tiers, usage bar, add-ons |
| Settings | `/settings` | Profile, API keys, security |

## Testing the RAG Pipeline (Primary Feature)

1. Navigate to `/chat`
2. Use a suggested question or type a medical query
3. Verify the response contains structured sections:
   - `## Summary` — brief answer
   - `## Evidence` — cited papers with PMIDs
   - `## Risks` — safety information
   - `## References` — full citations with DOIs
   - `## Confidence Score` — percentage
4. Verify the right-side citation panel populates with PubMed links
5. Verify the confidence badge appears below the response

## Testing PubMed Search

### Landing Page Demo
- Scroll to "Try It Now — Search PubMed" section
- Type a term (e.g., "aspirin") and click Search
- Expect: bullet list of articles with title, journal, date, PMID

### Research Page
- Navigate to `/research`
- Use quick filter chips or type a query
- Expect: result count (e.g., "10,298 results") + article cards with authors, journal, DOI, PMID, PubMed link

## Known Issues & Workarounds

- **Auth is demo-only:** Registration/login accept any credentials and return a JWT without saving to D1. This is by design for Phase 1.
- **PubMed rate limiting:** PubMed's EFetch API may return `"API rate limit exceeded"` when fetching multiple abstracts quickly. This appears in the citation panel as raw JSON. Not a bug in our code — it's PubMed's server-side rate limit. Retry or wait a few seconds.
- **AI Gateway model:** Uses `@cf/meta/llama-3.1-8b-instruct` via Cloudflare Workers AI. If the gateway ID "default" doesn't exist, the chat falls back to demo mode with structured placeholder responses.

## API Endpoints for Verification

```bash
# PubMed search
curl -s "https://openclaw-medical-ai.dawn-flower-35e5.workers.dev/api/search/pubmed?q=aspirin&max=3" | python3 -m json.tool

# Chat RAG pipeline
curl -s -X POST "https://openclaw-medical-ai.dawn-flower-35e5.workers.dev/api/chat" \
  -H "Content-Type: application/json" \
  -d '{"message":"aspirin cardiovascular"}' | python3 -m json.tool

# Auth (demo mode)
curl -s -X POST "https://openclaw-medical-ai.dawn-flower-35e5.workers.dev/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test","name":"Test"}' | python3 -m json.tool
```

## Devin Secrets Needed

- `CLOUDFLARE_API_TOKEN` — For deploying changes via `wrangler`. Needs permissions: Workers Edit, D1 Edit, KV Storage Edit, AI Gateway Read/Edit.
- `CLOUDFLARE_ACCOUNT_ID` — Cloudflare account identifier (`${CLOUDFLARE_ACCOUNT_ID}`).

## Build & Deploy

```bash
npm install
npm run build    # opennextjs-cloudflare build
npm run deploy   # opennextjs-cloudflare deploy
```
