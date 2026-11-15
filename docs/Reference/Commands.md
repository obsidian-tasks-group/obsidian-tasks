---
publish: true
---

# Commands

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
| `Tasks: Change status to: [ ] Todo` | `obsidian-tasks-plugin:set-status-symbol-to-space` |
| `Tasks: Change status to: [x] Done` | `obsidian-tasks-plugin:set-status-symbol-to-x` |
| `Tasks: Change status to: [/] In Progress` | `obsidian-tasks-plugin:set-status-symbol-to-/` |
| `Tasks: Change status to: [-] Cancelled` | `obsidian-tasks-plugin:set-status-symbol-to--` |

<!-- placeholder to force blank line after included text --><!-- endInclude -->

## Other commands

| Name                         | ID                                   | Details                                                                     |
| ---------------------------- | ------------------------------------ | --------------------------------------------------------------------------- |
| `Tasks: Create or edit task` | `obsidian-tasks-plugin:edit-task`    | [[Create or edit Task#Opening the 'Create or edit Task' Modal\|details]]    |
| `Tasks: Toggle task done`    | `obsidian-tasks-plugin:toggle-done`  | [[Toggling and Editing Statuses#'Tasks Toggle task done' command\|details]] |
| `Tasks: Quick search`        | `obsidian-tasks-plugin:quick-search` | [[Quick Search]]                                                            |
