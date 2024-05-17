---
publish: true
---

# Toggling and Changing Task Statuses

<span class="related-pages">#feature/statuses</span>

## Summary

This page describes ways to mark a task line as `TODO` or `DONE`, or any other [[Statuses]] and [[Custom Statuses]] your vault may be configured to use.

You can [[#Toggling Tasks with mouse|left-click]] or [[#'Change task status' context menu|right-click]] on task checkboxes.

Other options are a [[#'Tasks Toggle task done' command|command]] and a [[#Edit task modal|modal]].

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

## Edit task modal

The [[Create or edit Task]] modal also allows editing of task statuses.
