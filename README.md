# OpenClaw Medical AI

Research-grounded Medical AI SaaS platform powered by Cloudflare Workers. Every answer backed by verifiable citations from PubMed, FDA, and ClinicalTrials.gov.

## Architecture

```
Frontend (Next.js 15 + shadcn/ui)
  → API Routes (Server Actions)
    → Cloudflare Workers runtime
      → D1 (users, sessions, usage)
      → Vectorize (paper embeddings)
      → KV (sessions, rate limits)
      → AI Gateway → GPT / Claude / Llama
      → PubMed E-utilities API
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, TailwindCSS, shadcn/ui, TanStack Query |
| Backend | Cloudflare Workers via @opennextjs/cloudflare |
| Database | Cloudflare D1 |
| Vector Search | Cloudflare Vectorize |
| Cache/Sessions | Cloudflare KV |
| LLM | OpenAI GPT / Claude / Llama via AI Gateway |
| Data Sources | PubMed (NCBI), FDA, ClinicalTrials.gov |

## Getting Started

### Prerequisites

- Node.js 20+
- Cloudflare account with Workers plan
- (Optional) NCBI API key for higher PubMed rate limits

### Local Development

```bash
# Install dependencies
npm install

# Set up environment variables
cp .dev.vars.example .dev.vars
# Edit .dev.vars with your Cloudflare credentials

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment Variables

Create `.dev.vars` with:

```
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_API_TOKEN=your_api_token
```

### Deploy to Cloudflare

```bash
# Create D1 database
npx wrangler d1 create openclaw-medical-db
# Update database_id in wrangler.jsonc

# Create KV namespace
npx wrangler kv namespace create SESSION_KV
# Update id in wrangler.jsonc

# Apply database schema
npx wrangler d1 execute openclaw-medical-db --file=schema.sql

# Set secrets
npx wrangler secret put CLOUDFLARE_ACCOUNT_ID
npx wrangler secret put CLOUDFLARE_API_TOKEN

# Deploy
npm run deploy
```

## Features (Phase 1 MVP)

- **Landing Page** — Hero, features, pricing, live PubMed demo
- **Authentication** — JWT-based login/register
- **Medical Chat** — RAG-powered chat with citation panel and confidence scores
- **Research Search** — PubMed search with article details
- **Billing** — Plan tiers (Basic $29 / Pro $99 / Elite $299)
- **Settings** — Profile and API key management

## RAG Pipeline

```
Question → Search PubMed → Retrieve Abstracts → Build Context → LLM via AI Gateway → Extract Citations → Verified Answer
```

## Pricing

| Plan | Price | Queries |
|------|-------|---------|
| Basic | $29/mo | 1,000 |
| Pro | $99/mo | 10,000 |
| Elite | $299/mo | Unlimited |
| API | $0.01/call | Pay per call |

## Data Sources

- U.S. Food and Drug Administration (FDA)
- PubMed / National Library of Medicine
- ClinicalTrials.gov
- National Institutes of Health (NIH)
- European Medicines Agency (EMA)

## Roadmap

- **Phase 1** (Current): Landing, Auth, Medical Chat, Research Search, Billing
- **Phase 2**: FDA Alerts, Clinical Trials Dashboard, Saved Reports
- **Phase 3**: Admin Panel, API Marketplace, Team Workspace

## License

Proprietary — All rights reserved.
