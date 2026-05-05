---
name: obsidian-tasks-cli
description: Use this skill when an OpenClaw agent needs to list, create, toggle, or complete markdown task lines for the Obsidian Tasks plugin.
---

# Obsidian Tasks CLI

Use the CLI shipped in the installed plugin folder. Always pass `--vault <vault>`.

```bash
VAULT=/path/to/vault
CLI="$VAULT/.obsidian/plugins/obsidian-tasks-plugin/openclaw-tasks-cli.cjs"
node "$CLI" list --vault "$VAULT"
```

Create or update tasks:

```bash
node "$CLI" create --vault "$VAULT" --path "Tasks.md" --text "Review inbox"
node "$CLI" toggle --vault "$VAULT" --path "Tasks.md" --line 12
node "$CLI" complete --vault "$VAULT" --path "Tasks.md" --line 12
```

If the installed plugin does not include the CLI yet, use `obsidian-tasks-cli` from `PATH` or `node "$PLUGIN_REPO/openclaw-tasks-cli.cjs"` from a checkout.

## Safety

- Line numbers are 1-based; re-list tasks if the file may have changed.
- Prefer `--dry-run` before editing.
- Treat `ok: false` or nonzero exit as failure and report `error.message`.

