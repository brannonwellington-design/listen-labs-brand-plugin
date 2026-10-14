# Coding: one row per respondent, every code backed by their own words

A scene puts real people on screen, so it needs each respondent's own answer, not just the report's totals. The report
gives totals; the coding gives people. The coding never gets tuned to match the report. The difference is reconciled
and printed on the page.

Everything lives in `scenes/<slug>/` in the working folder, kept out of git (see the path convention in `SKILL.md`).

## 1. Find who to code

Page through `get_study_responses` with `question_numbers` set to one early closed question, 50 at a time, and collect
the `readable_id` of every response with `is_complete: true`. Also collect partial responses that reached the
questions the scene depends on, and mark them partial.

The tool's question numbers can differ from the study guide, and the offset varies within one study (screener items,
consent, branches). Always match questions by their text. Interviewers also reword questions, so match on the gist and
check a few transcripts by eye before trusting a text match.

## 2. Write two files

**`codebook.md`**, for the coders. Copy each dimension's definition from the report's own wording. For each one, give:
- the question text it comes from, and which other questions (if any) it may draw on: coders must not take an answer
  from a later question unless the codebook says so
- its allowed values, plus `none` for "never asked"
- which values may rest on absence (no quote)

List the closed answers to copy as they are, with the source link of the answer (segment questions, ratings,
demographics). Include the evidence rules and the output format below.

**`codebook.json`**, for the validator (`tools/coding/check.mjs`). It holds:
- `exclusive` and `multi` dimensions, with the values or keys allowed to rest on absence
- `closed` keys and checks
- `report`: one reconciliation row per number the report states: `{ label, count: <filter>, base: <filter>, report: [count, base] }`

The filter language is documented at the top of `check.mjs`.

## 3. Code in parallel

Split respondents into batches of about 18. Start one subagent per batch, all in a single message, with this prompt:

> Read the codebook first and follow it exactly: `<abs path>/codebook.md`. Your respondents (readable_ids) in study
> `<id>`: … Use `get_study_responses` (load it via ToolSearch if deferred) with `readable_ids`, a few at a time, without
> `question_numbers`, so you see full transcripts. Quotes must be copied verbatim from the respondent's answers with
> their exact [Source] URL from the tool output: never paraphrase, never invent a link. Save each fetched transcript to
> `<abs path>/codes/transcripts/<readable_id>.txt` and check every quote with a script against the answer its source
> link points to. Write a JSON array to `<abs path>/codes/batch<X>.json`, validate that it parses, and reply with only
> the count coded and any you could not code. No quotes in your reply.

## 4. Validate, then verify every quote

- `node "$A/tools/coding/check.mjs" scenes/<slug>` checks structure and evidence links, then prints the reconciliation. It
  writes `codes/merged.json` only when there are no problems.
- Any quote a coder checked by eye rather than by script goes to a verifier subagent. It confirms each quote appears
  verbatim in the answer its link points to, fixes the **batch file** (never `merged.json`, which is rebuilt), and
  removes evidence it cannot find.
- Re-run the validator after any fix.

## Evidence rules (put these in every codebook)

- Every coded value and every multi-mention `true` carries ONE verbatim quote from THIS respondent, plus its exact
  `[Source]` URL (`https://listenlabs.ai/response/<uuid>?message=<n>#a-<n>`).
- Never edit a quote, never reuse a link for a different quote, never quote the interviewer.
- Values that can rest on absence (`neutral`, `mixed`, `none`, `unsure`) may have `evidence: null` plus a `note`.
- Keep quotes to one to three sentences. Prefer quotes that name no employer, client or private person.
- Record `is_complete` exactly as the tool reports it.

Output, one object per respondent:

```json
{ "readable_id": 7, "response_uuid": "…", "is_complete": true,
  "closed": { "<key>": "<answer>" },
  "codes": { "<exclusive dim>": "<value>", "<multi dim>": { "<key>": true } },
  "evidence": { "<dim>": { "quote": "…", "source": "…" }, "<multi dim>.<key>": { "quote": "…", "source": "…" } },
  "notes": "optional" }
```
