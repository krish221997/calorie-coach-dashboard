---
name: apply-targets
description: Triggers whenever the user sends a short reply to the agent that looks like YES, NO, or a target instruction (e.g. "raise protein", "kcal 2500"). Reads the Pending Field/Value/Reason on the active row in the Notion Targets database (written by weekly-recap), or parses a direct instruction. PATCHes the active Targets row and replies confirming. Always check this skill's match conditions BEFORE running meal-logger when the user's message is short and not clearly a meal description.
---

# Apply Targets

When the user replies on Telegram with YES / NO / a target instruction, apply the change to the active row in the Notion Targets database and reply confirming what changed.

## CRITICAL — FIRST OUTPUT RULE

The very first character you emit must be the first character of the Telegram reply ("D" of "Done" or "G" of "Got it"). Do not emit any preamble, plan, "I'll do X", "let me check Y", or any other words before the actual deliverable.

The user sees every word you write, in real time, on Telegram. Run tools silently. Compose the PATCH silently. Only emit text when you're emitting the final reply.

## When this runs

Run this skill when the user's most recent Telegram message is **short** and looks like a target-control reply, not a meal log. The clearest signals:

- One word: `yes`, `y`, `no`, `n`, `apply`, `keep`, `skip`, `confirm`, `decline`, `pass`
- Short instruction: `raise protein`, `lower kcal`, `protein 140`, `set kcal to 2500`, `more protein`, `cut carbs`, etc.

If the user's message is a meal description (mentions food items, portions, eating, etc.), this is **not** the right skill — fall through to `meal-logger`.

## Output discipline

Send exactly ONE Telegram reply confirming what changed. No narration, no preamble. The agent's Telegram channel adapter delivers your final assistant text automatically — emit it as your final response and do not call any external send tool.

## Step 1: Parse the user's reply

Match against these patterns:

- **Apply** — `yes`, `y`, `apply`, `do it`, `sure`, `ok`, `okay`, `go`, `agreed`, `confirm`
- **Decline** — `no`, `n`, `keep`, `skip`, `not now`, `pass`, `decline`
- **Specific instruction** — `raise protein`, `lower kcal`, `set protein to 130`, `kcal 2500`, `protein 140g`, etc.

If the reply doesn't match any of these, respond:

```
Reply YES to apply the suggestion, NO to keep current targets, or send specific changes like "raise protein to 140".
```

Stop.

## Step 2: Read the active Targets row (always)

You always need to read the active row first — for **Apply** to read the Pending fields, for **Specific instruction** to read the current values, for **Decline** to clear the Pending fields.

Find the Notion connection key:

```bash
one --agent connection list --search notion
```

Save as `<NOTION_KEY>`.

Query the active Targets row:

```bash
one --agent actions execute notion \
  conn_mod_def::GJ5EnL2xERY::ib0N5v41TveieFZQUV-vuQ \
  <NOTION_KEY> \
  --headers '{"Notion-Version":"2026-03-11"}' \
  --path-vars '{"dataSourceId":"<NOTION_TARGETS_DATA_SOURCE_ID>","data_source_id":"<NOTION_TARGETS_DATA_SOURCE_ID>"}' \
  -d '{"filter":{"property":"Active","checkbox":{"equals":true}},"page_size":1}'
```

Save:

- `results[0].id` as `<TARGETS_PAGE_ID>`
- `properties["Kcal"].number` as `current_kcal`
- `properties["Protein (g)"].number` as `current_protein`
- `properties["Fat (g)"].number` as `current_fat`
- `properties["Carbs (g)"].number` as `current_carbs`
- `properties["Pending Field"].rich_text[0].plain_text` as `pending_field` (may be empty/null)
- `properties["Pending Value"].number` as `pending_value` (may be null)

## Step 3: Determine the new target values

If **Apply**:

- If `pending_field` and `pending_value` are both set: use them. `field = pending_field` (e.g. `"Protein (g)"`), `new_value = pending_value`.
- If they are NOT set (no pending suggestion exists): reply *"No pending suggestion to apply. Send specific changes like 'raise protein to 140'."* Stop.

If **Decline**: skip to Step 4 with the decline confirmation. **Always clear the Pending fields** (Step 4b) so the next YES doesn't re-apply.

If **Specific instruction**: parse the field and value out of the reply. The field is the exact Notion column name.

| Pattern | Effect |
|---|---|
| `raise protein` / `more protein` / `up protein` | `field = "Protein (g)"`, value = `current_protein + 20` |
| `lower protein` / `less protein` | `field = "Protein (g)"`, value = `current_protein - 20` |
| `set protein to N` / `protein N` / `protein Ng` | `field = "Protein (g)"`, value = `N` |
| `raise kcal` / `more kcal` | `field = "Kcal"`, value = `current_kcal + 100` |
| `lower kcal` / `less kcal` / `cut kcal` | `field = "Kcal"`, value = `current_kcal - 100` |
| `set kcal to N` / `kcal N` | `field = "Kcal"`, value = `N` |
| Same patterns for `fat` / `carbs` (`field = "Fat (g)"` or `"Carbs (g)"`) | analogous |

If the parsed value is implausible — `kcal < 1200 or > 4500`, `protein < 40 or > 300`, `fat < 20 or > 200`, `carbs < 50 or > 600` — do **not** apply. Reply asking for confirmation with the specific number, e.g. *"Did you mean 140g protein? That's outside the usual range — confirm with the exact number."* Stop.

## Step 4: PATCH the active Targets row

Get the current UTC time:

```bash
date -u +%Y-%m-%dT%H:%M:%S.000Z
```

Save as `<NOW_UTC>`.

### 4a. For Apply or Specific instruction

PATCH the row with the new value AND clear the Pending fields:

```bash
one --agent actions execute notion \
  conn_mod_def::GJ5En6Rb6Bg::HBiyT8YHSkWyd8Wg5qHFCg \
  <NOTION_KEY> \
  --headers '{"Notion-Version":"2026-03-11"}' \
  --path-vars '{"pageId":"<TARGETS_PAGE_ID>","page_id":"<TARGETS_PAGE_ID>"}' \
  -d '{
    "properties": {
      "<field>":         { "number": <new_value> },
      "Pending Field":   { "rich_text": [] },
      "Pending Value":   { "number": null },
      "Pending Reason":  { "rich_text": [] },
      "Updated At":      { "date": { "start": "<NOW_UTC>" } }
    }
  }'
```

### 4b. For Decline

PATCH only the Pending fields to clear them. Do not touch the macro values.

```bash
one --agent actions execute notion \
  conn_mod_def::GJ5En6Rb6Bg::HBiyT8YHSkWyd8Wg5qHFCg \
  <NOTION_KEY> \
  --headers '{"Notion-Version":"2026-03-11"}' \
  --path-vars '{"pageId":"<TARGETS_PAGE_ID>","page_id":"<TARGETS_PAGE_ID>"}' \
  -d '{
    "properties": {
      "Pending Field":   { "rich_text": [] },
      "Pending Value":   { "number": null },
      "Pending Reason":  { "rich_text": [] },
      "Updated At":      { "date": { "start": "<NOW_UTC>" } }
    }
  }'
```

If any PATCH returns an error, reply: *"Couldn't update — Notion returned an error. Try again or update manually."* Stop.

## Step 5: Reply on Telegram

Pick ONE format based on what you did:

**Applied a suggestion or specific instruction (single field):**
```
Done. {field_short} target is now {new_value}{unit}. Live on the dashboard now.
```
Where `field_short` is `Protein` / `Kcal` / `Fat` / `Carbs` and `unit` is `g` for macros, empty for kcal.
Example: `Done. Protein target is now 142g. Live on the dashboard now.`

**Declined:**
```
Got it. Keeping current targets. Talk next Sunday.
```

**Asked for confirmation on an implausible value:**
```
Did you mean {parsed_value}{unit} for {field_short}? That's outside the usual range — confirm with the exact number.
```

Rules:

- Under 25 words
- No emoji
- Emit the message text as your final assistant response — the agent's Telegram channel adapter delivers it.

## Notes

- Never write to Meals from this skill — only to the Targets row.
- Always include `Updated At` in the PATCH so the dashboard can surface "last changed" if it ever wants to.
- The dashboard reads Targets fresh on every page load; no cache invalidation step is required from the skill side.
- If the user changes their mind on the same day, just run this skill again — it will update the same row.
- The `Active` checkbox on the row stays checked. We never deactivate or replace the row; we mutate it in place.
- The Pending fields are the durable bridge between weekly-recap and apply-targets — they survive across pod restarts and Telegram-session boundaries (which is why YES alone now works without conversation history).
