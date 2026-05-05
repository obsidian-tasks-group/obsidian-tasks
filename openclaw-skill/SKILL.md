---
name: obsidian-tasks-cli
description: Use this skill when an OpenClaw agent needs to list, create, toggle, or complete markdown task lines for the Obsidian Tasks plugin.
---

# Obsidian Tasks CLI

Use this repo's CLI to manage markdown task lines. Always pass `--vault <vault>`.

```bash
PLUGIN_REPO=/path/to/obsidian-tasks
npm --prefix "$PLUGIN_REPO" run cli-build
node "$PLUGIN_REPO/openclaw-tasks-cli.cjs" list --vault <vault>
```

Create or update tasks:

```bash
node "$PLUGIN_REPO/openclaw-tasks-cli.cjs" create --vault <vault> --path "Tasks.md" --text "Review inbox"
node "$PLUGIN_REPO/openclaw-tasks-cli.cjs" toggle --vault <vault> --path "Tasks.md" --line 12
node "$PLUGIN_REPO/openclaw-tasks-cli.cjs" complete --vault <vault> --path "Tasks.md" --line 12
```

If installed or linked, `obsidian-tasks-cli ...` may be used instead.

## Safety

- Line numbers are 1-based; re-list tasks if the file may have changed.
- Prefer `--dry-run` before editing.
- Treat `ok: false` or nonzero exit as failure and report `error.message`.

