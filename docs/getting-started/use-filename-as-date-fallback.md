---
layout: default
title: Use Filename as Date Fallback
nav_order: 5
parent: Getting Started
has_toc: false
---

# Use Filename as Date Fallback

You can automatically set a scheduled date for tasks based on the name of its file. This feature can be enabled in the
settings : `Use filename as date fallback` (requires a restart of Obsidian).

This allows you, for instance, to make all the tasks in your daily notes to be considered as scheduled. You can then
query them using [filters]({{ site.baseurl }}{% link queries/filters.md %}) on the scheduled date (`scheduled`
, `happens`).

Example query :

````text
```tasks
scheduled before today
not done
```
````

<div class="code-example" markdown="1">
Info
{: .label .label-blue }
The task not visually modified in the file : the scheduled date is only implied. It will however appear in the
[edit dialog]({{ site.baseurl }}{% link getting-started/create-or-edit-task.md %}).
</div>

## Rules

For the scheduled date to be automatically set from the file name, the following rules apply :

- the task has no existing scheduled date, due date or start date.
- the file name contains a date in the format `YYYY-MM-DD` or `YYYYMMDD`.
- the file is in one of the configured folders or its sub-folders if that setting is enabled.

Examples of file names :

```text
daily/2022-10-12 Wednesday.md
meetings/rd. 2022-09-07.md
20220612 - random thoughts.md
```

### Folders setting

If the `Folders with date fallback` field is left empty in the settings dialog, date fallback is applied to all the
files in the vault. A comma-separated list of folders can be entered to limit the scope. Date fallback will only be done
is the specified folders and their subfolders.

Examples:

| Folders setting | Matching files                                                                    | Not matching                           |
|-----------------|-----------------------------------------------------------------------------------|----------------------------------------|
| (empty)         | 20221022.md<br/>daily/20221012.md                                                 |                                        |
| daily           | daily/2022-10-12.md<br/>daily/notes/2022-10-12.md                                 | 20221022.md<br/>meetings/2022-10-12.md |
| daily,prj/daily | daily/2022-10-12.md<br/>prj/daily/2022-10-12.md<br/>prj/daily/notes/2022-06-12.md | 20221022.md<br/>meetings/2022-10-12.md |

<div class="code-example" markdown="1">
Warning
{: .label .label-yellow }
Folders with a comma (`,`) in their name are not supported.
</div>
