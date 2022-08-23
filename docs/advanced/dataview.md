---
layout: default
title: Dataview
nav_order: 6
parent: Advanced
has_toc: false
---

# Combining Dataview and Tasks

The [Dataview](https://github.com/blacksmithgu/dataview) plugin provides many data analysis features for Obsidian vaults, including queries about tasks.
This page only describes settings to maximize compatibility between Dataview and Tasks; for all other information on Dataview, including Dataview's names for the task emoji fields,
please see its [documentation](https://blacksmithgu.github.io/obsidian-dataview/data-annotation/#tasks).

> As of Dataview 0.5.42, all Tasks emoji fields except recurrence can be queried through Dataview or dataviewjs. Information is in the [Dataview documentation](https://blacksmithgu.github.io/obsidian-dataview/data-annotation/#tasks).

## Automatic Task Completion

> Introduced in Dataview 0.5.42

If you use the "Set Done Date on every completed task" option in Tasks, you can configure Dataview so that clicking a task's checkbox from a Dataview query result will have the same behavior as clicking the checkbox in a Task query result or using the command `Tasks: Toggle Done`.

0. Make sure Dataview is up to date by checking for updates in "Settings" -> "Community Plugins" -> "Check for Updates".
1. In "Settings" -> "Dataview", scroll down to and enable the "Automatic Task Completion" setting.
2. Just below the "Automatic Task Completion" setting, enable the "Use Emoji Shortcut for Completion" setting.
3. Close and then reopen Obsidian.

Now, in Live Preview and Reading View, clicking a checkbox in a Dataview TASK query result will add or remove the `✅ YYYY-MM-DD` completion date from a task's text, just like doing so from a Tasks query.
