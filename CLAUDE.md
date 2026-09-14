# upgraded-tasks

Personal fork of [obsidian-tasks-group/obsidian-tasks](https://github.com/obsidian-tasks-group/obsidian-tasks),
developed to add features the upstream maintainers won't take on. This folder lives directly inside the
test vault's plugin directory (`.obsidian/plugins/upgraded-tasks`), so a build in place is a build that's live.

- Fork: <https://github.com/barthelemy-simon/upgraded-tasks>
- `origin` = this fork, `upstream` = obsidian-tasks-group/obsidian-tasks (added so upstream changes can be
  pulled/rebased in later).
- Plugin id was changed from `obsidian-tasks-plugin` to `upgraded-tasks` (see `manifest.json`) so it can't be
  confused with, or conflict with, a real Tasks install. It's enabled in this vault's
  `.obsidian/community-plugins.json` under that id.
- Test vault: `Test Task upgraded` (the folder two levels up from here).
- **`src/Config/SettingsTab.ts` has two parallel settings UIs that must both be updated for every setting**:
  `getSettingDefinitions()` (declarative, Obsidian 1.13.0+ — what virtually every real install actually
  renders) and `display()` (imperative, only used as a fallback on very old Obsidian). It's easy to edit only
  `display()`, see it build/lint/test cleanly, and still have the setting be completely invisible in a normal
  install — there's no error, the setting simply never renders. Always add/change the same setting in both
  places (there's a doc comment on the `SettingsTab` class saying so).

## Staying in sync with upstream

**Being able to pull in upstream releases is a priority for this fork, not an afterthought.** The whole
point of forking rather than writing a standalone plugin is to keep getting obsidian-tasks' upstream bug
fixes and new features for free, and to only carry the small set of fork-specific additions (reminder field,
postpone button, tabular view) on top of that. If a sync ever becomes too painful to do because the fork has
drifted too far from upstream, that's a signal to shrink the fork's footprint (push logic upstream, or make
the local change smaller/more isolated), not a reason to stop syncing.

**How a sync actually happens:**

```bash
git fetch upstream
git merge upstream/main        # merge, not rebase
```

- **Merge, don't rebase.** `main`'s history here is already merge-commit-based (PRs from `origin` are
  merged in, not squashed or rebased — see the commit log), so merging upstream in keeps that consistent and
  never rewrites commits already pushed to `origin`. (This is the same reasoning behind not rebasing the
  stale PR #2750 referenced below — rebasing history that's already shared is the wrong tool here.)
- **A merge takes everything from upstream and only forces a decision on what actually conflicts.** Any file
  upstream touched that this fork hasn't will merge cleanly with no action needed. Conflicts only come up on
  the files this fork has modified — expect them mainly in:
  - `manifest.json` / `package.json` — `id`, `name`, `author*`, `fundingUrl`, `helpUrl`, `description`,
    `version` and `upstreamVersion` are fork-specific and always win over upstream's values on conflict; take
    upstream's side for everything else in those files (e.g. a `minAppVersion` bump, dependency version
    bumps).
  - Whichever files the roadmap features below end up touching (`TaskLineRenderer.ts`, `Task.ts`,
    `EditTask.svelte`, `Recurrence.ts`, etc.) — resolve by combining both sides' logic, never by picking one
    side wholesale.
  - This `CLAUDE.md`.
- **Never resolve a conflict by discarding a fork-specific change.** If making a conflict go away would mean
  losing an already-implemented fork feature, that means the merge needs manual reconciliation of both sides'
  logic — not a `--theirs`/`--ours` shortcut.
- After a clean merge: `yarn build`, reload the plugin in Obsidian, and confirm the fork-specific features
  still work before committing/pushing the merge commit.
- Update `upstreamVersion` (see Versioning below) to the new upstream base as part of the same sync. This
  does *not*, by itself, require bumping the fork's own `version` — that only moves per the rules below.

## Versioning

`manifest.json`/`package.json`'s `version` is this fork's **own** semver, completely independent of
upstream's version number — no `<upstream>+fork.N` build-metadata suffix. Which upstream release the current
code is based on is tracked separately, in the `upstreamVersion` field of both those same files (Obsidian and
npm both ignore unknown manifest/package keys, so this is safe) and in `CHANGELOG.md`'s per-entry "upstream
base" line.

This is deliberate: `MAJOR.MINOR.PATCH` here is the *product-versioning* convention many apps use (a big
themed jump gets a new major, smaller work within it gets a minor, fixes get a patch) — not literal
semver-spec compliance, which reserves `MAJOR` for a breaking change to a published API. Nothing consumes
this plugin's version through a semver-range resolver, so that spec's actual reason for existing doesn't
apply here; forcing it on anyway would've meant either meaningless-looking jumps (a new upstream release
forcing a fork major bump) or a rewritten history every time upstream ships (see the old
`<upstream>+fork.N` scheme this replaced, and why: build metadata is ignored for precedence by the semver
spec, so a tool like BRAT would see `8.4.0+fork.1` and `8.4.0+fork.2` as equal and never prompt an update).

Rules:

- **MAJOR** bumps when a roadmap item first reaches at least a working state (see `CHANGELOG.md` and the
  roadmap below for what "working" meant at each bump — it doesn't require every planned aspect of that item
  to be done). Versions track *delivery order*, not the roadmap's own item numbering — e.g. roadmap item 2
  shipping before item 1 made it fork `2.0.0`, and item 1 (still only partly done) became `3.0.0`.
- **MINOR** bumps for follow-on work that completes more of an already-shipped roadmap item (e.g. `3.0.0` →
  `3.1.0` once item 1's native-notification half lands too), or for a smaller additive feature that doesn't
  warrant its own roadmap-level milestone.
- **PATCH** bumps for a fix that doesn't add scope.
- **Exception that always forces a MAJOR bump, regardless of the above:** an incompatible change to the
  on-disk task syntax (the fields/emoji Tasks reads and writes in a note) — a broken vault is a much bigger
  deal than any UI or internal change, so this is the one place a real breaking-change boundary exists for
  this project and it's treated as one.
- `upstreamVersion` moves independently, whenever a sync happens (see above) — it does not drive `version`.
- Keep `CHANGELOG.md` mapping each fork version to its upstream base and its fork-specific changes — the
  version number alone doesn't carry the "what changed" detail.
- `versions.json` (Obsidian's own version→`minAppVersion` compatibility map) holds only this fork's own
  entries, one per fork version, each mapped to the `minAppVersion` that version actually required. It
  originally inherited upstream's entire historical version list when this repo was forked - a mix of
  irrelevant *original*-plugin releases (this fork ships under its own manifest `id`, `upgraded-tasks`,
  never the upstream `obsidian-tasks-plugin`, so nothing will ever resolve this repo's `versions.json`
  looking for upstream's old releases) and, worse, entries under the same low integers this scheme reuses
  (their own `1.0.0`/`2.0.0`/`3.0.0` etc.) - all since removed rather than kept alongside.

## Roadmap (see conversation history for full research)

1. ~~**Reminder field in the task modal.**~~ **Done**, full scope (merged as `3.0.0` — see CHANGELOG.md's
   `3.0.0` entry for the exact feature list). Reimplemented from scratch against current `main`, not from the
   stale prior-art PR #2750 the roadmap used to point to (draft, last synced May 2024, ~6,000 commits behind
   `main` at the time — still worth reading as design reference if this area is revisited, but do not try to
   rebase it). Its reviewer's two flagged edge cases are both explicitly fixed/covered: reminder time now
   survives completion/recurrence (Task.ts's generic spread-recovery mechanism carries it forward
   automatically, the same way priority/tags already are, so there was no special-case code needed — it just
   had to not be reset), and `happens` now includes it. The access-key clash is avoided too: `K`, not `C`
   (Created Date's).

   **Important correction, found by testing against the actual Reminder plugin, then reverted (both still
   within `3.0.0`):** the original roadmap research's assumption that Reminder "already understands a
   distinct `⏰ HH:MM` signifier ... no changes needed on the Reminder side" was **wrong** in two separate
   ways, neither fixable from this fork's side alone. First: Reminder's "Tasks plugin format" reader needs a
   *full date* under `⏰` (like it does for `📅`/`⏳`/`🛫`) — a bare `HH:mm` isn't understood, and since `⏰`
   is checked before falling back to the other three (per Reminder's own "Fall back to due, scheduled, or
   start date" setting), that silently made the *entire line* not a reminder, no matter what date fields it
   had. Fixed by writing `⏰ YYYY-MM-DD HH:mm` instead. Second, found after that fix, with the fallback
   setting turned off as Reminder's own docs suggest for "only some tasks ring": Reminder's validity check in
   that mode is hardcoded to require a literal `📅` due date — regardless of whether `⏰` itself is present
   and valid, and regardless of using `⏳`/`🛫` — so it's fundamentally incompatible with a
   one-scheduled-date-per-task workflow. There is no configuration of Reminder that gives "one date field,
   opt-in per-task alarm." Decided: stop targeting Reminder-plugin compatibility entirely; reverted the `⏰
   YYYY-MM-DD HH:mm` format back to plain `⏰ HH:mm`. The one part that *stayed* is independently useful
   regardless of Reminder: every reminder-setting path still guarantees an anchor date exists (creating
   today's `scheduledDate` if the task has none at all) — see `SetReminderTime`'s doc comment in
   `ReminderInstructions.ts` — since a reminder time is meaningless without a day to attach it to, and the
   native notification system below will need to know "which day" exactly as much as Reminder would have.
2. ~~**Postpone (⏩) to next business day.**~~ **Done** (merged into `main`). Behind a setting
   (`postponeSkipWeekends`, default off) in `src/Config/Settings.ts`/`SettingsTab.ts` — remember this file has
   **two** parallel settings UIs that both need updating (see the note above). The actual date math is
   `TasksDate.postpone()`/`src/DateTime/Postponer.ts`, not `TaskLineRenderer.ts` (that file only displays
   dates; the button/menu logic lives in `HtmlQueryResultsRenderer.ts` and `ui/Menus/PostponeMenu.ts`). Once
   enabled, day-based increments (button and "N days" menu items) count **business days**, not calendar days
   rolled off a weekend at the end — otherwise different amounts collapse onto the same following Monday.
   Week/month increments just roll their single final result. Related upstream issues: #3379, #3818, #2674,
   #3502.
3. **Cross-project tabular view.** A new renderer mode that lays out the *already-computed* nested
   `TaskGroups` tree (bucket → project → tasks) as a table instead of nested lists — purely additive, doesn't
   touch filtering/sorting/grouping, so low conflict risk against upstream. (Do not confuse with
   [#3852](https://github.com/obsidian-tasks-group/obsidian-tasks/issues/3852), which was a *different*,
   rejected ask about per-task computed columns.)

   Layout: two columns, `Project` | `Tasks`. Outer grouping is the due-status bucket (`Overdue` / `Due
   today` / `Due this week` / `Due later`), rendered as a full-width, color-coded header row — bucket order
   is fixed by urgency, overriding Tasks' normal alphabetical-by-group-name sort. Inner grouping is project:
   one row per project that has at least one task in that bucket (no empty rows). A row's right-hand cell
   stacks every task for that (bucket, project) pair as multiple lines — tasks are not exploded into one row
   each. Sort order: buckets by fixed urgency order, projects within a bucket alphabetically (Tasks' existing
   `group by` sort), tasks within a cell by due date (soonest first, Tasks' existing default).

   ```text
   ┌───────────────────────────────────────────┐
   │ Overdue                                    │  ← bucket header, full width
   ├───────────┬─────────────────────────────────┤
   │ Project A │ Task A.1                        │  ← one row per project-in-bucket
   │           │ Task A.2                        │     (multiple tasks stack in the cell)
   ├───────────┴─────────────────────────────────┤
   │ Due today                                   │
   ├───────────┬─────────────────────────────────┤
   │ Project A │ Task A.3                        │
   │ Project B │ Task B.1                        │
   │ Project C │ Task C.1                        │
   ├───────────┴─────────────────────────────────┤
   │ Due this week                                │
   ├───────────┬─────────────────────────────────┤
   │ Project B │ Task B.2                        │
   │           │ Task B.3                        │
   │           │ Task B.4                        │
   ├───────────┴─────────────────────────────────┤
   │ Due later                                    │
   ├───────────┬─────────────────────────────────┤
   │ Project A │ Task A.4                        │
   │ Project C │ Task C.2                        │
   │           │ Task C.3                        │
   └───────────┴─────────────────────────────────┘
   ```

4. ~~**Native notification delivery.**~~ **Phase 1 done** (foreground/desktop, merged as `3.1.0`; not yet
   tested on mobile): fire notifications directly from this plugin for tasks with a `reminderTime` set,
   instead of depending on the separate Reminder plugin (see the correction under item 1 for why that path
   is a dead end for this fork's workflow). `src/Notifications/NotificationScheduler.ts`'s
   `findDueReminders`/`ReminderCheckLoop` is a pure, half-open sliding-window check (`(lastCheckTime,
   now]`) driven by a single `registerInterval` in `main.ts` - the window itself is the dedup mechanism, no
   persisted "already fired" state needed. `src/Notifications/ReminderNotifier.ts::notifyRemindersDue`
   fires **one combined notification per check**, never one per task, even when several reminders land in
   the same window - via a real OS notification (the renderer's global `Notification`, which Electron
   implements on desktop - no `electron` package import needed) on desktop, falling back to a persistent
   `Notice` on mobile/wherever `Notification` isn't available. Both channels are **persistent**: the native
   one via `requireInteraction: true`, the `Notice` via duration `0` - neither auto-dismisses on its own
   timer, only when the user dismisses it. Behind two settings, `notificationsEnabled` (default off) and
   `notificationCheckIntervalSeconds` (needs a plugin reload to change, unlike the enabled toggle - see the
   "Reload" button `withReload` gives it).

   **Investigated and abandoned: the Windows toast's "electron.app.Obsidian" banner.** On Windows, the
   native notification's header shows "electron.app.Obsidian" instead of a clean "Obsidian" name/icon.
   Verified against Electron's own docs and issue tracker: that header (app name *and* the icon next to it)
   is resolved entirely from the process's registered Application User Model ID (AUMID) - set via
   `app.setAppUserModelId()`, a **main-process-only** API, or via how the app's Start Menu shortcut was
   registered at install time. An Electron maintainer-adjacent issue states outright that this title "is
   not modifiable using the Toast XML" - i.e. no option on the `Notification` constructor (`icon`, `tag`,
   `toastXml`, anything) touches it. A community plugin runs only in the renderer/plugin sandbox, with no
   path to `app.setAppUserModelId()` and no ability to change how Obsidian itself is installed/registered
   with Windows - this is a hard platform boundary, not a gap in this code. (The `icon` option *does* still
   render, but only as a secondary inline image inside the toast body, not a replacement for the header
   icon - a 2021 Electron issue asking for exactly that was closed as not-planned. Decided not to add it:
   it wouldn't address the actual complaint, just add a picture elsewhere in the toast.) Since AUMID is
   per-*process*, not per-caller, this would affect any OS notification from this Obsidian install equally,
   including Obsidian's own - if that's also true here, it confirms this is how this specific install is
   registered with Windows (common for portable/unpackaged-style installs), unrelated to this plugin.

   **Known, accepted limitation of Phase 1**: a reminder that comes due while Obsidian is fully closed is
   *not* fired retroactively on reopen - `ReminderCheckLoop`'s window starts at construction time (plugin
   startup), so anything before that is silently skipped rather than causing a notification burst. This is
   intentionally honest about Phase 1 being foreground/session-scoped only; true "fires even while closed"
   delivery is Phase 2 below. The user has asked for a *separate* future feature building on this
   limitation: on startup (or otherwise), surface a single summary ("N reminders came due while you were
   away") rather than firing each one - not designed or built yet, just logged here as a want.

   **Notifications view: done** (merged as `3.2.0`). `src/Obsidian/NotificationsItemView.ts` (the first
   `ItemView` in this codebase) + `src/ui/NotificationsView.svelte`: "Upcoming" (live, from current tasks'
   `reminderDateTime`, kept fresh via `TasksEvents.onCacheUpdate` using Svelte's `$set` rather than a
   destroy/remount) and "History" (read-only, from the new persisted `notificationHistory` setting -
   `src/Notifications/NotificationHistory.ts`'s `appendHistoryEntries`, one entry per task, pruned to 500).
   Opened via `TasksPlugin.openNotificationsView()` (ribbon icon, command, and `notifyRemindersDue`'s new
   optional click callback all funnel through it, so they can't create duplicate tabs) - clicking either
   notification channel calls `window.focus()` *and* opens the view, since `revealLeaf` alone only changes
   the active tab inside the app, not the OS-level window focus.

   **Phase 2, not started**: true background delivery on mobile still needs an external push relay, the
   same way the separate Reminder plugin does it via `ntfy.sh` (`ntfyEnabled`/`ntfyServerUrl`/`ntfyTopic`/
   `ntfyAccessToken` in its own settings, plus ntfy's own separate mobile app subscribed to a topic) - this
   is a platform limitation (Obsidian mobile gives a pure JS/TS plugin no way to run once the app is
   closed/backgrounded), not something Phase 1's approach can ever close the gap on. The mechanism that
   would make this actually work while Obsidian itself isn't running: ntfy's scheduled/delayed delivery (a
   `Delay`/`X-Delay` header ntfy's own always-on server honours, so the *sending* client doesn't need to
   still be running when the message fires) - **must be verified against ntfy's current docs before
   implementing**, since it's the load-bearing assumption Phase 2 depends on. Calls should go through
   Obsidian's `requestUrl` (explicitly documented as bypassing the renderer's CORS restrictions), not the
   global `fetch`. Needs its own persisted idempotency state (which task+instant has already been scheduled
   with ntfy, so re-scans don't push duplicate scheduled messages) - unlike Phase 1's window trick, this
   can't avoid persistence, since "don't double-schedule" has to survive a restart. Known hard limitation to
   document for users once built: ntfy's hosted/free tier has no cancel-a-scheduled-message API, so removing
   or postponing a reminder shortly before it fires may still result in one stale push arriving.

## Build

Uses **Yarn** (there's a `yarn.lock`, no `package-lock.json` — `npm install` will fail with an ERESOLVE error
on `esbuild-sass-plugin`'s peer dependency).

```bash
yarn install --ignore-engines --ignore-scripts   # see note below
yarn build        # production build -> main.js, styles.css (outdir is '.', i.e. this folder)
yarn dev          # esbuild watch mode, same output location
```

`--ignore-engines` is needed because `i18next-parser` pins to Node 18/20/22 and this machine runs Node 24.
`--ignore-scripts` works around a broken Windows postinstall in the `approvals` test dependency
(`spawn EINVAL`) — it's only used by the test suite, not the build, so this is safe for day-to-day plugin
dev. If you need to run `yarn test`, you may need to install `approvals` separately or patch around its
postinstall.

Since this folder *is* `.obsidian/plugins/upgraded-tasks`, there's no deploy step needed for manual testing —
building here is building live. (The repo's own `scripts/Test-TasksInLocalObsidian.mjs` copies build output
into `<vault>/.obsidian/plugins/obsidian-tasks-plugin`, which is a *different* folder/id than this one — not
needed for this setup, but useful if you ever want a separate side-by-side vault copy.)

Reload the plugin in Obsidian after building: Settings → Community plugins → toggle "Tasks (Upgraded Fork)"
off/on (or restart Obsidian) to pick up a fresh `main.js`.
