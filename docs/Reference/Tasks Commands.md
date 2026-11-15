---
publish: true
---

# Tasks Commands

The Tasks plugin provides a growing number of commands for editing task data.

Commands can be run with in Obsidian with:

- [Command palette](https://obsidian.md/help/plugins/command-palette)
- [Slash commands](https://obsidian.md/help/plugins/slash-commands)
- [Hotkeys](https://obsidian.md/help/hotkeys): customisable keyboard shortcuts

## Change status commands

See [[Toggling and Editing Statuses#'Tasks Change status to...' commands|'Tasks Change status to...' commands]].

One command is created for each status in your [[Status Settings]], including both [[Core Statuses]] and any [[Custom Statuses]] you have configured: this table shows the commands privided by the default statuses.

<!-- placeholder to force blank line before included text --><!-- include: ChangeStatusCommands.test.Change_status_commands_reference_table.approved.md -->

| Name | ID |
| ----- | ----- |
| `Change status to: [ ] Todo` | `set-status-symbol-to-space` |
| `Change status to: [x] Done` | `set-status-symbol-to-x` |
| `Change status to: [/] In Progress` | `set-status-symbol-to-/` |
| `Change status to: [-] Cancelled` | `set-status-symbol-to--` |

<!-- placeholder to force blank line after included text --><!-- endInclude -->

## Other commands

| Name                         | ID  | Details                                                                     |
| ---------------------------- | --- | --------------------------------------------------------------------------- |
| `Tasks: Create or edit task` |     | [[Create or edit Task#Opening the 'Create or edit Task' Modal\|details]]    |
| `Tasks: Toggle task done`    |     | [[Toggling and Editing Statuses#'Tasks Toggle task done' command\|details]] |
