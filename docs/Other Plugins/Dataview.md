---
publish: true
---

# Combining Dataview and Tasks

<span class="related-pages">#plugin/dataview #task-format/dataview </span>

## Tasks and dataview

> [!released]
> Parsing of dataview format was introduced in Tasks 3.3.0.

Tasks now has partial support for reading data in [[Dataview Format]].

## Increasing Dataview compatibility with Tasks

The [Dataview](https://github.com/blacksmithgu/obsidian-dataview) plugin provides many data analysis features for Obsidian vaults, including queries about tasks.
This section only describes settings to maximize compatibility between Dataview and Tasks; for all other information on Dataview, including Dataview's names for the task emoji fields,
please see its [documentation](https://blacksmithgu.github.io/obsidian-dataview/data-annotation/#tasks).

> As of Dataview 0.5.43, all Tasks emoji fields **except recurrence** can be queried through Dataview or dataviewjs. Information is in Dataview's [Metadata on Tasks and Lists](https://blacksmithgu.github.io/obsidian-dataview/annotation/metadata-tasks/) page .

### Automatic Task Completion

> [!released]
Introduced in Dataview 0.5.42

If you use the "Set Done Date on every completed task" option in Tasks, you can configure Dataview so that clicking a task's checkbox from a Dataview query result will add or remove the `✅ YYYY-MM-DD` completion date just like clicking the checkbox in a Task query result or using the command `Tasks: Toggle Done`.

0. Make sure Dataview is up to date by checking for updates in "Settings" -> "Community Plugins" -> "Check for Updates".
1. In "Settings" -> "Dataview", scroll down to and enable the "Automatic Task Completion" setting.
2. Just below the "Automatic Task Completion" setting, enable the "Use Emoji Shortcut for Completion" setting.
3. Close and then reopen Obsidian.

![Dataview settings page with Tasks-style done dates enabled](../images/dataview-settings.png)
_Note: This is the Dataview settings page, not the Tasks settings page._

---

> [!warning]
> Dataview does not understand recurring tasks. Checking off a recurring task from a Dataview TASK query will add a done date but will not generate a new instance of that recurring task.
To get the correct behavior for recurring tasks from Dataview TASK query results, click the text of the task (not the checkbox) to go to the file where the task is written,
and then use the "Tasks: Toggle Done" command or click the checkbox from there.

## Related pages

- [[How to get tasks in current file|How to get all tasks in the current file]] - an example of using the Dataview plugin to generate Tasks code blocks, to do things that Tasks alone cannot do.
