---
layout: default
title: Dates
nav_order: 3
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

## 📅 Due

Tasks can have dates by when they must be done: due dates.
In order to specify the due date of a task, you must append the "due date signifier 📅" followed by the date it is due to the end of the task.
The date must be in the format `YYYY-MM-DD`, meaning `Year-Month-Day` with leading zeros.
For example: `📅 2021-04-09` means the task is due on the 9th of April, 2021.

```markdown
- [ ] take out the trash 📅 2021-04-09
```

---

## ⏳ Scheduled

Tasks can have dates on which you plan to work on them: scheduled dates.
Scheduled dates are different from due dates as you can schedule to finish a task before it is due.

Scheduled dates use an hourglass emoji instead of a calendar emoji.

```markdown
- [ ] take out the trash ⏳ 2021-04-09
```

See [Use Filename as Default Date]({{ site.baseurl }}{% link getting-started/use-filename-as-default-date.md %}) for how to optionally make Tasks use any dates in file names as the scheduled date for all undated tasks in that file.

> 'Use Filename as Default Date' was introduced in Tasks 1.18.0.

---

## 🛫 Start

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

## Finding mistakes in dates

Tasks does not automatically report any problem tasks that have invalid dates, such as on the 32nd day of a month. These task will silently not be found by date-based searches.

However, it is possible to search for any tasks with invalid dates in your vault: see
[Finding Tasks with Invalid Dates]({{ site.baseurl }}{% link queries/filters.md %}#finding-tasks-with-invalid-dates).
