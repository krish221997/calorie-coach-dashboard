# Calorie Coach — dashboard

A read-only Next.js 16 + React 19 dashboard that renders the meals your
Telegram calorie-coach agent writes to Notion. Dark mission-control
aesthetic (Instrument Serif + JetBrains Mono + Inter) ported from the
Claude Design handoff bundle.

Everything flows through One's passthrough API using a single
`ONE_SECRET` bearer, so no per-platform credentials live in this app.

## What you get

Two halves:

1. **The dashboard** (this repo's `app/`, `components/`, etc.) — six
   screens that read your meal log out of Notion and visualize it.
2. **The agent skills** (`skills/`) — three Markdown files that paste
   into a One agent's skill panel to make the loop work end to end.

The dashboard is read-only. All writes happen through the agent.

## Six screens

| Route | Screen | Purpose |
|---|---|---|
| `/` | **Today** | Primary kcal panel, macro ring, altitude chart, event log, input channels |
| `/review` | **Review** | 30-day altitude profile, macro composition, anomaly log, weekday heatmap |
| `/streaks` | **Streaks** | Apollo mission-clock, longest streak / log rate / avg meals, 90-day dot ledger |
| `/delta` | **Delta** | This-week vs last-week metric cards, compare chart, best/worst day, narrative |
| `/log` | **Transcript** | Filterable feed of all messages (text / photo / voice) with agent replies |
| `/station` | **Station** | Live "what's happening right now" view — empty-state when no events today, active feed when there are |
| `/meal/[id]` | **Payload detail** | Per-meal payload, classification, ingredient split, transcript, keyboard nav (←/→/Esc) |

## Three skills

These live in `skills/` and are documented in detail at
[`skills/README.md`](./skills/README.md).

| Skill | Trigger | What it does |
|---|---|---|
| `meal-logger` | User sends a Telegram message (text / photo / voice) | Parses the meal, estimates macros, writes a row to Notion Meals, replies in one short line |
| `weekly-recap` | Sunday 8 PM IST schedule | Pulls the last 7 days, composes a coach letter, sends short version to Telegram + designed HTML to Gmail |
| `apply-targets` | User replies to recap with `yes` / `no` / `raise protein` etc. | PATCHes the active row in Notion Targets; dashboard reflects the change on next reload |

## Setup

The dashboard is just the read side. You still need (a) two Notion databases shaped a specific way, (b) an agent on One with three skills + five schedules + three connections. Walk through these in order:

### 1. Create the two Notion databases

Inside any Notion page, create two databases with the exact column names below. Names and types matter — the skills query them by name.

**Meals** (one row per meal)

| Property | Type |
|---|---|
| Meal | Title |
| Timestamp | Date |
| Meal Type | Select (`breakfast`, `lunch`, `snack`, `dinner`) |
| Input Type | Select (`text`, `photo`, `voice`) |
| Items | Rich text |
| Raw Input | Rich text |
| Transcript | Rich text |
| kcal | Number |
| Protein (g) | Number |
| Fat (g) | Number |
| Carbs (g) | Number |
| Photo | Files (optional, reserved for future) |

**Targets** (one active row holding daily goals)

| Property | Type |
|---|---|
| Name | Title |
| Active | Checkbox (only one row should be checked) |
| Kcal | Number |
| Protein (g) | Number |
| Fat (g) | Number |
| Carbs (g) | Number |
| Updated At | Date |
| Pending Field | Rich text |
| Pending Value | Number |
| Pending Reason | Rich text |

Add one row to **Targets** with `Active = true` and your starting daily goals (e.g. 2200 kcal / 140g protein / 70g fat / 240g carbs). The three Pending columns stay empty — the weekly recap writes them when it has a suggestion, and apply-targets clears them after you reply YES/NO.

Now grab each database's **data source ID**. Open the database as a full page in Notion, look at the URL: `notion.so/<title>-<HEX>?v=...` — the hex is the *database* ID. To get the *data source* ID (Notion's 2026-03-11 API distinguishes them), use the One CLI: `one --agent actions execute notion <retrieve-database-action> <connectionKey> --path-vars '{"databaseId":"<the-hex>"}'` and read `data_sources[0].id` off the response. Or query the database via the dashboard's `/api` route once `ONE_SECRET` is set.

### 2. Configure the dashboard

```bash
cp .env.example .env.local
# fill in ONE_SECRET + the two NOTION_*_DATA_SOURCE_ID values
# (NOTION_TARGETS_DATA_SOURCE_ID is optional — falls back to env-var defaults)

npm install
npm run dev
# open http://localhost:3000
```

### 3. Set up the One agent

At [app.withone.ai](https://app.withone.ai):

- **Connections** — connect Notion, Gmail, Deepgram. Attach all three to the agent.
- **Channels** — connect a Telegram bot.
- **Skills** — paste the three files from `skills/` into the skills panel. **Before pasting**, find-and-replace `<NOTION_MEALS_DATA_SOURCE_ID>` and `<NOTION_TARGETS_DATA_SOURCE_ID>` in `weekly-recap.md` and `apply-targets.md` with your actual data source IDs from step 1.
- **Schedules** — add the five rows listed in `skills/README.md`.

That's it. Send a meal to your bot on Telegram, and the dashboard will show the row within seconds.

### Environment variables

| Var | Purpose | Required |
|---|---|---|
| `ONE_SECRET` | Bearer for One API — get from app.withone.ai/settings | yes |
| `NOTION_MEALS_DATA_SOURCE_ID` | Notion data source ID of the Meals DB | yes |
| `NOTION_TARGETS_DATA_SOURCE_ID` | Notion data source ID of the Targets DB | optional (falls back to `DAILY_*_TARGET` envs) |
| `NEXT_PUBLIC_TELEGRAM_BOT_HANDLE` | `@your_bot` shown on the idle screen | optional |
| `ONE_API_BASE` | Override the One API base URL (default `https://api.withone.ai/v1`) | no |
| `DAILY_KCAL_TARGET` | Fallback daily calorie target (default 2200) | no |
| `DAILY_PROTEIN_TARGET` | Fallback daily protein target in grams (default 140) | no |
| `DAILY_FAT_TARGET` | Fallback daily fat target in grams (default 70) | no |
| `DAILY_CARBS_TARGET` | Fallback daily carb target in grams (default 240) | no |

## Architecture

Strict separation of concerns. Data flows in one direction:

```
app/<route>/page.tsx                   (thin route handler, 3-5 lines)
        │
        ▼
controlled-components/<feature>/       (server components — business logic)
        │  await loadDashboardData()
        ▼
lib/data/{dashboard,targets}.ts        (server-side data loaders)
        │  composes endpoints + aggregations
        ▼
endpoints/{meals,targets,notion,one}.ts  (HTTP layer — only place that calls api.withone.ai)
        │
        ▼
api.withone.ai (One passthrough)  ──►  Notion
```

The stateless **presentational layer** (`components/<feature>/*.tsx`)
receives data via props and renders. Zero hook calls for business logic,
zero direct endpoint imports.

### Directory layout

```
app/                     Next.js App Router pages (route handlers only)
controlled-components/   Business logic wrappers (server components)
components/
  ui/                    Design primitives (Panel, Kicker, LED, Telemetry, Ticks, Ambient, ConnectionBanner, tokens)
  layout/                Shell chrome (DashboardShell, LeftRail, TopBar, ThemeProvider)
  today/   review/   streaks/   delta/   log/   idle/   meal/
                         Per-feature presentational components
endpoints/               HTTP layer (the only place that calls api.withone.ai)
hooks/ui/                useNow live tick hook
lib/
  constants.ts           Shared constants (Notion property names, action IDs)
  time.ts                IST-aware formatters
  meals-aggregations.ts  Pure aggregation functions (buildDaySeries, aggregateByDay, etc.)
  data/                  Server-side data loaders (dashboard, targets)
types/                   Centralized TypeScript definitions
skills/                  Agent skill markdown files (paste into One agent panel)
```

### Layering rules

- **Route handlers** (`app/<route>/page.tsx`) contain only the imported
  controlled component and route config. No data fetching, no banner logic.
- **Controlled components** contain business logic: they await data from
  `lib/data/` and pass it as props to stateless screens. Never import
  from `endpoints/*` directly.
- **Presentational components** (`components/<feature>/*.tsx`) are stateless,
  take data via props, and render. They may have local UI state (a filter
  tab, a hover overlay) but never call data loaders.
- **Endpoints** are the only place that makes HTTP calls. Everything else
  consumes typed functions from `endpoints/*`.
- **Types** live in `types/<feature>.ts` — never inline in component files.
- **No component file should exceed ~300 lines.** Three of the chart
  components (kcal-chart, compare-chart, macro-stack) are slightly over
  due to inline tooltip subcomponents — split if you touch them.

### Timezone

All times are formatted in **Asia/Kolkata** regardless of where the
Next.js server runs. See `lib/time.ts`. Day-key computation (used by
`aggregateByDay`, `mealsForDate`, `todayKey`) also uses IST so a meal
logged at 01:00 IST is grouped into the correct IST day, not UTC. Fork
this and change `TZ` if you're elsewhere.

### Theming

Two themes (dark default, light optional) driven by CSS variables on
`<html>`. `ThemeProvider` toggles between `.dark` and `.light` and
persists the choice in localStorage. All colors resolve through
`components/ui/tokens.ts` which wraps `var(--cc-*)`. Never use hex
literals in component files.

## Known limitations

- **Photos aren't stored.** The agent receives photos via Telegram and
  identifies the food via vision, but the photo itself isn't uploaded
  anywhere. The meal detail screen shows the photo panel only when
  `photoUrl` is set on the row, which it currently never is. To enable
  this you'd need to add an object-storage connection (S3, Cloudinary)
  and have the meal-logger skill upload before writing the Notion row.
- **The ingredient breakdown is an even split** of the total macros
  across the items the agent recognised — not real per-ingredient data.
  The panel labels itself accordingly (`ESTIMATED SPLIT`).
- **`localhost` CTA in the recap email won't work** when clicked from
  another device. Deploy the dashboard (Vercel works in 5 min for a
  Next 16 app) and update the email template's CTA URL.

## Design credit

UI was exported from the Claude Design handoff bundle and ported to
React components. The six-screen mission-control aesthetic and all SVG
charts come from that bundle.

## License

[MIT](./LICENSE).
