---
TP_ignore_this_file: true
---

# Manual Testing: TP_ignore_this_file

> [!Warning] Global Filter
> Before testing, make sure **no Global Filter** is set in Tasks settings (Settings → Tasks → Global Filter should be empty). A global filter can mask the behavior of `TP_ignore_this_file` — making it look like it works when it doesn't, or vice versa.

## What this tests

The `TP_ignore_this_file` frontmatter property tells Tasks to completely ignore this file:

1. Checkboxes are NOT treated as tasks (no autocomplete, no done dates, no recurrence)
2. Tasks in this file do NOT appear in `tasks` query results
3. Clicking a checkbox in Live Preview does a plain toggle (no Tasks behavior)

## Test Checkboxes (should be plain, NOT tasks)

- [ ] This checkbox should NOT trigger autocomplete when you type after it
- [ ] This checkbox should NOT get a done date when checked
- [x] This checkbox should have been toggled without Tasks adding a done date

## Test: Autocomplete should NOT appear

1. Place your cursor at the end of the following line, after the space
2. Type a date emoji or `📅` — autocomplete should NOT appear

- [ ] Type here: 

## Test: Tasks query should NOT find these

The following query searches for tasks in this file. It should return **zero results**:

```tasks
path includes Manual Testing/Ignore This File Property
```

## Test: Live Preview checkbox toggle

1. Switch to **Live Preview** mode
2. Click the checkbox below
3. It should toggle plainly — no done date, no recurrence copy

- [ ] Click me in Live Preview — should just check/uncheck, nothing fancy

## Test: Compare with a normal file

Open [[Ignore This File Property - Normal File]] side by side. That file does NOT have `TP_ignore_this_file: true`, so tasks there SHOULD have full Tasks behavior.
