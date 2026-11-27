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

Easily change the priority of one or more tasks.

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

Notes:

- `Change Priority to: Normal` removes any priority signifier from the task.
- `Increase Priority` and `Decrease Priority` move the priority by one level, in the order shown in the table above.
  For example, `Increase Priority` changes Low to Normal, and Normal to Medium.
- `Increase Priority` does not change tasks that are already Highest, and `Decrease Priority` does not change tasks that are already Lowest.
- If several lines are selected, the command is applied to every task on those lines, and a single Undo reverts them all.
  Each task moves one level from its own current priority. Lines that are not tasks are left unchanged.

> [!released]
> The Priority commands were introduced in Tasks 8.7.0.

## Change date commands

There are these commands for each of the six [[Dates|dates]]:

- `Remove … date` removes the date.

Notes:

- If several lines are selected, the command is applied to every task on those lines, and a single Undo reverts them all.
  Lines that are not tasks are left unchanged.

> [!released]
> The Date commands were introduced in Tasks X.Y.Z.

### Due date commands

See [[Dates#Due date|Due date]].

<!-- placeholder to force blank line before included text --><!-- include: ChangeDateCommands.test.Change_date_commands_reference_table_for_dueDate.approved.md -->

| Name | ID |
| ----- | ----- |
| `Tasks: Remove Due date` | `obsidian-tasks-plugin:remove-due-date` |

<!-- placeholder to force blank line after included text --><!-- endInclude -->

### Scheduled date commands

See [[Dates#Scheduled date|Scheduled date]].

<!-- placeholder to force blank line before included text --><!-- include: ChangeDateCommands.test.Change_date_commands_reference_table_for_scheduledDate.approved.md -->

| Name | ID |
| ----- | ----- |
| `Tasks: Remove Scheduled date` | `obsidian-tasks-plugin:remove-scheduled-date` |

<!-- placeholder to force blank line after included text --><!-- endInclude -->

### Start date commands

See [[Dates#Start date|Start date]].

<!-- placeholder to force blank line before included text --><!-- include: ChangeDateCommands.test.Change_date_commands_reference_table_for_startDate.approved.md -->

| Name | ID |
| ----- | ----- |
| `Tasks: Remove Start date` | `obsidian-tasks-plugin:remove-start-date` |

<!-- placeholder to force blank line after included text --><!-- endInclude -->

### Created date commands

See [[Dates#Created date|Created date]].

<!-- placeholder to force blank line before included text --><!-- include: ChangeDateCommands.test.Change_date_commands_reference_table_for_createdDate.approved.md -->

| Name | ID |
| ----- | ----- |
| `Tasks: Remove Created date` | `obsidian-tasks-plugin:remove-created-date` |

<!-- placeholder to force blank line after included text --><!-- endInclude -->

### Done date commands

See [[Dates#Done date|Done date]].

<!-- placeholder to force blank line before included text --><!-- include: ChangeDateCommands.test.Change_date_commands_reference_table_for_doneDate.approved.md -->

| Name | ID |
| ----- | ----- |
| `Tasks: Remove Done date` | `obsidian-tasks-plugin:remove-done-date` |

<!-- placeholder to force blank line after included text --><!-- endInclude -->

### Cancelled date commands

See [[Dates#Cancelled date|Cancelled date]].

<!-- placeholder to force blank line before included text --><!-- include: ChangeDateCommands.test.Change_date_commands_reference_table_for_cancelledDate.approved.md -->

| Name | ID |
| ----- | ----- |
| `Tasks: Remove Cancelled date` | `obsidian-tasks-plugin:remove-cancelled-date` |

<!-- placeholder to force blank line after included text --><!-- endInclude -->

## Other commands

| Name                                            | ID                                                         | Details                                                                         |
| ----------------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `Tasks: Create or edit task`                    | `obsidian-tasks-plugin:edit-task`                          | [[Create or edit Task#Opening the 'Create or edit Task' Modal\|details]]        |
| `Tasks: Toggle task done`                       | `obsidian-tasks-plugin:toggle-done`                        | [[Toggling and Editing Statuses#'Tasks Toggle task done' command\|details]]     |
| `Tasks: Quick search`                           | `obsidian-tasks-plugin:quick-search`                       | [[Quick Search\|details]]                                                       |
| `Tasks: Add all Query File Defaults properties` | `obsidian-tasks-plugin:add-query-file-defaults-properties` | [[Query File Defaults#Command Add all Query File Defaults properties\|details]] |
