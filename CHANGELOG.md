# Changelog (fork-specific)

Tracks this fork's own changes on top of each upstream base. See `CLAUDE.md` for the versioning scheme
(this fork's own independent `MAJOR.MINOR.PATCH`, decoupled from upstream's version — see `upstreamVersion`
in `manifest.json`/`package.json`) and the upstream-sync process. Upstream's own changelog is not duplicated
here — see <https://github.com/obsidian-tasks-group/obsidian-tasks/releases>.

## 3.0.0 — upstream base `8.4.0`

Roadmap feature: **reminder field** — partly working: the field, storage, rendering and querying are all
in place (the "pill"), but this version does not yet *fire* anything on its own (see roadmap item 4, native
notification delivery, not started).

A distinct `⏰ HH:mm` signifier (paired with a task's due, scheduled or start date — whichever is present, in
that priority order):

- **Modal**: a "Reminder" field in the task edit modal (access key `K` — none of R/E/M/I/N/D, the letters in
  "reminder", were free). Accepts a clock time (`09:00`, `9am`) or a relative offset (`in 30 minutes`, `in 2
  hours`), with autocomplete suggesting the same presets/offsets as the rendered line's menu.
- **File format**: `⏰ 09:00` (emoji format) / `reminder:: 09:00` (Dataview format).
- **Rendered line**: shows as `⏰ 09:00`; click to open a time entry, right-click for a menu of configurable
  preset times and relative offsets (`Preset reminder times`, `Relative reminder offsets`, and a rounding
  increment — 15/30/60 min or "no rounding" — all settings-driven), plus a "Custom time…" prompt and "Remove
  reminder". A relative pick that crosses midnight shifts the task's anchor date (due, else scheduled, else
  start) forward too, not just the time; every way of setting a reminder guarantees an anchor date exists,
  creating today's `scheduledDate` if the task has none at all, since a reminder time is meaningless without
  a day to attach it to.
- **Recurrence and completion**: the reminder time is carried forward unchanged across both — this was the
  exact bug flagged against the stale prior-art PR referenced in `CLAUDE.md`'s roadmap.
- **Queries**: `has reminder` / `no reminder`, `reminder before|after|on HH:mm`, `sort by reminder`, `group
  by reminder`. A task's reminder also contributes to `happens` searches, though since a reminder always
  shares its anchor date's day, this doesn't change which *day* a `happens` search matches.
- **Autocomplete**: typing in the description offers a `⏰`/`reminder::` suggestion, alongside the other
  simple fields.

Along the way: dropped flatpickr entirely in favour of native Obsidian/browser primitives (this codebase had
no theming CSS for it), matched the modal's native date/time pickers to Obsidian's own styling, and fixed a
rounding regression so a relative offset always resolves to the same time everywhere it's typed or picked
(the modal field, the "Custom time…" prompt, and the menu's quick-picks alike).

Also investigated, and reverted: writing a full date under `⏰` (`⏰ YYYY-MM-DD HH:mm`) so the
[Reminder](https://github.com/uphy/obsidian-reminder) plugin's own "Tasks plugin format" reader would
recognise it — its reader ignores a bare `HH:mm` entirely. This surfaced a second, independent
incompatibility once Reminder's "Fall back to due, scheduled, or start date" setting is turned off (as its
own docs suggest for "only some tasks ring"): its validity check in that mode is hardcoded to require a
literal `📅` due date, regardless of `⏰`/`⏳`/`🛫`. There is no configuration of Reminder that supports "one
scheduled date per task, opt-in alarm on some of them", so `⏰` is back to a plain `HH:mm` and this fork will
build notification delivery natively instead (roadmap item 4) rather than target Reminder-plugin
compatibility. See `CLAUDE.md`'s roadmap item 1 for the full story.

## 2.0.0 — upstream base `8.4.0`

Roadmap feature: **postpone to next business day**.

- New setting, "Postpone to next business day" (off by default), under a new "Postponing" section in
  Tasks' settings tab — registered in both of `SettingsTab.ts`'s parallel settings UIs (see `CLAUDE.md`).
- When enabled, applies uniformly to the ⏩ postpone button and every item in its right-click menu (day,
  week and month increments, and the fixed "tomorrow" item): whenever the computed date would land on a
  Saturday or Sunday, it rolls forward to the following Monday instead. The fixed "today" item is
  deliberately exempt — it means "set to today", not a postponement, so it's never moved even if today
  itself is a weekend day.
- Day-based increments (the button and its "N days" menu items) count **business days**, not calendar days
  rolled off a weekend at the end: "by 1/2/3 days" for a task scheduled just before a weekend each land on
  their own distinct following business day, rather than all collapsing onto the same following Monday.
  Wording changes to match ("by N days" → "by N business days"; the fixed "tomorrow" item says "next
  business day" only when a weekend was actually skipped). Week/month increments are unchanged — they still
  just roll their single final result off a weekend.
- The general date-field right-click menu (e.g. quick-setting a Due/Scheduled/Start date directly, not via
  the postpone button) is unaffected — this setting only governs the postpone feature.

## 1.0.0 — upstream base `8.4.0`

Fork setup, no user-facing features yet:

- Renamed plugin id from `obsidian-tasks-plugin` to `upgraded-tasks` (`manifest.json`, `package.json`) so it
  can't be confused with, or conflict with, a real Tasks install.
- Pinned locale for urgency number formatting.
- Fixed a Windows path-separator failure in the `MockDataLoader` test.
- Adopted this fork's own independent versioning scheme, documented in `CLAUDE.md`.
