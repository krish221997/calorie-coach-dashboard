---
name: weekly-recap
description: Once a week (Sunday 8 PM IST schedule), reads the last 7 days of meals from Notion plus the active Targets row, composes a coach letter, sends a short interactive message to the user on Telegram, sends a designed HTML recap to their email via Gmail, and writes any proposed change into the Targets row's Pending fields so the apply-targets skill can act on a YES reply.
---

# Weekly Recap

Read the last 7 days of meals from Notion, compose a Sunday coach letter, deliver via Telegram (short interactive) and Gmail (rich archival HTML). If a suggestion fires, persist it to the active Targets row's Pending fields so a later YES reply can apply it without needing conversation history.

## CRITICAL — FIRST OUTPUT RULE

The very first character you emit must be the first character of the Telegram message ("H" of "Hey"). Do not emit any preamble, plan, "I'll do X", "let me read Y", or any other words before the actual deliverable.

The user sees every word you write, in real time, on Telegram. There is no separate "thinking" channel. If you write *"I'll run the skill"* anywhere, the user reads that as a Telegram message, which is wrong.

Do your reading silently. Run tools silently. Compose the email silently. Write the pending suggestion silently. Only emit text when you're emitting the final Telegram message body.

## When this runs

This skill is invoked by the **Sunday 8 PM IST** schedule on the agent. There is no inbound user message; the data lives in Notion.

## Output discipline

- Send exactly one Telegram message and one email per run.
- Do not narrate ("Pulling the week now…", "Writing the email…").
- Do not send any other message besides the two final deliveries.
- Always write Pending fields to the active Targets row before sending Telegram (or clear them if no suggestion).

## Step 1: Read the last 7 days of meals from Notion

Find the Notion connection key:

```bash
one --agent connection list --search notion
```

Save the operational `key` as `<NOTION_KEY>`.

Query the Meals data source for the last week:

```bash
one --agent actions execute notion \
  conn_mod_def::GJ5EnL2xERY::ib0N5v41TveieFZQUV-vuQ \
  <NOTION_KEY> \
  --headers '{"Notion-Version":"2026-03-11"}' \
  --path-vars '{"dataSourceId":"<NOTION_MEALS_DATA_SOURCE_ID>","data_source_id":"<NOTION_MEALS_DATA_SOURCE_ID>"}' \
  -d '{
    "sorts": [{"property": "Timestamp", "direction": "descending"}],
    "page_size": 100,
    "filter": { "property": "Timestamp", "date": { "past_week": {} } }
  }'
```

For each row in `results[]`, extract: `Timestamp.date.start`, `kcal.number`, `Protein (g).number`, `Fat (g).number`, `Carbs (g).number`, `Meal Type.select.name`.

## Step 2: Read the active Targets row

```bash
one --agent actions execute notion \
  conn_mod_def::GJ5EnL2xERY::ib0N5v41TveieFZQUV-vuQ \
  <NOTION_KEY> \
  --headers '{"Notion-Version":"2026-03-11"}' \
  --path-vars '{"dataSourceId":"<NOTION_TARGETS_DATA_SOURCE_ID>","data_source_id":"<NOTION_TARGETS_DATA_SOURCE_ID>"}' \
  -d '{ "filter": { "property": "Active", "checkbox": { "equals": true } }, "page_size": 1 }'
```

Save: `target_kcal`, `target_protein`, `target_fat`, `target_carbs`, and the row's `id` as `<TARGETS_PAGE_ID>`. If no active row exists, fall back to defaults: `2200 kcal / 140g protein / 70g fat / 240g carbs` and skip Step 6 (no row to write Pending fields to).

## Step 3: Compute the analysis

Group meals by IST date (UTC + 5h30m). For the **last 7 IST days** ending today, compute per day:

- `total_kcal`, `total_protein`, `total_fat`, `total_carbs`, `meal_count`

Then compute across the week:

- `avg_kcal`, `avg_protein`, `avg_fat`, `avg_carbs` — mean across all 7 days (days with zero meals count as zero)
- `logged_days` — count of days where `meal_count > 0`
- `best_day` — day whose `total_kcal` is closest to `target_kcal` AND has at least one meal
- `worst_day` — day with the largest `|total_kcal − target_kcal|` deviation among logged days
- `protein_gap` = `target_protein − avg_protein` (positive = short)
- `kcal_gap` = `target_kcal − avg_kcal` (positive = short)

## Step 4: Pick a single suggestion (Strategy A — reactive)

Apply these rules **in order**. Stop at the first one that fires.

1. **Protein short by more than 25 g/day** → suggest raising the protein target by `min(20, round(protein_gap / 5) * 5)` grams (round to nearest 5). `suggestion_field = "Protein (g)"`.
2. **Avg kcal short of target by more than 300/day for a gain goal** OR **avg kcal exceeds target by more than 300 for a loss/maintain goal** → suggest adjusting the kcal target by 100 in the appropriate direction. `suggestion_field = "Kcal"`.
3. **Avg kcal within 10% of target** AND **at least 5 logged days** → no suggestion. `suggestion = null`.
4. **Fewer than 4 logged days** → no suggestion. Add a gentle consistency note. `suggestion = null`.

If a suggestion fires, capture:

- `suggestion_field` — exact Notion column name: `"Protein (g)"`, `"Kcal"`, `"Fat (g)"`, or `"Carbs (g)"`
- `suggestion_from` — current target value
- `suggestion_to` — proposed new value (integer)
- `suggestion_text` — one short sentence (e.g. `Raise protein floor 122g → 142g`)
- `suggestion_reason` — one short sentence explaining why

## Step 5: Write the Pending suggestion to the active Targets row

This makes the suggestion durable across Telegram sessions so a later YES reply can pick it up.

Get the current UTC time:

```bash
date -u +%Y-%m-%dT%H:%M:%S.000Z
```

Save as `<NOW_UTC>`.

**If a suggestion fires**, PATCH the active Targets row to set the three Pending fields:

```bash
one --agent actions execute notion \
  conn_mod_def::GJ5En6Rb6Bg::HBiyT8YHSkWyd8Wg5qHFCg \
  <NOTION_KEY> \
  --headers '{"Notion-Version":"2026-03-11"}' \
  --path-vars '{"pageId":"<TARGETS_PAGE_ID>","page_id":"<TARGETS_PAGE_ID>"}' \
  -d '{
    "properties": {
      "Pending Field":  { "rich_text": [ { "text": { "content": "<suggestion_field>" } } ] },
      "Pending Value":  { "number": <suggestion_to> },
      "Pending Reason": { "rich_text": [ { "text": { "content": "<suggestion_reason>" } } ] },
      "Updated At":     { "date": { "start": "<NOW_UTC>" } }
    }
  }'
```

**If no suggestion fires**, clear the Pending fields (so a stale YES doesn't apply last week's suggestion):

```bash
one --agent actions execute notion \
  conn_mod_def::GJ5En6Rb6Bg::HBiyT8YHSkWyd8Wg5qHFCg \
  <NOTION_KEY> \
  --headers '{"Notion-Version":"2026-03-11"}' \
  --path-vars '{"pageId":"<TARGETS_PAGE_ID>","page_id":"<TARGETS_PAGE_ID>"}' \
  -d '{
    "properties": {
      "Pending Field":  { "rich_text": [] },
      "Pending Value":  { "number": null },
      "Pending Reason": { "rich_text": [] },
      "Updated At":     { "date": { "start": "<NOW_UTC>" } }
    }
  }'
```

Do this **before** Step 6 so the Pending row is in place by the time the user replies YES.

## Step 6: Send the Gmail email

Find the Gmail connection key:

```bash
one --agent connection list --search gmail
```

Save the operational `key` as `<GMAIL_KEY>`. Save the connected account's email address (you can read it via the get-profile action if needed; the `to` field below uses it).

Search for the send action:

```bash
one --agent actions search gmail "send email"
```

Pick the action whose `path` is `/gmail/send-email`. Save its `actionId` as `<GMAIL_ACTION_ID>`.

**Build the HTML body using the `EMAIL_TEMPLATE` block below.** Substitute every `{{var}}` placeholder with the computed value. The template is intentionally compact (~40 lines, ~4KB rendered) — easy to compose silently and reliable across Gmail / Outlook / Apple Mail.

**Write the body and payload to /tmp** rather than inlining a 4KB JSON string:

```bash
cat > /tmp/recap-body.html <<'EOF'
<!doctype html>
... full rendered HTML from EMAIL_TEMPLATE with all {{var}} substituted ...
EOF
```

Then build the JSON payload using `jq` (which handles all the escaping):

```bash
jq -n --rawfile body /tmp/recap-body.html \
  --arg to "<connected_gmail_address>" \
  --arg subject "Your week, <start>-<end>" \
  --arg key "<GMAIL_KEY>" \
  '{connectionKey:$key, to:$to, subject:$subject, body:$body, isHtml:true}' \
  > /tmp/recap-payload.json
```

Send it:

```bash
one --agent actions execute gmail \
  <GMAIL_ACTION_ID> \
  <GMAIL_KEY> \
  -d "$(cat /tmp/recap-payload.json)"
```

A successful response includes `email.sent: true` and a `messageId`. If the response is anything else, retry once. If still failing, proceed to Step 7 anyway — the Telegram message is the primary delivery; the email is archival.

## Step 7: Send the Telegram message

The agent's Telegram channel adapter delivers your final assistant text back to the user automatically — just **emit the message text as your final response**. Do not call any external send tool. Do not use the `one` CLI for messaging.

If a suggestion fires:

```
Hey — week of {start}-{end}.

Avg {avg_kcal} kcal · {avg_protein}g protein
Best: {best_day_short} ({best_day_kcal})
Worst: {worst_day_short} ({worst_day_kcal})

Suggestion: {suggestion_text}.
{suggestion_reason}

Reply YES to apply, NO to keep current.
```

If no suggestion AND `logged_days >= 5`:

```
Hey — week of {start}-{end}.

Avg {avg_kcal} kcal · {avg_protein}g protein
Best: {best_day_short} ({best_day_kcal})

On track. No changes needed this week.
```

If no suggestion AND `logged_days < 4`:

```
Hey — week of {start}-{end}.

Logged only {logged_days} of 7 days. Consistency is the move — same time tomorrow?
```

Keep the message under 60 words. Do not include the email content in this message — keep them separate.

## Step 8: Stop

Do not send any further messages. The Telegram text, the email, and the Pending-fields write are the entire output of this skill.

---

## EMAIL_TEMPLATE

Substitute every `{{var}}` placeholder. Do not change the table/td/style structure.

```html
<!doctype html>
<html lang="en"><head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Your week · Calorie Coach</title>
</head>
<body style="margin:0;padding:0;background:#0E0E0D;font-family:Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
<center style="width:100%;background:#0E0E0D;padding:40px 16px;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="560" style="max-width:560px;background:#141413;border:1px solid rgba(255,255,255,0.08);border-radius:6px;overflow:hidden;">
  <tr><td style="padding:24px 28px;border-bottom:1px solid rgba(255,255,255,0.06);">
    <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#4FA86B;box-shadow:0 0 8px #4FA86B;vertical-align:middle;"></span>
    <span style="font-family:Menlo,Consolas,monospace;font-size:11px;color:#8a8a85;letter-spacing:0.18em;text-transform:uppercase;margin-left:10px;vertical-align:middle;">CALORIE COACH · WEEKLY RECAP</span>
  </td></tr>
  <tr><td style="padding:32px 28px 8px;">
    <div style="font-family:Georgia,'Times New Roman',serif;font-size:34px;line-height:1.05;letter-spacing:-0.01em;color:#FAFAF7;">
      Your week,<br/><em style="color:#8a8a85;font-style:italic;">{{start}} — {{end}}.</em>
    </div>
  </td></tr>
  <tr><td style="padding:28px 28px 8px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
      <td width="50%" style="vertical-align:top;border-top:1px solid rgba(255,255,255,0.08);padding:16px 12px 16px 0;">
        <div style="font-family:Menlo,Consolas,monospace;font-size:9px;color:#5A5957;letter-spacing:0.2em;text-transform:uppercase;">[01] AVG · KCAL/DAY</div>
        <div style="font-family:Georgia,serif;font-size:38px;color:#FAFAF7;margin-top:6px;letter-spacing:-0.02em;">{{avg_kcal}}</div>
        <div style="font-family:Menlo,Consolas,monospace;font-size:11px;color:{{kcal_delta_color}};margin-top:4px;">{{kcal_delta_text}}</div>
      </td>
      <td width="50%" style="vertical-align:top;border-top:1px solid rgba(255,255,255,0.08);padding:16px 0 16px 12px;border-left:1px solid rgba(255,255,255,0.08);">
        <div style="font-family:Menlo,Consolas,monospace;font-size:9px;color:#5A5957;letter-spacing:0.2em;text-transform:uppercase;">[02] AVG · PROTEIN</div>
        <div style="font-family:Georgia,serif;font-size:38px;color:#FAFAF7;margin-top:6px;letter-spacing:-0.02em;">{{avg_protein}}<span style="font-family:Menlo,Consolas,monospace;font-size:13px;color:#8a8a85;margin-left:4px;">g</span></div>
        <div style="font-family:Menlo,Consolas,monospace;font-size:11px;color:{{protein_delta_color}};margin-top:4px;">{{protein_delta_text}}</div>
      </td>
    </tr></table>
  </td></tr>
  <tr><td style="padding:8px 28px 24px;">
    <div style="font-family:Menlo,Consolas,monospace;font-size:9px;color:#5A5957;letter-spacing:0.2em;text-transform:uppercase;margin:14px 0 10px;">[03] COACH NOTE</div>
    <div style="font-family:Georgia,serif;font-size:17px;line-height:1.55;color:#FAFAF7;">{{coach_note_html}}</div>
  </td></tr>
  <tr><td style="padding:0 28px 24px;">
    {{suggestion_card_html}}
  </td></tr>
  <tr><td align="center" style="padding:0 28px 28px;">
    <a href="https://calorie-coach-dashboard.vercel.app" style="display:inline-block;padding:11px 22px;font-family:Menlo,Consolas,monospace;font-size:11px;color:#F3C747;text-decoration:none;letter-spacing:0.2em;text-transform:uppercase;border:1px solid #F3C747;border-radius:3px;">OPEN MISSION CONTROL →</a>
  </td></tr>
  <tr><td style="padding:16px 28px 20px;border-top:1px solid rgba(255,255,255,0.06);font-family:Menlo,Consolas,monospace;font-size:9px;color:#5A5957;letter-spacing:0.2em;">CALORIE COACH · MMXXVI</td></tr>
</table>
</center>
</body></html>
```

**Variable reference:**

| Variable | How to compute |
|---|---|
| `{{start}}`, `{{end}}` | First and last day of the 7-day window, e.g. `22 Apr`, `28 Apr` |
| `{{avg_kcal}}` | Rounded integer with thousands separator (e.g. `2,120`) |
| `{{avg_protein}}` | Rounded integer (no unit; `g` is added by template) |
| `{{kcal_delta_color}}` | `#4FA86B` if `avg_kcal >= target_kcal`, else `#CD5247` |
| `{{kcal_delta_text}}` | `▼ {kcal_gap} short of target` if short, `▲ on target` otherwise |
| `{{protein_delta_color}}` | `#CD5247` if `avg_protein < target_protein`, `#4FA86B` otherwise |
| `{{protein_delta_text}}` | `▼ {protein_gap}g short of {target_protein}g` or `▲ on target` |
| `{{coach_note_html}}` | 1-2 sentence narrative naming `best_day` and `worst_day`. Wrap key numbers in colored spans: green `<span style="color:#4FA86B;">…</span>`, red `<span style="color:#CD5247;">…</span>`, yellow `<span style="color:#F3C747;">…</span>` |
| `{{suggestion_card_html}}` | If a suggestion fires, render the YELLOW SUGGESTION CARD below. Otherwise render the GREEN NO-CHANGE CARD. |
| (dashboard URL) | Hardcoded to `https://calorie-coach-dashboard.vercel.app` directly in the template's `<a href>` — no substitution needed. |

**YELLOW SUGGESTION CARD** (when a suggestion fires):

```html
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid rgba(243,199,71,0.35);background:rgba(243,199,71,0.05);border-radius:4px;">
  <tr><td style="padding:18px 20px;">
    <div style="font-family:Menlo,Consolas,monospace;font-size:9px;color:#F3C747;letter-spacing:0.2em;text-transform:uppercase;">SUGGESTION · NEXT WEEK</div>
    <div style="font-family:Georgia,serif;font-size:22px;line-height:1.25;color:#FAFAF7;margin-top:8px;">{{suggestion_text_html}}</div>
    <div style="font-family:Menlo,Consolas,monospace;font-size:11px;color:#8a8a85;margin-top:6px;line-height:1.5;">{{suggestion_reason}} Reply <span style="color:#F3C747;">YES</span> on Telegram to apply — or <span style="color:#FAFAF7;">NO</span> to keep current targets.</div>
  </td></tr>
</table>
```

For `{{suggestion_text_html}}`, wrap the new value in yellow, e.g.:
`Raise protein floor <span style="color:#F3C747;">122g → 142g</span>`

**GREEN NO-CHANGE CARD** (when no suggestion):

```html
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid rgba(79,168,107,0.3);background:rgba(79,168,107,0.05);border-radius:4px;">
  <tr><td style="padding:18px 20px;">
    <div style="font-family:Menlo,Consolas,monospace;font-size:9px;color:#4FA86B;letter-spacing:0.2em;text-transform:uppercase;">NOMINAL · NO CHANGES</div>
    <div style="font-family:Georgia,serif;font-size:20px;line-height:1.25;color:#FAFAF7;margin-top:8px;">On track this week. Targets unchanged.</div>
  </td></tr>
</table>
```
