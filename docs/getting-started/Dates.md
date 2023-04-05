---
layout: default
title: Dates
nav_order: 4
parent: Getting Started
---

# Dates
{: .no_toc }

<details open markdown="block">
  <summary>
    Table of contents
  </summary>
  {: .text-delta }
1. TOC
{:toc}
</details>

## When to work on a task

This section explains the different types of date that you can add to task lines, in order to tell Tasks when you wish/need to do the work.

You don't have to use all available dates.
Maybe due dates are sufficient for you.
Don't over-engineer your task management.

<div class="code-example" markdown="1">
Info
{: .label .label-blue }
Instead of adding an emoji and a date manually, you can use the `Tasks: Create or edit` command when creating or editing a task.
When you use the command, you can also set dates like "Monday", "tomorrow", or "next week" and Tasks will automatically save the date in the correct format.
You can find out more in [‘Create or edit Task’ Modal]({{ site.baseurl }}{% link getting-started/create-or-edit-task.md %}).
</div>

<div class="code-example" markdown="1">
Info
{: .label .label-blue }
If you prefer to type, it is now very easy to add emojis and other information for you tasks using [Intelligent Auto-Suggest]({{ site.baseurl }}{% link getting-started/auto-suggest.md %}).
</div>

---

### 📅 Due

Tasks can have dates by when they must be done: due dates.
In order to specify the due date of a task, you must append the "due date signifier 📅" followed by the date it is due to the end of the task.
The date must be in the format `YYYY-MM-DD`, meaning `Year-Month-Day` with leading zeros.
For example: `📅 2021-04-09` means the task is due on the 9th of April, 2021.

```markdown
- [ ] take out the trash 📅 2021-04-09
```

---

### ⏳ Scheduled

Tasks can have dates on which you plan to work on them: scheduled dates.
Scheduled dates are different from due dates as you can schedule to finish a task before it is due.

Scheduled dates use an hourglass emoji instead of a calendar emoji.

```markdown
- [ ] take out the trash ⏳ 2021-04-09
```

See [Use Filename as Default Date]({{ site.baseurl }}{% link getting-started/use-filename-as-default-date.md %}) for how to optionally make Tasks use any dates in file names as the scheduled date for all undated tasks in that file.

{: .released }
'Use Filename as Default Date' was introduced in Tasks 1.18.0.

---

### 🛫 Start

It can happen that you cannot work on a task before a certain date.
Or you want to hide a task until a certain date.
In that case you can use start dates.

Start dates use a departing airplane emoji instead of a calendar emoji.

```markdown
- [ ] take out the trash 🛫 2021-04-09
```

When [filtering]({{ site.baseurl }}{% link queries/filters.md %}#start-date) queries by start date,
the result will include tasks without a start date.
This way, you can use the start date as a filter to filter out any tasks that you cannot yet work on.

Such filter could be:

````markdown
```tasks
starts before tomorrow
```
````

---

## Track task histories

This section explains the types of dates that Tasks can add for you automatically.

### Date-tracking settings

The date types in this section are optional.

![Settings for tracking task histories](../../images/settings-optional-date-fields.png)

Image of the default settings for tracking task histories.

### ➕ Created

{: .released }
Created date was introduced in Tasks 2.0.0.

If you enable 'Set created date on every added task' in settings (and restart Obsidian), the Tasks plugin will help you track when your tasks were created.

See the screenshot above.

The following Tasks facilities automatically add created dates to tasks (if the setting is enabled):

- [‘Create or edit Task’ Modal]({{ site.baseurl }}{% link getting-started/create-or-edit-task.md %}), when it creates a brand new task
- When you complete a [recurring task]({{ site.baseurl }}{% link getting-started/recurring-tasks.md %}), the new task's created date will show the date it was added.

Created dates use a heavy plus emoji.

```markdown
- [ ] take out the trash ➕ 2021-04-09
```

{: .info }
[Auto-Suggest]({{ site.baseurl }}{% link getting-started/auto-suggest.md %}) does not yet support the created date field. We are tracking this in [issue #1743](https://github.com/obsidian-tasks-group/obsidian-tasks/issues/1743).

### ✅ Done

Unless you disable 'Set done date on every completed task' in settings (and restart Obsidian), the Tasks plugin will help you track when your tasks were completed.

See the screenshot above.

Done dates use a white check-mark emoji.

```markdown
- [x] take out the trash ✅ 2021-04-09
```

---

## Finding mistakes in dates on task lines

Tasks does not automatically report any problem tasks that have invalid dates, such as on the 32nd day of a month. These task will silently not be found by date-based searches.

However, it is possible to search for any tasks with invalid dates in your vault: see
[Finding Tasks with Invalid Dates]({{ site.baseurl }}{% link queries/filters.md %}#finding-tasks-with-invalid-dates).

{: .warning }
The date values on task lines must be calendar or absolute dates, referring to a specific year, month and day. Text such as `📅 today` is not understood by the Tasks plugin, and will not be found in searches.
