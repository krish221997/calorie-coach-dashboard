# Skills

These are the three agent skills that power the Calorie Coach. They live as Markdown files (with YAML frontmatter for `name` + `description`) so they can be:

1. **Pasted into a One agent's skill panel** at `app.withone.ai`.
2. **Read by anyone cloning this repo** to understand exactly what the agent does.
3. **Versioned in git** alongside the dashboard code — change a skill, commit it, the change is reviewable.

## The three skills

| File | Trigger | What it does |
|---|---|---|
| [`meal-logger.md`](./meal-logger.md) | User sends a Telegram message (text / photo / voice) | Parses the meal, estimates macros, appends a row to the Notion Meals data source, sends a one-line confirmation |
| [`weekly-recap.md`](./weekly-recap.md) | Sunday 8 PM IST schedule on the agent | Reads the last 7 days of meals + active Targets row, writes a coach letter, sends it via Telegram (short interactive) and Gmail (rich HTML) |
| [`apply-targets.md`](./apply-targets.md) | User replies on Telegram to a recap suggestion (`yes` / `no` / `raise protein`) | PATCHes the active Targets row in Notion, replies confirming. Dashboard reflects the change on next reload. |

## Required Notion data sources

Both `weekly-recap` and `apply-targets` reference two Notion data sources. Their IDs are **placeholders** in the skill files (`<NOTION_MEALS_DATA_SOURCE_ID>`, `<NOTION_TARGETS_DATA_SOURCE_ID>`) — replace them with your own when you paste each skill into the agent.

### Meals data source

| Property | Type | Notes |
|---|---|---|
| Meal | Title | Format: `{meal_type} — {short_summary}` |
| Timestamp | Date | UTC, ISO 8601 |
| Meal Type | Select | One of `breakfast`, `lunch`, `snack`, `dinner` |
| Input Type | Select | One of `text`, `photo`, `voice` |
| Items | Rich text | Comma-separated list |
| Raw Input | Rich text | The user's verbatim message |
| Transcript | Rich text | (optional) For voice notes |
| kcal | Number | |
| Protein (g) | Number | |
| Fat (g) | Number | |
| Carbs (g) | Number | |
| Photo | Files | (optional) Reserved for future v2 |

### Targets data source

| Property | Type | Notes |
|---|---|---|
| Name | Title | e.g. `Active targets` |
| Active | Checkbox | Only one row should have this checked |
| Kcal | Number | Daily calorie target |
| Protein (g) | Number | |
| Fat (g) | Number | |
| Carbs (g) | Number | |
| Updated At | Date | Set fresh on every PATCH |

## Required One connections

| Platform | Used by | Why |
|---|---|---|
| `notion` | all three | Read meals, read/write targets |
| `gmail` | `weekly-recap` | Sends the rich HTML email |
| `deepgram` | runtime (not skill) | Transcribes voice notes before they reach `meal-logger` |

The Telegram side is **not** a One connection — it's the agent's native channel adapter. When a skill emits final text, the runtime delivers it back through whichever channel the original message came in on.

## Schedules

The agent should have these schedules configured (One dashboard → agent → Schedules tab):

| Cron (IST) | Skill / instruction |
|---|---|
| `0 8 * * *` | "Send one short message asking what they had for breakfast." |
| `0 13 * * *` | "Send one short message asking what they had for lunch." |
| `0 17 * * *` | "Send one short message asking what they had for snacks." |
| `0 21 * * *` | "Send one short message asking what they had for dinner." |
| `0 20 * * 0` | Run `weekly-recap.md` |

Adjust the times to your timezone if you're not on IST — the skills internally compute IST from UTC, so the schedule cron just needs to fire at the right wall-clock moment.
