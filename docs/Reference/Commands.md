---
publish: true
---

# Commands

The Tasks plugin provides a growing number of commands.

Commands can be run in Obsidian with:

- [Command palette](https://obsidian.md/help/plugins/command-palette)
- [Slash commands](https://obsidian.md/help/plugins/slash-commands)
- [Hotkeys](https://obsidian.md/help/hotkeys): customisable keyboard shortcuts

## Command IDs

Each command has a name, which you see in Obsidian, and an ID, which Obsidian uses when it saves your settings.

You only need the IDs if you edit these files yourself, for example with a script while Obsidian is not running:

- `.obsidian/hotkeys.json`: your hotkeys
- `.obsidian/command-palette.json`: your pinned commands

## Change status commands

See [[Toggling and Editing Statuses#'Tasks Change status to...' commands|'Tasks Change status to...' commands]].

One command is created for each status in your [[Status Settings]], including both [[Core Statuses]] and any [[Custom Statuses]] you have configured: this table shows the commands provided by the default statuses.

<!-- placeholder to force blank line before included text --><!-- include: ChangeStatusCommands.test.Change_status_commands_reference_table.approved.md -->

| Name | ID |
| ----- | ----- |
| `Tasks: Change status to: [ ] Todo` | `obsidian-tasks-plugin:set-status-symbol-to-space` |
| `Tasks: Change status to: [x] Done` | `obsidian-tasks-plugin:set-status-symbol-to-x` |
| `Tasks: Change status to: [/] In Progress` | `obsidian-tasks-plugin:set-status-symbol-to-/` |
| `Tasks: Change status to: [-] Cancelled` | `obsidian-tasks-plugin:set-status-symbol-to--` |

<!-- placeholder to force blank line after included text --><!-- endInclude -->

The ID for these commands is always:

- `obsidian-tasks-plugin:set-status-symbol-to-<symbol>`
- with `space` for the space character.

The ID stays the same if the Status Name, Next Symbol or Status Type is edited, but changes if the Status Symbol is edited.

## Change priority commands

<!-- placeholder to force blank line before included text --><!-- include: ChangePriorityCommands.test.Change_priority_commands_reference_table.approved.md -->

| Name | ID |
| ----- | ----- |
| `Tasks: Change Priority to: Highest` | `obsidian-tasks-plugin:set-priority-to-highest` |
| `Tasks: Change Priority to: High` | `obsidian-tasks-plugin:set-priority-to-high` |
| `Tasks: Change Priority to: Medium` | `obsidian-tasks-plugin:set-priority-to-medium` |
| `Tasks: Change Priority to: Normal` | `obsidian-tasks-plugin:set-priority-to-normal` |
| `Tasks: Change Priority to: Low` | `obsidian-tasks-plugin:set-priority-to-low` |
| `Tasks: Change Priority to: Lowest` | `obsidian-tasks-plugin:set-priority-to-lowest` |
| `Tasks: Increase Priority` | `obsidian-tasks-plugin:increase-priority` |
| `Tasks: Decrease Priority` | `obsidian-tasks-plugin:decrease-priority` |

<!-- placeholder to force blank line after included text --><!-- endInclude -->

## Other commands

| Name                                            | ID                                                         | Details                                                                         |
| ----------------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `Tasks: Create or edit task`                    | `obsidian-tasks-plugin:edit-task`                          | [[Create or edit Task#Opening the 'Create or edit Task' Modal\|details]]        |
| `Tasks: Toggle task done`                       | `obsidian-tasks-plugin:toggle-done`                        | [[Toggling and Editing Statuses#'Tasks Toggle task done' command\|details]]     |
| `Tasks: Quick search`                           | `obsidian-tasks-plugin:quick-search`                       | [[Quick Search\|details]]                                                       |
| `Tasks: Add all Query File Defaults properties` | `obsidian-tasks-plugin:add-query-file-defaults-properties` | [[Query File Defaults#Command Add all Query File Defaults properties\|details]] |
