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

## Introduction

### Standard Markdown task statuses

Tasks have a status.

The convention in markdown is:

```text
- [ ] I am a task that is not yet done
- [x] I am a task that has been done
```

### Custom Markdown task statuses

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
| `group by status`                                     | Groups by the name of the status, for example `Cancelled`, `Done`, `In Progress`, `EMPTY`.                                                                                                                                                             | Groups by either `Todo` if the status character is a space, or otherwise `Done` - for backwards compatibility. |
| Handling unknown status characters, for example `[%]` | Stores and displays the task with no status character:<br>- this affects any custom CSS styling,<br>- toggling changes the line to `[]` - with no status character.<br>(The fix is to ensure all status characters are added in the plugin's settings) | Retains any unknown status characters:<br> - styling and toggling are unchanged                                |

[^task-x-version]: 'Tasks SQL Powered' as of [revision 2c0b659](https://github.com/sytone/obsidian-tasks-x/tree/2c0b659457cc80806ff18585c955496c76861b87) on 2 August 2022
