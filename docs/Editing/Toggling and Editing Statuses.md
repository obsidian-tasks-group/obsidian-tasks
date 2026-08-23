---
publish: true
---

# Toggling and Changing Task Statuses

<span class="related-pages">#feature/statuses</span>

## Summary

This page describes ways to mark a task line as `TODO` or `DONE`, or any other [[Statuses]] and [[Custom Statuses]] your vault may be configured to use.

You can [[#Toggling Tasks with mouse|left-click]] or [[#'Change task status' context menu|right-click]] on task checkboxes.

Other options are commands ([[#'Tasks Toggle task done' command|toggle]] or [[#'Tasks Change status to...' commands|set to a specific status]]) and a [[#Edit task modal|modal]].

> [!tip] What is "toggling"?
> The simplest meaning of 'toggling' is converting a task between these two states:
>
> 1. `- [ ] ...` - meaning `to do`.
> 2. `- [x] ...` - meaning `done`.

## Toggling Tasks with mouse

The most common way to change a task status is to **single-click on its checkbox**.

| Where                         | Viewing Mode | Works? |
| ----------------------------- | ------------ | ------ |
| Task lines in markdown files  | Source mode  | ❌     |
| Task lines in markdown files  | Live Preview | ✅     |
| Task lines in markdown files  | Reading mode | ✅     |
| In Tasks query search results | Live Preview | ✅     |
| In Tasks query search results | Reading mode | ✅     |

## 'Change task status' context menu

**Right-click** or **press-and-hold** on **a task's checkbox** to bring up a menu to allow any known status to be applied to the task.

This works in both **Reading mode** and in **Tasks Query results**.

![Sample 'Change task status' context menu, in a vault with various custom statuses added.](change-status-context-menu-with-custom-statuses.png)
<span class="caption">Sample 'Change task status' context menu, in a vault with various [[Custom Statuses]] added.</span>

> [!tip]
> The 'Change task status' context menu does correctly add Done dates, and create new instances of recurring tasks, when appropriate.

The statuses are obtained from the vault's [[Status Settings]].

- [[Core Statuses]] are shown first,
- then any [[Custom Statuses]].

Changing from one `DONE` status to another:

- retains any original Done date.
- does not create a new recurrence of recurring tasks.

| Where                         | Viewing Mode | Works? |
| ----------------------------- | ------------ | ------ |
| Task lines in markdown files  | Source mode  | ❌     |
| Task lines in markdown files  | Live Preview | ❌     |
| Task lines in markdown files  | Reading mode | ✅     |
| In Tasks query search results | Live Preview | ✅     |
| In Tasks query search results | Reading mode | ✅     |

> [!released]
> The 'Change task status' context menu was introduced in Tasks 5.3.0.

## 'Tasks: Toggle task done' command

There is also a command 'Tasks: Toggle task done'.

Obsidian allows you to assign a [hotkey](https://help.obsidian.md/Customization/Custom+hotkeys) to commands, for ease of use.

| Where                         | Viewing Mode | Works? |
| ----------------------------- | ------------ | ------ |
| Task lines in markdown files  | Source mode  | ✅     |
| Task lines in markdown files  | Live Preview | ✅     |
| Task lines in markdown files  | Reading mode | ❌     |
| In Tasks query search results | Live Preview | ❌     |
| In Tasks query search results | Reading mode | ❌     |

Since Tasks 7.2.0, this command can also be triggered programmatically via the [[Tasks Api#`executeToggleTaskDoneCommand (line string, path string) => string;`|Tasks API]].

## 'Tasks: Change status to...' commands

There is a set of commands to directly set a task's status to any specific registered status.

For example:

- 'Tasks: Change status to: [ ] Todo'
- 'Tasks: Change status to: [/] In Progress'
- 'Tasks: Change status to: [x] Done'
- 'Tasks: Change status to: [-] Cancelled'

One command is created for each status in your [[Status Settings]], including both [[Core Statuses]] and any [[Custom Statuses]] you have configured.

Obsidian allows you to assign a [hotkey](https://help.obsidian.md/Customization/Custom+hotkeys) to commands, for ease of use. This makes it easy to, for example, assign a hotkey to quickly mark a task as 'In Progress' or 'Cancelled'.

> [!note]
> Currently the 'Change status to' commands only act on lines which are recognised by Tasks.
> When run on other lines, the message '**Cannot set status: line is not a task or does not match global filter**' is shown.

| Where                         | Viewing Mode | Works? |
| ----------------------------- | ------------ | ------ |
| Task lines in markdown files  | Source mode  | ✅     |
| Task lines in markdown files  | Live Preview | ✅     |
| Task lines in markdown files  | Reading mode | ❌     |
| In Tasks query search results | Live Preview | ❌     |
| In Tasks query search results | Reading mode | ❌     |

> [!tip]
> These commands correctly add Done dates and create new instances of recurring tasks when changing to a `DONE` status, just like the [[#'Change task status' context menu]].

> [!released]
> The 'Change status to...' commands were introduced in Tasks 7.24.0.

## Edit task modal

The [[Create or edit Task]] modal also allows editing of task statuses.

## Support

Before creating a new bug report or feature request about Toggling and Editing Statuses, please check existing items to avoid duplicates.

You do not need to search manually: the links below are already filtered to the label `"scope: toggling tasks"`.

- Check both Open and Closed items.
- If you find an existing item, support it there instead of adding a `+1` comment. See [[About Support and Help#How to support an existing request|How to support an existing request]].

| Type | Open | Closed | Notes |
| --- | --- | --- | --- |
| Issues | [Open](https://github.com/obsidian-tasks-group/obsidian-tasks/issues?q=is%3Aopen%20label%3A%22scope%3A+toggling+tasks%22%20is%3Aissue%20) | [Closed](https://github.com/obsidian-tasks-group/obsidian-tasks/issues?q=is%3Aclosed%20label%3A%22scope%3A+toggling+tasks%22%20is%3Aissue%20) | bug reports and feature requests |
| Discussions | [Open](https://github.com/obsidian-tasks-group/obsidian-tasks/discussions/categories/ideas-any-new-feature-requests-go-in-issues-please?discussions_q=is%3Aopen+label%3A%22scope%3A+toggling+tasks%22+category%3A%22Ideas%3A+Any+New+Feature+Requests+go+in+Issues+please%22+sort%3Atop) | [Closed](https://github.com/obsidian-tasks-group/obsidian-tasks/discussions/categories/ideas-any-new-feature-requests-go-in-issues-please?discussions_q=is%3Aclosed+label%3A%22scope%3A+toggling+tasks%22+category%3A%22Ideas%3A+Any+New+Feature+Requests+go+in+Issues+please%22+sort%3Atop) | older feature discussions from before late 2022 |

If you do not find an existing item in Issues or Discussions, see [[About Support and Help]] for how to report a bug or request a feature.
