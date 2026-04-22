# Calorie Coach — dashboard

A Next.js 16 + Tailwind v4 dashboard that reads the meals your Telegram
calorie-coach agent writes to Notion. Built on One's design system
(warm ivory + charcoal palette, DM Sans / DM Serif / DM Mono).

Everything flows through One's passthrough API using a single
`ONE_SECRET` bearer, so no per-platform credentials live in this app.

## What it shows

- Today's totals (calories, protein, fat, carbs) with progress bars
  toward daily targets
- A chat-style feed of today's meals, styled like a conversation with
  the coach (user bubble on the right, coach summary on the left)
- 30-day trend chart (calories + protein)
- A compact "recent meals" sidebar for the days before today
- Connection health indicator for One and Notion

## Setup

```bash
cp .env.example .env.local
# fill in ONE_SECRET + NOTION_MEALS_DATA_SOURCE_ID

npm install
npm run dev
# open http://localhost:3000
```

Environment variables:

| Var | Purpose | Required |
|---|---|---|
| `ONE_SECRET` | Bearer for One API — get from app.withone.ai/settings | yes |
| `NOTION_MEALS_DATA_SOURCE_ID` | Notion data source ID of the Meals DB | yes |
| `ONE_API_BASE` | Override the One API base URL | no |
| `DAILY_KCAL_TARGET` | Daily calorie target (default 2200) | no |
| `DAILY_PROTEIN_TARGET` | Daily protein target in grams (default 140) | no |
| `DAILY_FAT_TARGET` | Daily fat target in grams (default 70) | no |
| `DAILY_CARBS_TARGET` | Daily carb target in grams (default 240) | no |

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│  BROWSER ───► Next.js server route (RSC)                     │
│                         │                                    │
│                         │ ONE_SECRET (env)                   │
│                         ▼                                    │
│                  lib/one.ts                                  │
│                  ├─ listConnections()                        │
│                  └─ passthrough() ──► api.withone.ai/v1/     │
│                                        passthrough/…         │
│                         │                                    │
│                         ▼                                    │
│                  lib/meals.ts                                │
│                  fetchMeals()                                │
│                    ├─ findConnection("notion")               │
│                    └─ passthrough →                          │
│                       /data_sources/{id}/query               │
└──────────────────────────────────────────────────────────────┘
```

All fetching is server-side; the browser never sees your `ONE_SECRET`.
React Server Components render the dashboard straight from the freshest
Notion query on every page load.

## Files

- `lib/one.ts` — tiny One API client (connection list + passthrough)
- `lib/meals.ts` — meal types + Notion row parser + daily aggregations
- `lib/utils.ts` — `cn()` class-name helper
- `components/ui/*` — shadcn-style primitives (Card, Badge, Progress, etc.)
- `components/stat-card.tsx` — today's macro numbers
- `components/meal-feed.tsx` — chat-style meal conversation
- `components/trend-chart.tsx` — 30-day recharts line chart
- `components/connection-banner.tsx` — env / connection error banners
- `app/page.tsx` — the dashboard
- `app/layout.tsx` — DM Sans / Mono / Serif fonts

## Design system notes

Tokens are copied from One's core-ui (`styles/globals.css`) and mapped
to Tailwind v4's `@theme` block in `app/globals.css`. The light theme
uses the Ivory scale; the dark theme uses the Charcoal scale. Brand
color tokens are exposed as `bg-brand-yellow`, `bg-brand-focus`,
`bg-brand-alert`.
