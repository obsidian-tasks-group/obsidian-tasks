# Changelog (fork-specific)

Tracks this fork's own changes on top of each upstream base. See `CLAUDE.md` for the versioning scheme
(this fork's own independent `MAJOR.MINOR.PATCH`, decoupled from upstream's version — see `upstreamVersion`
in `manifest.json`/`package.json`) and the upstream-sync process. Upstream's own changelog is not duplicated
here — see <https://github.com/obsidian-tasks-group/obsidian-tasks/releases>.

## 4.3.0 — upstream base `8.4.0`

**Schedule popover, Notifications view options, and a datalist text fix.** MINOR: three small additive UI
improvements, none of them a roadmap milestone or an on-disk syntax change.

- Replaced `ScheduleDialog` (an Obsidian `Modal` - centred, dimmed background, focus-trapped) with the new
  `SchedulePopover` (`src/ui/Menus/SchedulePopover.ts`): the same Schedule form, positioned next to whatever
  pill/menu-item opened it instead, with no backdrop and no focus trap - much closer to the Scheduled Date
  pill's own flatpickr popover. Closing via Escape/Cancel discards; closing via Apply or a click outside
  applies whatever was pending (if valid), the same auto-apply-on-close behaviour the flatpickr calendar
  already had. All four opening points (the Reminder Time pill, the Scheduled Date picker's "Add a
  reminder…" button, the Scheduled Date right-click menu's "Add a reminder…" item, and the new Notifications
  view pill below) now go through this popover; `DateMenu`/`promptForDate` no longer need an `app` parameter
  as a result.
- Reminder Notifications view (`src/ui/NotificationsView.svelte`): each row now has a right-click context
  menu (the same `ReminderMenu` quick-pick the rendered reminder pill offers) and an alarm-clock pill that
  opens the `SchedulePopover` - previously the view had no interactivity beyond left-click-to-open-task.
- Fixed the Schedule field's native `<datalist>` autocomplete showing a confusing two-column row for each
  relative-offset suggestion (e.g. "In 30 minutes" next to "In 17 minutes (11:30)" - a browser shows an
  `<option>`'s `value` and its child text as separate columns whenever they differ). The second column now
  reads as a continuation of the first instead of a second restatement, e.g. "in 30 minutes  (rounded to
  11:30, in 17 minutes)". New `ReminderSuggestion.datalistHint` field (`src/DateTime/ReminderSuggestions.ts`)
  carries this text; `ReminderMenu`'s own standalone menu-item labels are unaffected.
- Fixed the Notifications view's per-task time (e.g. "in 31 minutes") sometimes reading a minute short of
  what a clock actually promises - same root cause as the reminder-suggestion label fix in `4.2.0`: diffing
  against the exact current instant (seconds included) rather than "now" floored to the whole minute. A
  reminder at 13:00 checked at 12:28:35 used to read "in 31 minutes" (31.4, rounded down) instead of the 32
  a clock reading "28" to "60" promises. `NotificationsView.svelte` now computes it via
  `task.reminderDateTime.from(window.moment().startOf('minute'))` instead of the plain `.fromNow()`.
- Capped the Notifications view's width (`max-width: 40em`, centred) instead of stretching full-width - each
  row lays its description and time/pill out with space between them, so on a very wide pane/window they
  used to spread uncomfortably far apart; blank space on the sides now instead.
- The task text in that same view now wraps across lines instead of being truncated with an ellipsis, so a
  long description is fully readable rather than cut off.

## 4.2.0 — upstream base `8.4.0`

**Reminder-suggestion label improvements**, on top of `4.1.0`'s exact-time labels. MINOR, not PATCH: the
hours phrasing below is a small additive display feature, not purely a bug fix.

- An exact time of 60+ minutes is now phrased in hours (e.g. "In 1 hour 23 minutes (11:30)", not
  "In 83 minutes (11:30)") rather than as a large, harder-to-read minute count.
- Fixed the exact-time computation itself undercounting by a minute whenever "now" had already ticked a few
  seconds into its current minute (e.g. at 19:23:45, a target rounded to 19:30:00 used to read "In 6 minutes"
  instead of the "In 7 minutes" a clock reading "23" to "30" actually promises) - "now" is floored to the
  minute before diffing against the already second-aligned rounded target.

## 4.1.0 — upstream base `8.4.0`

**Configurable rounding mode for reminder suggestions, and exact-time labels.** The relative-offset quick
options (right-click `ReminderMenu`, and the Schedule field's own autocomplete) always rounded a suggestion
*up* to the configured increment - now configurable via a new `reminderRoundingMode` setting (`floor`/
`round`/`ceil`, default `ceil` to match the previous behaviour exactly).

- `src/DateTime/ReminderTimeParser.ts`: `roundUpToIncrement` renamed to `roundToIncrement` and given a
  `RoundingMode` parameter (`'floor' | 'round' | 'ceil'`). `'round'` ties round forward, matching `'ceil'`.
- `src/Config/Settings.ts`/`SettingsTab.ts`: new `reminderRoundingMode` setting, in both the declarative and
  imperative settings UIs (see `CLAUDE.md`'s note on why both need updating for every setting).
- A relative-offset suggestion's label now states the *exact* time remaining until the rounded target, not
  the nominal configured duration - e.g. a configured "in 30 minutes" that rounds forward to a clean 19:00
  now reads "In 53 minutes (19:00)", not "In 30 minutes (19:00)" - so the label is always literally true
  rather than an approximation that needed a "~" to flag it (removed). The suggestion's underlying value
  (what actually gets typed/applied) is unaffected - still the nominal configured duration, so re-parsing it
  later resolves fresh from whatever "now" is by then.
- `src/DateTime/ReminderSuggestions.ts`: a suggestion is now never rounded to a time at or before "now" -
  `'floor'`/`'round'` can otherwise land there (unlike `'ceil'`, which never can), which would have quietly
  suggested an already-past reminder.
- Deleted `src/ui/ReminderEditor.svelte` (and its tests) - dead code since `4.0.0` replaced it with
  `ScheduleEditor.svelte` in the edit modal; nothing else referenced it.

## 4.0.0 — upstream base `8.4.0`

**Unified "Schedule" field, replacing separate Scheduled date / Reminder time editing.** MAJOR, not MINOR,
because of the anchor-behavior change below: a task whose reminder was working via a due/start-date anchor
will silently stop firing after this upgrade until fixed (via the new error pill) - not an on-disk syntax
break, but the same "a broken vault is a much bigger deal than any UI change" reasoning the syntax-break
exception exists for. The edit modal's
"Scheduled date" and "Reminder time" text fields accepted the same free-text parsing but with inconsistent
results (a duration-with-time phrase like "in 1 day 19 hours" silently overwrote the scheduled date when
typed into the reminder field, but silently dropped its own time component when typed into the scheduled
field). Replaced with one field, "Schedule": typing something with an explicit time-of-day (`chrono`
certain about `hour`/`minute`) updates both the scheduled date and the reminder time; a date-only phrase
("tomorrow", "in a week") updates only the date, leaving any existing reminder completely untouched. A bare
clock time with no date wording ("16:00") never moves an existing scheduled date - only when there is none
does it derive one (today if the time is still to come, else tomorrow).

- `src/DateTime/ScheduleParser.ts` (new): `resolveTypedSchedule()` - the parser above, including workarounds
  for two chrono-node quirks (week-based durations don't mark `day` certain; `noon`/`midnight` don't mark
  `hour`/`minute` certain, in opposite ways for `isCertain('day')`, so both are forced to behave as bare
  clock times explicitly).
- **Reminders now anchor to `Task.scheduledDate` only, everywhere** - not due or start any more.
  `Task.reminderDateTime`, and `SetReminderTime`/`SetReminderDateTime`
  (`src/ui/EditInstructions/ReminderInstructions.ts`) no longer consult `Postponer.getDateFieldToPostpone`'s
  due>scheduled>start priority (that function is untouched and still used solely by the unrelated Postpone
  feature). A reminder that ends up with no scheduled date to anchor to (from emptying the Schedule text
  without clicking a Remove button, or a pre-existing due/start-anchored reminder from before this change)
  is not auto-fixed - it renders as a visibly broken "error pill" in the rendered view
  (`.tasks-reminder-orphaned`, `TaskLineRenderer.ts`), which doubles as the migration path for any such
  pre-existing reminders: click it to add a scheduled date or remove the reminder.
- `src/ui/EditInstructions/ScheduleInstructions.ts` (new): `SetSchedule` (sets both fields from an
  already-resolved pair) and `RemoveScheduledDateAndReminder` (composes `RemoveTaskDate`/`RemoveReminderTime`
  - removing the scheduled date also removes the reminder, since one is meaningless without the other).
- `src/ui/ScheduleEditor.svelte` (new): the shared text input + native date/time pickers + "Remove scheduled
  date"/"Remove reminder" buttons, used both embedded in the edit modal (`EditTask.svelte`, access key
  `Alt+S`, replacing the old separate `DateEditor`/`ReminderEditor` instances there) and inside the new
  standalone `src/ui/Menus/ScheduleDialog.ts` popup (explicit Apply/Cancel, since typed text can be
  transiently invalid mid-edit).
- Rendered-view entry points: left-clicking an existing Reminder Time pill now opens `ScheduleDialog`
  (previously the same quick-pick menu as right-click); right-clicking it still shows that quick-pick menu,
  minus the "Custom time…" item it used to have (`ReminderPromptModal.ts` is retired - `ScheduleDialog`
  replaces its role). The Scheduled Date field's picker/menu gained an "Add a reminder…" entry (hidden once
  a reminder already exists, since the Reminder Time pill itself becomes the edit affordance at that point).

## 3.4.0 — upstream base `8.4.0`

Roadmap feature: **startup summary for missed reminders** - the "N reminders came due while you were away"
want logged (but not built) alongside `3.1.0`'s Phase 1.

- `src/Notifications/ReminderNotifier.ts`: `notifyMissedReminders(tasks, onClick?)` - same combined,
  persistent, clickable single-notification shape as `notifyRemindersDue`, with "N reminders came due while
  you were away" wording instead of "N reminders due" (misleading here, since these didn't just become due -
  `notifyRemindersDue`/`buildReminderNotificationContent` both gained an optional title-override parameter
  to share the delivery logic rather than duplicate it).
- `src/main.ts`'s new `checkForMissedRemindersOnStartup()`: fires once, for anything already overdue (via
  `NotificationBuckets.groupTasksByBucket(...).overdue`) at the exact instant `ReminderCheckLoop` is
  constructed - the same `startupMoment` is passed to both, so they partition time with no gap and no
  overlap between "reported as missed" and "fired individually from here on". Waits for the task cache's
  first `Warm` state before checking (via `TasksEvents.triggerRequestCacheUpdate` for the case where it's
  already warm - e.g. reloading the plugin while Obsidian is already running - falling back to a one-time
  `onCacheUpdate` wait otherwise, for a fresh launch where indexing is still in progress), so a vault that
  takes a moment to index doesn't get checked against an empty task list.

## 3.3.1 — upstream base `8.4.0`

Two bug fixes.

- `src/DateTime/ReminderTimeParser.ts`: `relativeDurationPattern` only recognised a numeral quantifier
  ('3 days'), silently misclassifying chrono-understood word-quantified durations ('a week', 'an hour') and
  ones with a trailing clock-time clause ('in a week at 5pm') as an absolute clock time instead - which,
  in the edit modal's save path (`EditableTask.applyEdits`), only sets `reminderTime` and never shifts the
  anchor date. Extended the pattern to accept `a`/`an` as equivalent to `1`, and an optional trailing
  `at <time>` clause (leaving validation of whatever follows `at` to chrono itself).
- `src/Obsidian/NotificationsItemView.ts`: the view only refreshed on `TasksEvents.onCacheUpdate` (an
  actual file edit) - but which bucket a task falls into, and its displayed relative time ("in 2 minutes"),
  is a function of the current moment, which moves forward with no file ever changing. A task showing "in 2
  minutes" would keep reading exactly that, unmoved, until something unrelated happened to touch any task's
  file. Added the view's own 30-second `registerInterval` refresh, independent of file changes.

## 3.3.0 — upstream base `8.4.0`

Redesign of the `3.2.0` notifications view, after feedback: four live-computed groups (Overdue, Today,
This week, Later) replace the previous "Upcoming"/"History" split.

- `src/Notifications/NotificationBuckets.ts`: `groupTasksByBucket` (pure, tested) groups every
  non-completed task with a resolvable `reminderDateTime` into the four buckets, sorted soonest-first
  within each. "Overdue" is "reminder instant has passed" (not day-granular), which is what lets it double
  as `3.2.0`'s removed history log: since `reminderTime` is never cleared automatically, a fired reminder
  (or one missed entirely because Obsidian was closed when it came due) simply keeps showing there until
  the task is completed or its reminder changes.
- Removed: the persisted `notificationHistory` setting, `src/Notifications/NotificationHistory.ts`, and the
  "record history" step in `main.ts`'s check loop - all superseded by the live "Overdue" bucket. See
  `CLAUDE.md`'s roadmap item 4 for the fuller story of why this didn't need to stay around as a separate
  concept.
- Every row in every bucket is clickable (not just "Upcoming" before) - all four groups are live tasks now,
  so `openTaskAtSourceLocation` applies uniformly.

## 3.2.0 — upstream base `8.4.0`

Roadmap feature: **notifications view** — an in-Obsidian page listing upcoming and past-fired reminders,
opened from a ribbon icon, a command, or by clicking a due notification. First `ItemView` (dedicated
workspace pane) in this codebase; everything else so far has been code-block renderers and `Modal`s.

- `src/Obsidian/NotificationsItemView.ts` + `src/ui/NotificationsView.svelte`: two sections. "Upcoming" is
  live - computed from current tasks' `reminderDateTime`, kept fresh via `TasksEvents.onCacheUpdate`
  (`$set`, not a destroy/remount, so the tab doesn't flicker while it happens to be open in the background)
  - and clicking a row opens that task (reusing `QuickSearchTasksModal.ts`'s `openTaskAtSourceLocation`,
    which re-resolves the file+line by content match rather than a stale line number). "History" is
  read-only, from a new persisted log (see below) - deliberately not clickable, since a task may have moved
  or been deleted by the time old history is reviewed, unlike a still-live "Upcoming" task. A "Clear
  history" button empties it.
- New persisted state, `notificationHistory` (`src/Config/Settings.ts`, alongside `dismissedNotices` -
  internal app state, not a user preference, so no `SettingsTab.ts` entry, matching that field's own
  precedent). `src/Notifications/NotificationHistory.ts`'s `appendHistoryEntries` is a pure function (one
  entry per task, not per batch; pruned to the most recent 500) recording each fired reminder's
  description, source path, and fired time (as an ISO string - a `Moment` doesn't survive the settings
  file's JSON round-trip).
- `notifyRemindersDue` (`src/Notifications/ReminderNotifier.ts`) now takes an optional click callback,
  wired on both delivery channels - the native `Notification`'s `.onclick`, and a newly-clickable `Notice`
  fragment (built with `createEl`/`createDiv`, not raw `document.createElement`, so it stays testable - see
  `tests/jest.setup.ts`'s mimics, extended this release to also support `createEl`'s `text` option, which
  they were previously missing). Clicking either focuses the Obsidian window (`window.focus()`) and opens
  the notifications view - `revealLeaf` alone only changes the active tab *inside* the app, so both are
  needed for a notification click to actually surface the app.

## 3.1.0 — upstream base `8.4.0`

Roadmap feature: **native notification delivery, Phase 1 (foreground/desktop; not yet tested on mobile)**.
Fires a notification for a task whose reminder has come due, without depending on the separate Reminder
plugin.

- New settings, "Notifications" section: "Enable reminder notifications" (off by default) and "Check every
  (seconds)" (default 60, needs a plugin reload to change - a "Reload" button appears when it's edited).
- `src/Notifications/NotificationScheduler.ts`: `findDueReminders` is a pure half-open sliding-window check
  `(windowStart, windowEnd]` over `Task.reminderDateTime`, excluding completed/cancelled tasks;
  `ReminderCheckLoop` drives it once per check via a single `registerInterval` in `main.ts`. The window
  itself is the entire dedup mechanism - no persisted "already fired" state, and no risk of double-firing
  across ticks, recurrence, or a mid-flight edit to the reminder time.
- `src/Notifications/ReminderNotifier.ts::notifyRemindersDue`: **one combined notification per check**,
  never one per task - several reminders landing in the same window surface as a single alert listing all
  of them, not a burst. Delivers via the renderer's global `Notification` API on desktop (which Electron
  implements natively - no `electron` package import needed, no permission prompt), giving a real OS-level
  notification, not just an in-app toast; falls back to `Notice` on mobile or wherever `Notification` isn't
  available. Both channels are **persistent** - the native one via `requireInteraction: true`, the `Notice`
  via duration `0` - staying visible until the user dismisses them rather than auto-disappearing. Never
  writes back to any task or its file - firing a notification cannot mutate vault content.
- **Known, accepted limitation**: a reminder that comes due while Obsidian is fully closed is not fired
  retroactively on reopen - this phase is honestly foreground/session-scoped. True "fires even while
  closed" delivery needs an external push relay (ntfy.sh, mirroring the separate Reminder plugin's own
  approach) and is planned as Phase 2 - see `CLAUDE.md`'s roadmap item 4 for the sketch, not built yet.
  Also logged there, also not built yet: a separate minor version adding an in-Obsidian view listing
  upcoming and past-fired reminders, opened by clicking the OS notification.

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
