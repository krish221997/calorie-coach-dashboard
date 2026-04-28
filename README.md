# Calorie Coach

A personal calorie coach built end-to-end on **[One](https://withone.ai)** — the agent platform that handles the scheduler, the Telegram channel, the LLM calls, and every integration in one place.

You message a Telegram bot with what you ate. The agent estimates macros, writes a row to your Notion database, and replies in a line. Every Sunday at 8 PM the agent reads your last 7 days, sends a coach letter on Telegram, mails you a designed HTML recap, and waits for a YES/NO reply that updates your goals. The dashboard in this repo is just the read side — six screens of dark mission-control UI rendering whatever the agent has written to Notion.

## Why this is built on One

The whole point of this build is what *isn't* in the repo:

- **No backend code.** No webhook server, no Lambda, no message queue, no cron service.
- **No infrastructure.** No Docker, no Kubernetes, no Render/Fly/Railway deploy.
- **No proprietary database.** Your meals live in your own Notion, not in some vendor lock-in datastore.

One handles all of it natively. The agent owns its scheduler (5 cron rows). The agent owns the Telegram channel (no relay needed). The agent owns the LLM calls (configure once, no SDK plumbing). The agent owns the integrations (Notion, Gmail, Deepgram — all native One connections). The agent's "skills" are three Markdown files pasted into the panel.

This dashboard reads from Notion via One's passthrough API using a single `ONE_SECRET` bearer, so no per-platform credentials live in this app either.

## What's in this repo

| Part | Where | What |
|---|---|---|
| **The agent skills** | `skills/` | Three Markdown files that paste into a One agent's Skills panel — meal-logger, weekly-recap, apply-targets. This is the actual brain. |
| **The dashboard** | `app/`, `components/`, `lib/`, etc. | A read-only Next.js 16 + React 19 site that renders meals out of Notion. Dark mission-control aesthetic (Instrument Serif + JetBrains Mono + Inter). |
| **Notion DB shapes** | This README, below | The exact schema you need on Meals + Targets so the skills can write to them. |

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
- **Skills** — paste the three files from `skills/` into the skills panel. **Before pasting**, find-and-replace these placeholders in each skill file:
  - `<NOTION_MEALS_DATA_SOURCE_ID>` → your Meals data source ID from step 1 (in `meal-logger.md` and `weekly-recap.md`)
  - `<NOTION_TARGETS_DATA_SOURCE_ID>` → your Targets data source ID from step 1 (in `weekly-recap.md` and `apply-targets.md`)
  - `https://calorie-coach-dashboard.vercel.app` → your own deployed dashboard URL (in `weekly-recap.md`, line ~293, inside the EMAIL_TEMPLATE's `<a href>`). This is the URL the "OPEN MISSION CONTROL →" button in the email points to. If you skip this step, the email will link to the maintainer's deployment instead of yours.
- **Schedules** — add the five rows listed in `skills/README.md`.

That's it. Send a meal to your bot on Telegram, and the dashboard will show the row within seconds.

### Environment variables

| Var | Purpose | Required |
|---|---|---|
| `ONE_SECRET` | Bearer for One API — get from app.withone.ai/settings | yes |
| `NOTION_MEALS_DATA_SOURCE_ID` | Notion data source ID of the Meals DB | yes |
| `NOTION_TARGETS_DATA_SOURCE_ID` | Notion data source ID of the Targets DB. Required for the YES/NO flow — the `apply-targets` skill reads/writes the Pending fields on the active row. | yes |
| `NEXT_PUBLIC_TELEGRAM_BOT_HANDLE` | `@your_bot` shown on the station screen's "how to begin" panel | optional |

## Timezone

All times are formatted in **Asia/Kolkata** regardless of where the
Next.js server runs. See `lib/time.ts`. Day-key computation (used by
`aggregateByDay`, `mealsForDate`, `todayKey`) also uses IST so a meal
logged at 01:00 IST is grouped into the correct IST day, not UTC. Fork
this and change `TZ` if you're elsewhere.

## Known limitations

- **Photos aren't stored.** The agent receives photos via Telegram and
  identifies the food via vision, but the photo itself isn't uploaded
  anywhere. The meal detail screen shows the photo panel only when
  `photoUrl` is set on the row, which it currently never is. To enable
  this you'd need to add an object-storage connection (S3, Cloudinary)
  and have the meal-logger skill upload before writing the Notion row.
- **The ingredient breakdown is an even split** of the total macros
  across the items the agent recognised — not real per-ingredient data.
  The Notion Meals schema only stores totals plus a comma-separated
  `Items` text field, so the dashboard divides totals by item count
  and labels the panel `ESTIMATED SPLIT`. Adding real per-ingredient
  macros would mean a JSON column on Meals plus updates to meal-logger
  and the meal-detail screen.

## Design credit

UI was exported from the Claude Design handoff bundle and ported to
React components. The six-screen mission-control aesthetic and all SVG
charts come from that bundle.

## License

[MIT](./LICENSE).
