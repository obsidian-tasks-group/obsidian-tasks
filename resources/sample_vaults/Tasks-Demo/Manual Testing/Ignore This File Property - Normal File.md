---
---

# Manual Testing: TQ_ignore_this_file - Normal File (Control)

> [!Warning] Global Filter
> Before testing, make sure **no Global Filter** is set in Tasks settings (Settings → Tasks → Global Filter should be empty). A global filter can mask the behavior of `TQ_ignore_this_file` — making it look like it works when it doesn't, or vice versa.

## Purpose

This is the **control file** — it does NOT have `TQ_ignore_this_file: true`. Tasks here SHOULD behave normally with full Tasks plugin behavior.

Compare this side-by-side with [[Ignore This File Property]] which IS ignored.

## Test Checkboxes (SHOULD be treated as tasks)

- [ ] This checkbox SHOULD trigger autocomplete when you type after it
- [ ] This checkbox SHOULD get a done date when checked
- [x] This checkbox SHOULD have a done date added by Tasks

## Test: Autocomplete SHOULD appear

1. Place your cursor at the end of the following line, after the space
2. Type a date emoji or `📅` — autocomplete SHOULD appear

- [ ] Type here: 

## Test: Tasks query SHOULD find these

The following query searches for tasks in this file. It should return results:

```tasks
path includes Manual Testing/Ignore This File Property - Normal File
```

## Test: Live Preview checkbox toggle

1. Switch to **Live Preview** mode
2. Click the checkbox below
3. Tasks SHOULD add a done date and handle it normally

- [ ] Click me in Live Preview — Tasks should add done date
