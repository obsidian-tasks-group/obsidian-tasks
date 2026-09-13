# Changelog (fork-specific)

Tracks this fork's own changes on top of each upstream base. See `CLAUDE.md` for the versioning scheme
(this fork's own independent `MAJOR.MINOR.PATCH`, decoupled from upstream's version — see `upstreamVersion`
in `manifest.json`/`package.json`) and the upstream-sync process. Upstream's own changelog is not duplicated
here — see <https://github.com/obsidian-tasks-group/obsidian-tasks/releases>.

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
