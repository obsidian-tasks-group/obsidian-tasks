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

| Status Character    | Status Name | Next Status Character | Needs Custom Styling |
| ------------------- | ----------- | --------------------- | -------------------- |
| `space` | Todo | `x` | No |
| `/` | In Progress | `x` | Yes |
| `x` | Done | `space` | No |
| `-` | Cancelled | `space` | Yes |

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

| Status Character    | Status Name | Next Status Character | Needs Custom Styling |
| ------------------- | ----------- | --------------------- | -------------------- |
| `>` | Forwarded | `x` | Yes |
| `<` | Schedule | `x` | Yes |
| `?` | Question | `x` | Yes |
| `!` | Important | `x` | Yes |
| `"` | Quote | `x` | Yes |
| `-` | Canceled | `x` | Yes |
| `*` | Star | `x` | Yes |
| `l` | Location | `x` | Yes |
| `i` | Info | `x` | Yes |
| `S` | Amount/savings/money | `x` | Yes |
| `I` | Idea/lightbulb | `x` | Yes |
| `f` | Fire | `x` | Yes |
| `k` | Key | `x` | Yes |
| `u` | Up | `x` | Yes |
| `d` | Down | `x` | Yes |
| `w` | Win | `x` | Yes |
| `p` | Pros | `x` | Yes |
| `c` | Cons | `x` | Yes |
| `b` | Bookmark | `x` | Yes |

<!-- placeholder to force blank line after table --> <!-- endInclude -->

### ITS Theme supported statuses

<!-- placeholder to force blank line before table --> <!-- include: DocsSamplesForStatuses.test.DefaultStatuses_its-theme-supported-statuses.approved.md -->

| Status Character    | Status Name | Next Status Character | Needs Custom Styling |
| ------------------- | ----------- | --------------------- | -------------------- |
| `>` | Forward | `x` | Yes |
| `D` | Deferred/Scheduled | `x` | Yes |
| `?` | Question | `x` | Yes |
| `!` | Important | `x` | Yes |
| `+` | Add | `x` | Yes |
| `R` | Research | `x` | Yes |
| `i` | Idea | `x` | Yes |
| `B` | Brainstorm | `x` | Yes |
| `P` | Pro | `x` | Yes |
| `C` | Con | `x` | Yes |
| `I` | Info | `x` | Yes |
| `Q` | Quote | `x` | Yes |
| `N` | Note | `x` | Yes |
| `b` | Bookmark | `x` | Yes |
| `p` | Paraphrase | `x` | Yes |
| `E` | Example | `x` | Yes |
| `L` | Location | `x` | Yes |
| `A` | Answer | `x` | Yes |
| `r` | Reward | `x` | Yes |
| `c` | Choice | `x` | Yes |

<!-- placeholder to force blank line after table --> <!-- endInclude -->

## Using Statuses

### Editing your tasks

The [‘Create or edit Task’ Modal]({{ site.baseurl }}{% link getting-started/create-or-edit-task.md %}#status-and-done-on) allows you to change the status of a task.

### Related commands

{: .info }
There are not yet any new commands for applying custom statuses.
We are tracking this in [issue #1486](https://github.com/obsidian-tasks-group/obsidian-tasks/issues/1486) .

### Related searches

- `done` - matches tasks with anything except space as the status symbol
- `not done` - matches task with a space as the status symbol
- `status.name` text search
- `sort by status.name`

For details, see [Filters for Task Statuses]({{ site.baseurl }}{% link queries/filters.md %}#filters-for-task-statuses)

{: .info }
We envisage adding `status.symbol`.

## Related pages

- [How to set up your custom statuses]({{ site.baseurl }}{% link how-to/set-up-custom-statuses.md %}).
- [How to style custom statuses]({{ site.baseurl }}{% link how-to/style-custom-statuses.md %}).

---

## Credit: Sytone and the 'Tasks SQL Powered' plugin

This plugin's implementation of reading, searching and editing custom statuses was entirely made possible by the work of [Sytone](https://github.com/sytone) and his fork of Tasks called ['Tasks SQL Powered'](https://github.com/sytone/obsidian-tasks-x).

When code in Tasks has been copied from 'Tasks SQL Powered', Sytone has been specifically credited as a co-author, that is, joint author, and these commits can be seen on the GitHub site: [Commits "Co-Authored-By: Sytone"](https://github.com/search?q=repo%3Aobsidian-tasks-group%2Fobsidian-tasks+%22Co-Authored-By%3A+Sytone%22&type=commits).

### Differences between 'Tasks' and 'Tasks SQL Powered'

These two plugins are developed with justifiably different requirements:

- As a released plugin, a priority of 'Tasks' is ensuring **backwards compatibility** with previous plugin releases, to avoid changing any (non-broken) behaviour of users' existing searches.
- As an independent fork of 'Tasks', 'Tasks SQL Powered' is free to make changes to existing Tasks behaviour that could well be seen by users as improvements, and is **not required to maintain backwards compatibility** with 'Tasks'.

The notes below may help anyone who is switching their vaults between the 'Tasks' and 'Tasks SQL Powered' to update their tasks or their queries to retain their intended results.

They describe the changes made when back-porting the 'Tasks SQL Powered' custom status code, to retain backwards compatibility.

| Topic                                                 | 'Tasks SQL Powered' [^task-x-version]                                                                                                                                                                                                                  | 'Tasks'                                                                                                        |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------- |
| `done`, `not done`                                    | Only tasks with status characters `x` and `X` are treated as `done`.                                                                                                                                                                                   | All tasks with status characters other than `space` are treated as `done`  - for backwards compatibility.      |
| `sort by status`                                      | Case-sensitive sort of the status character, in reverse alphabetical order. Unrecognised status characters are treated as empty, and appear before all other statuses.                                                                                 | All tasks with `space` status character sort first, then all other tasks  - for backwards compatibility.       |
| `group by status`                                     | Groups by the name of the status, for example `Cancelled`, `Done`, `In Progress`, `EMPTY`.                                                                                                                                                             | Groups by either `Todo` if the status character is a space, or otherwise `Done` - for backwards compatibility. |
| Handling unknown status characters, for example `[%]` | Stores and displays the task with no status character:<br>- this affects any custom CSS styling,<br>- toggling changes the line to `[]` - with no status character.<br>(The fix is to ensure all status characters are added in the plugin's settings) | Retains any unknown status characters:<br> - styling and toggling are unchanged                                |

[^task-x-version]: 'Tasks SQL Powered' as of [revision 2c0b659](https://github.com/sytone/obsidian-tasks-x/tree/2c0b659457cc80806ff18585c955496c76861b87) on 2 August 2022
