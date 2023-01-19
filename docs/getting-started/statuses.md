---
layout: default
title: Statuses
nav_order: 2
parent: Getting Started
has_toc: false
---

# Statuses
{: .no_toc }

<details open markdown="block">
  <summary>
    Table of contents
  </summary>
  {: .text-delta }
1. TOC
{:toc}
</details>

---

## What's in a status?

- `status symbol`
  - the single character in the `[]` at the start of the task.
- `status name`
  - a name for the status.
  - this is flexible: for custom statuses, you can use any name you wish.
  - is searchable with `status.name`, for example `status.name includes todo`.
- `next status symbol`
  - the status symbol to use when the task is toggled.
- `status type`
  - one of `TODO`, `IN_PROGRESS`, `DONE`, `CANCELLED`, `NON_TASK`.
  - by assigning one of these types to your custom statuses, you can control some aspects of Tasks' behaviour for all task lines that use that particular custom status.
  - is searchable with `status.type`, for example `status.type includes IN_PROGRESS`.
  - you can have any number of custom statuses with the same status type, and then search them conveniently with `status.type`

### Status Types

This table demonstrates the behaviour of each of the status types in Tasks.
Each column shows an example task with the given status type.

The tasks shown are purely examples for context. The `~` column is just an arbitrary example to show `NON_TASK`'s behaviour'. You can assign each of these types to any of your custom statuses.

<!-- placeholder to force blank line before table --> <!-- include: DocsSamplesForStatuses.test.Status_Transitions status-types.approved.md -->

| Operation | TODO | IN_PROGRESS | DONE | CANCELLED | NON_TASK |
| ----- | ----- | ----- | ----- | ----- | ----- |
| Example Task | `- [ ] demo` | `- [/] demo` | `- [x] demo` | `- [-] demo` | `- [~] demo` |
| Matches `done` | no | no | YES | YES | no |
| Matches `not done` | YES | YES | no | no | no |
| Matches `status.name includes todo` | YES | no | no | no | no |
| Matches `status.type includes TODO` | YES | no | no | no | no |
| Matches `status.name includes in progress` | no | YES | no | no | no |
| Matches `status.type includes IN_PROGRESS` | no | YES | no | no | no |
| Matches `status.name includes done` | no | no | YES | no | no |
| Matches `status.type includes DONE` | no | no | YES | no | no |
| Matches `status.name includes cancelled` | no | no | no | YES | no |
| Matches `status.type includes CANCELLED` | no | no | no | YES | no |
| Matches `status.type includes NON_TASK` | no | no | no | no | YES |
| Name for `group by status` | Todo | Done | Done | Done | Done |
| Name for `group by status.type` | 2 TODO | 1 IN_PROGRESS | 3 DONE | 4 CANCELLED | 5 NON_TASK |
| Name for `group by status.name` | Todo | In Progress | Done | Cancelled | My custom status |

<!-- placeholder to force blank line after table --> <!-- endInclude -->

{: .warning }
The `group by` results of the above table are subject to change.

## Standard Markdown task statuses

Tasks have a status.

The convention in markdown is:

```text
- [ ] I am a task that is not yet done
- [x] I am a task that has been done
```

---

## Tasks core task statuses

{: .released }
Introduced in Tasks X.Y.Z

Tasks supports custom task statuses.

This table shows the statuses provided by default:

<!-- placeholder to force blank line before table --> <!-- include: DocsSamplesForStatuses.test.DefaultStatuses_core-statuses.approved.md -->

| Status Character | Status Name<br>`status.name includes...`<br>`sort by status.name`<br>`group by status.name` | Next Status Character | Status Type<br>`status.type includes...`<br>`sort by status.type`<br>`group by status.type` | Needs Custom Styling |
| ----- | ----- | ----- | ----- | ----- |
| `space` | Todo | `x` | `TODO` | No |
| `/` | In Progress | `x` | `IN_PROGRESS` | Yes |
| `x` | Done | `space` | `DONE` | No |
| `-` | Cancelled | `space` | `CANCELLED` | Yes |

<!-- placeholder to force blank line after table --> <!-- endInclude -->

### Editing core statuses

The Tasks settings shows the core statuses:

![Core Statuses](../images/settings-core-statuses.png)

Note that `Todo` is followed by `Done`, in order to preserve compatibility with earlier Tasks releases.

{: .info }
These core statuses are currently read-only.
It will soon be possible to edit these custom statuses, and enable `Todo` -> `In Progress` -> `Done`.

---

## Custom task statuses

### First choose your styling scheme

First, decide which CSS Snippet or Theme you wish to use, to style your checkboxes.

{: .info }
We will later enhance this documentation with a more thorough list of available CSS Snippets and Themes that style task checkboxes.

### Editing custom statuses

Your choice of styling facility will determine which letters and characters you wish to you in your custom statuses.

Then see [How to set up your custom statuses]({{ site.baseurl }}{% link how-to/set-up-custom-statuses.md %}) for how to set up your custom statuses.

{: .warning }
Remember to set up your chosen CSS Snippet or Theme before setting up the custom statuses.

### Minimal supported statuses

<!-- placeholder to force blank line before table --> <!-- include: DocsSamplesForStatuses.test.DefaultStatuses_minimal-supported-statuses.approved.md -->

| Status Character | Status Name<br>`status.name includes...`<br>`sort by status.name`<br>`group by status.name` | Next Status Character | Status Type<br>`status.type includes...`<br>`sort by status.type`<br>`group by status.type` | Needs Custom Styling |
| ----- | ----- | ----- | ----- | ----- |
| `>` | Forwarded | `x` | `TODO` | Yes |
| `<` | Schedule | `x` | `TODO` | Yes |
| `?` | Question | `x` | `TODO` | Yes |
| `!` | Important | `x` | `TODO` | Yes |
| `"` | Quote | `x` | `TODO` | Yes |
| `-` | Canceled | `x` | `CANCELLED` | Yes |
| `*` | Star | `x` | `TODO` | Yes |
| `l` | Location | `x` | `TODO` | Yes |
| `i` | Info | `x` | `TODO` | Yes |
| `S` | Amount/savings/money | `x` | `TODO` | Yes |
| `I` | Idea/lightbulb | `x` | `TODO` | Yes |
| `f` | Fire | `x` | `TODO` | Yes |
| `k` | Key | `x` | `TODO` | Yes |
| `u` | Up | `x` | `TODO` | Yes |
| `d` | Down | `x` | `TODO` | Yes |
| `w` | Win | `x` | `TODO` | Yes |
| `p` | Pros | `x` | `TODO` | Yes |
| `c` | Cons | `x` | `TODO` | Yes |
| `b` | Bookmark | `x` | `TODO` | Yes |

<!-- placeholder to force blank line after table --> <!-- endInclude -->

### ITS Theme supported statuses

<!-- placeholder to force blank line before table --> <!-- include: DocsSamplesForStatuses.test.DefaultStatuses_its-theme-supported-statuses.approved.md -->

| Status Character | Status Name<br>`status.name includes...`<br>`sort by status.name`<br>`group by status.name` | Next Status Character | Status Type<br>`status.type includes...`<br>`sort by status.type`<br>`group by status.type` | Needs Custom Styling |
| ----- | ----- | ----- | ----- | ----- |
| `>` | Forward | `x` | `TODO` | Yes |
| `D` | Deferred/Scheduled | `x` | `TODO` | Yes |
| `?` | Question | `x` | `TODO` | Yes |
| `!` | Important | `x` | `TODO` | Yes |
| `+` | Add | `x` | `TODO` | Yes |
| `R` | Research | `x` | `TODO` | Yes |
| `i` | Idea | `x` | `TODO` | Yes |
| `B` | Brainstorm | `x` | `TODO` | Yes |
| `P` | Pro | `x` | `TODO` | Yes |
| `C` | Con | `x` | `TODO` | Yes |
| `I` | Info | `x` | `TODO` | Yes |
| `Q` | Quote | `x` | `TODO` | Yes |
| `N` | Note | `x` | `TODO` | Yes |
| `b` | Bookmark | `x` | `TODO` | Yes |
| `p` | Paraphrase | `x` | `TODO` | Yes |
| `E` | Example | `x` | `TODO` | Yes |
| `L` | Location | `x` | `TODO` | Yes |
| `A` | Answer | `x` | `TODO` | Yes |
| `r` | Reward | `x` | `TODO` | Yes |
| `c` | Choice | `x` | `TODO` | Yes |

<!-- placeholder to force blank line after table --> <!-- endInclude -->

## Using Statuses

### Editing your tasks

The [‘Create or edit Task’ Modal]({{ site.baseurl }}{% link getting-started/create-or-edit-task.md %}#status-and-done-on) allows you to change the status of a task.

### Related commands

{: .info }
There are not yet any new commands for applying custom statuses.
We are tracking this in [issue #1486](https://github.com/obsidian-tasks-group/obsidian-tasks/issues/1486) .

### Related searches

- `done` - matches tasks status types `TODO` and `CANCELLED`
- `not done` - matches tasks with status types `TODO` and `IN_PROGRESS`
- **Status Name**
  - `status.name` text search
  - `sort by status.name`
  - `group by status.name`
- **Status Type**
  - `status.type` text search
  - `sort by status.type`
  - `group by status.type`

For details, see [Filters for Task Statuses]({{ site.baseurl }}{% link queries/filters.md %}#filters-for-task-statuses)

{: .info }
We envisage adding `status.symbol`.

## Related pages

- [How to set up your custom statuses]({{ site.baseurl }}{% link how-to/set-up-custom-statuses.md %}).
- [How to style custom statuses]({{ site.baseurl }}{% link how-to/style-custom-statuses.md %}).

---

## Credit: Sytone and the 'Tasks SQL Powered' plugin

This plugin's implementation of reading, searching and editing custom statuses was entirely made possible by the work of [Sytone](https://github.com/sytone) and his fork of Tasks called ['Tasks SQL Powered'](https://github.com/sytone/obsidian-tasks-x). [^task-x-version]

Where code in Tasks has been copied from 'Tasks SQL Powered', Sytone has been specifically credited as a co-author, that is, joint author, and these commits can be seen on the GitHub site: [Commits "Co-Authored-By: Sytone"](https://github.com/search?q=repo%3Aobsidian-tasks-group%2Fobsidian-tasks+%22Co-Authored-By%3A+Sytone%22&type=commits).

Subsequently, the custom statuses implementation in Tasks has diverged from the 'Tasks SQL Powered' significantly. However, none of the new features and fixes would have been possible without Sytone's foundation work, for which we are very grateful.

[^task-x-version]: 'Tasks SQL Powered' as of [revision 2c0b659](https://github.com/sytone/obsidian-tasks-x/tree/2c0b659457cc80806ff18585c955496c76861b87) on 2 August 2022
