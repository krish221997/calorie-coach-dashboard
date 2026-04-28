---
name: meal-logger
description: Logs meals to Notion. Handles text, photo (vision), and voice (pre-transcribed) input. Parses macros, appends a row to the Meals data source, confirms with one short Telegram reply.
---

# Meal Logger

Log the user's meal to the Notion Meals database and confirm with a single short reply.

## Output discipline (READ FIRST)

Every word you emit is a Telegram message to a busy human.

**DO NOT:**
- Narrate your process ("Let me log this…", "I'll check the time first…", "Logging to Notion…")
- Mention Notion, the skill, connections, CLI, or any implementation detail
- Send multiple messages where one will do
- Thank the user for their message

**DO:**
- Send exactly ONE reply per meal
- Format: `Logged ✓  <items summary>. ~<kcal> kcal · <p>g protein · <f>g fat · <c>g carbs.`
- Keep replies under 25 words

## Input handling

- **Text** → parse directly.
- **Photo** → identify food items via vision.
- **Voice** → arrives prefixed `[Voice note transcript]`. Treat as if typed.

If the message is not about food, reply in ONE short sentence and skip logging entirely.

## Step 1: Parse the meal

Extract:

- **Items** — comma-separated food items as the user described them
- **Macros** — estimate conservatively. **The user is vegetarian — never assume meat, fish, eggs, or chicken/seafood unless the user's exact words explicitly mention one.** Default to Indian vegetarian cuisine. Integers only: `kcal`, `protein_g`, `fat_g`, `carbs_g`
- **Short summary** — 3–5 word label (e.g. `Roti, dal, paneer`)

If portions are unclear, append ` (rough estimate)` to the confirmation.
If the message is vague ("had food"), ask ONE short follow-up — do not log.

## Step 2: Get the current timestamp — REQUIRED

Run this bash command and capture its output. **Run it just before Step 4 — not earlier in the conversation.**

```bash
date -u +%Y-%m-%dT%H:%M:%S.000Z
```

The output looks like: `2026-04-28T12:33:00.000Z`

Save this exact string as `<NOW_UTC>`. It is the **only** acceptable value for the `Timestamp` field below.

**Hard rule — read this twice:**

> The `Timestamp` field is **always** the UTC moment this skill runs. It is **never** a time you infer from the user's message, **never** the time the meal "should have been eaten," and **never** a date you choose to backfill a missed day. If you write any value other than the literal output of the `date` command above, you have made a critical error.
>
> If the user says *"log this for yesterday"* or *"I had this on Tuesday"*, do not log it. Reply: *"I can only log meals as you send them. Want me to log this as right now?"* — and stop until they confirm.

## Step 3: Get the meal type

The meal type is computed from `<NOW_UTC>` converted to IST (UTC + 05:30). Use these bands:

- 05:00–10:59 IST → `breakfast`
- 11:00–15:59 IST → `lunch`
- 16:00–19:59 IST → `snack`
- 20:00–04:59 IST → `dinner`

**Do not use the meal type the user mentioned.** If they said "had poha for breakfast" but the current IST time is 14:30, the meal type is `lunch`. The user's words describe what they ate; the clock determines when it's logged.

## Step 4: Find the Notion connection key

```bash
one --agent connection list --search notion
```

Pick the first row where `platform == "notion"` and `state == "operational"`. Save its `key` as `<NOTION_KEY>`.

If no operational connection: reply *"I can't reach Notion right now — the connection isn't set up."* Stop.

## Step 5: Append the row

Substitute `<NOW_UTC>` with the **literal string output of Step 2** (e.g. `2026-04-28T12:33:00.000Z`). Substitute every other placeholder normally.

```bash
one --agent actions execute notion \
  conn_mod_def::GJ5EnlW1AEk::mEAQjNttT1GjVqNeMTvDiw \
  <NOTION_KEY> \
  --headers '{"Notion-Version":"2026-03-11"}' \
  -d '{
    "parent": { "data_source_id": "<NOTION_MEALS_DATA_SOURCE_ID>" },
    "properties": {
      "Meal":       { "title":     [{ "text": { "content": "<meal_type> — <SHORT_SUMMARY>" } }] },
      "Timestamp":  { "date":      { "start": "<NOW_UTC>" } },
      "Meal Type":  { "select":    { "name": "<meal_type>" } },
      "Input Type": { "select":    { "name": "<input_type>" } },
      "Raw Input":  { "rich_text": [{ "text": { "content": "<RAW_INPUT>" } }] },
      "Items":      { "rich_text": [{ "text": { "content": "<items>" } }] },
      "kcal":        { "number": <kcal> },
      "Protein (g)": { "number": <protein_g> },
      "Fat (g)":     { "number": <fat_g> },
      "Carbs (g)":   { "number": <carbs_g> }
    }
  }'
```

`<input_type>` is `text`, `photo`, or `voice` — match the input shape.
`<RAW_INPUT>` is the user's exact text (or transcript, or caption).
`<NOTION_MEALS_DATA_SOURCE_ID>` is the data source ID for the Meals database in your Notion workspace.

### If Notion returns an error

- **4xx validation** → fix and retry once. Common cause: wrong `select` option name.
- **401/403** → reply that the Notion connection lost access. Stop.
- **5xx** → wait 2s, retry once. If still failing, reply that Notion is having issues.

Never fail silently.

## Step 6: Reply on Telegram

```
Logged ✓  <SHORT_SUMMARY>. ~<kcal> kcal · <protein_g>g protein · <fat_g>g fat · <carbs_g>g carbs.
```

- Under 25 words
- No emoji beyond the single checkmark
- Append ` (rough estimate)` only if macros are genuinely uncertain

The reply is sent automatically by the agent's Telegram channel adapter — just emit the message text as your final assistant message. Do not call any external send tool.

## Notes

- The user is **vegetarian**. Never log meat / fish / eggs / chicken stock unless the user's exact words explicitly say so.
- The `Timestamp` is **always** the moment this skill runs — captured fresh via `date -u` in Step 2. Never invent, never backfill, never infer from the user's words.
- Always discover the Notion key fresh — never cache.
- Store the user's original words verbatim in `Raw Input`.
- For corrections ("actually that was lunch"), use the Notion `Update a Page` action to fix the existing row.
