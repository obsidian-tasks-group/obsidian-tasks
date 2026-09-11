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
