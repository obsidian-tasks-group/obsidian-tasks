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
- `versions.json` (Obsidian's own version→`minAppVersion` compatibility map) inherited upstream's entire
  historical version list when this repo was forked, which used the same low integers this scheme now
  reuses (their `1.0.0`/`2.0.0`/`3.0.0` etc. are unrelated releases of the *original* plugin). Since this
  fork ships under its own manifest `id` (`upgraded-tasks`, never the upstream `obsidian-tasks-plugin`),
  nothing will ever resolve this repo's `versions.json` looking for upstream's actual old releases, so this
  fork's own entries simply overwrite those keys with this fork's real `minAppVersion` at that point.

## Roadmap (see conversation history for full research)

1. **Reminder field in the task modal.** Reminder (obsidian-reminder) already understands a distinct
   `⏰ HH:MM` signifier alongside Tasks' own date fields — no changes needed on the Reminder side. The gap is
   purely that Tasks' modal has no field to enter it. There's stale prior art for this:
   [PR #2750](https://github.com/obsidian-tasks-group/obsidian-tasks/pull/2750) (draft, last synced May 2024,
   ~6,000 commits behind current upstream `main` — do not try to rebase it). Its actual `src/` diff was small
   (~214 lines across 20 files: `Task.ts`, `DefaultTaskSerializer.ts`/`DataviewTaskSerializer.ts`,
   `Recurrence.ts`, `EditTask.svelte` + `EditTaskHelpers.ts`, `TaskLineRenderer.ts`/`TaskFieldRenderer.ts`,
   `Sort.ts`/`FilterParser.ts`/`Query.ts`, new `Query/Filter/ReminderDateField.ts`) — use it as a design
   reference and reimplement against current `main`, not as a branch to merge. Known edge cases the PR's
   reviewer flagged: reminder time gets lost when a task is completed or recurs, the `happens` filter doesn't
   see reminder dates, and a keyboard access-key clash (`C` is taken by Created Date).
2. **Postpone (⏩) to next business day.** Lives in `src/Renderer/TaskLineRenderer.ts` (button) plus whatever
   date-math helper it calls — small, isolated change, ideally behind a setting. Related upstream issues:
   #3379, #3818, #2674, #3502.
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
