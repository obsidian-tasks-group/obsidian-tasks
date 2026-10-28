---
publish: true
---

# Dates

<span class="related-pages">#feature/dates</span>

## When to work on a task

This section explains the different types of date that you can add to task lines, in order to tell Tasks when you wish/need to do the work.

You don't have to use all available dates.
Maybe due dates are sufficient for you.
Don't over-engineer your task management.

> [!info]
> Instead of adding an emoji and a date manually, you can use the `Tasks: Create or edit` command when creating or editing a task.
When you use the command, you can also set dates like "Monday", "tomorrow", or "next week" and Tasks will automatically save the date in the correct format.
You can find out more in [[Create or edit Task|‘Create or edit Task’ Modal]].

> [!info]
> If you prefer to type, it is now very easy to add emojis and other information for your tasks using [[Auto-Suggest|Intelligent Auto-Suggest]].

<!-- NEW_TASK_FIELD_EDIT_REQUIRED -->

---

### Due date

Tasks can have dates by when they must be done: due dates.

In order to specify the due date of a task, you must append the "due date signifier 📅" followed by the date it is due to the end of the task.
The date must be in the format `YYYY-MM-DD`, meaning `Year-Month-Day` with leading zeros.

For example: `📅 2021-04-09` means the task is due on the 9th of April, 2021.

```markdown
- [ ] take out the trash 📅 2021-04-09
```

Any task date can also include an [[#Optional time in dates|optional 24-hour time]] in `YYYY-MM-DD HH:mm` or `YYYY-MM-DDTHH:mm` format, such as `📅 2021-04-09 14:30`.

Related instructions for use in Tasks query blocks:

- [[Filters#Due Date]]
- [[Sorting#Due Date]]
- [[Grouping#Due Date]]
- Accessible as [[Task Properties#Values for Dates in Tasks|task property]] `task.due`

---

### Scheduled date

Tasks can have dates on which you plan to work on them: scheduled dates.
Scheduled dates are different from due dates as you can schedule to finish a task before it is due.

Scheduled dates use an hourglass emoji: ⏳.

```markdown
- [ ] take out the trash ⏳ 2021-04-09
```

See also:

- [[Use Filename as Default Date]] for how to optionally make Tasks use any dates in file names as the scheduled date for all undated tasks in that file.
- [[Recurring Tasks#Remove scheduled date on recurrence|Remove scheduled date on recurrence]] for controlling whether new recurring tasks are automatically scheduled.

Related instructions for use in Tasks query blocks:

- [[Filters#Scheduled Date]]
- [[Sorting#Scheduled Date]]
- [[Grouping#Scheduled Date]]
- Accessible as [[Task Properties#Values for Dates in Tasks|task property]] `task.scheduled`

---

### Start date

It can happen that you cannot work on a task before a certain date.
Or you want to hide a task until a certain date.
In that case you can use start dates.

Start dates use a departing airplane emoji: 🛫

```markdown
- [ ] take out the trash 🛫 2021-04-09
```

When [[Filters#Start Date|filtering]] queries by start date,
the result will include tasks without a start date.
This way, you can use the start date as a filter to filter out any tasks that you cannot yet work on.

Such filter could be:

````markdown
```tasks
starts before tomorrow
```
````

Related instructions for use in Tasks query blocks:

- [[Filters#Start Date]]
- [[Sorting#Start Date]]
- [[Grouping#Start Date]]
- Accessible as [[Task Properties#Values for Dates in Tasks|task property]] `task.start`

---

### Optional time in dates

> [!released]
> `Optional time in dates` was introduced in Tasks X.Y.Z.

Any task date can include an optional 24-hour time in `YYYY-MM-DD HH:mm` or `YYYY-MM-DDTHH:mm` format, in both [[Tasks Emoji Format]] and [[Dataview Format]]:

```markdown
- [ ] take out the trash 📅 2021-04-09 14:30
- [ ] take out the trash 🛫 2021-04-09T14:30
- [ ] take out the trash [due:: 2021-04-09 14:30]
- [ ] take out the trash [start:: 2021-04-09T14:30]
```

- Existing times and their separator (` ` or `T`) are preserved when completing [[Recurring Tasks|recurring tasks]], postponing tasks, picking a date in the [[Create or edit Task|‘Create or edit Task’ Modal]], or choosing a date from the right-click menu.
- In the [[Create or edit Task|‘Create or edit Task’ Modal]], you can also enter times using natural language such as `now`, `2 hours`, `tomorrow 14:30`, `14:30 tomorrow`, or `tomorrow 2pm` (general time-of-day words without an exact hour, such as `tonight` or `noon`, save the date only).
- [[Sorting#How dates are sorted|Sorting by date]] (`sort by due`, `sort by scheduled`, etc.) is time-aware: on the same day, tasks with a date only (`YYYY-MM-DD`) are treated as `00:00` and ordered before tasks with a later time (`09:00`, `14:30`, etc.).
- See [[#Limitations of time support in dates]] below for how times behave in filters, urgency, and daylight saving transitions.

## Track task histories

This section explains the types of dates that Tasks can add for you automatically.

### Date-tracking settings

The date types in this section are optional.

![Settings for tracking task histories](../../images/settings-optional-date-fields.png)

Image of the default settings for tracking task histories.

### Created date

> [!released]
Created date was introduced in Tasks 2.0.0.

If you enable 'Set created date on every added task' in settings (and restart Obsidian), the Tasks plugin will help you track when your tasks were created.

See the [[#Date-tracking settings|screenshot]] above.

Created dates use a heavy plus emoji: ➕.

```markdown
- [ ] take out the trash ➕ 2021-04-09
```

Related instructions for use in Tasks query blocks:

- [[Filters#Created Date]]
- [[Sorting#Created Date]]
- [[Grouping#Created Date]]
- Accessible as [[Task Properties#Values for Dates in Tasks|task property]] `task.created`

#### Adding Created date to tasks

The following Tasks facilities add created dates to tasks...

... automatically, if created date is enabled:

- [[Create or edit Task|‘Create or edit Task’ Modal]], when it creates a brand new task
- When you complete a [[Recurring Tasks|recurring task]], the new task's created date will show the date it was added.

... upon request, and always enabled:

- Via the `➕ created today` option in [[Auto-Suggest]].
  - Note that this is a long way down the list of suggestions, so you may need to start typing a couple of characters from `created` or `today` to see it.

### Done date

Unless you disable 'Set done date on every completed task' in settings (and restart Obsidian), the Tasks plugin will help you track when your tasks were completed.

See the [[#Date-tracking settings|screenshot]] above.

Done dates use a white check-mark emoji: ✅.

```markdown
- [x] take out the trash ✅ 2021-04-09
```

Related instructions for use in Tasks query blocks:

- [[Filters#Done Date]]
- [[Sorting#Done Date]]
- [[Grouping#Done Date]]
- Accessible as [[Task Properties#Values for Dates in Tasks|task property]] `task.done`

### Cancelled date

> [!released]
> Cancelled date was introduced in Tasks 5.5.0.

Unless you disable 'Set cancelled date on every cancelled task' in settings (and restart Obsidian), the Tasks plugin will help you track when your tasks were cancelled.

See the [[#Date-tracking settings|screenshot]] above.

Cancelled dates use a red cross-mark emoji: ❌.

```markdown
- [-] take out the trash ❌ 2021-04-09
```

Related instructions for use in Tasks query blocks:

- [[Filters#Cancelled Date]]
- [[Sorting#Cancelled Date]]
- [[Grouping#Cancelled Date]]
- Accessible as [[Task Properties#Values for Dates in Tasks|task property]] `task.cancelled`

## Finding mistakes in dates on task lines

Tasks does not automatically report any problem tasks that have invalid dates, such as on the 32nd day of a month or an invalid time like `25:00`. These task will silently not be found by date-based searches.

However, it is possible to search for any tasks with invalid dates in your vault: see
[[Filters#Finding Tasks with Invalid Dates|Finding Tasks with Invalid Dates]].

> [!warning]
The date values on task lines must be calendar or absolute dates, referring to a specific year, month and day. Text such as `📅 today` is not understood by the Tasks plugin, and will not be found in searches.

## Limitations of task date support

### Date format is not configurable

- The date format on task lines is not yet configurable.
- The only formats recognised are `YYYY-MM-DD` (for example `2024-09-17`) and, with an optional 24-hour time, `YYYY-MM-DD HH:mm` or `YYYY-MM-DDTHH:mm` (for example `2024-09-17 14:30` or `2024-09-17T14:30`).
- It is not possible to customise the format of date values on task lines.
- It is also not possible to format dates as links, such as `[[2024-09-17]]`.
- We are tracking this in [discussion #69](https://github.com/obsidian-tasks-group/obsidian-tasks/discussions/69).

### Limitations of time support in dates

> [!released]
> `Optional time in dates` was introduced in Tasks X.Y.Z.

- On task lines, dates with seconds (`:ss`) or time zones (such as `Z` or `+02:00`) are not recognised as dates (for example `📅 2024-09-17 14:30:00` or `📅 2024-09-17T14:30Z` will not be parsed as a due date). In the [[Create or edit Task|‘Create or edit Task’ Modal]], entering a timestamp with seconds or a time zone converts it to local time and saves it as `YYYY-MM-DD HH:mm` (without seconds or time zone).
- In the [[Create or edit Task|‘Create or edit Task’ Modal]], when `Only future dates` is enabled, relative durations must be entered without a leading `in` (for example `2 hours`, `10 days`, or `2 weeks`, rather than `in 2 hours` or `in 10 days`), because the underlying date parser (`chrono-node`) only includes the `in` prefix in its match when `forwardDate` is disabled.
- Date-based [[Filters|filters]] (`due on`, `due before`, `due after`, etc.) and [[Urgency|urgency]] calculations still compare calendar days only and ignore the time component (whereas [[Sorting#How dates are sorted|sorting by date]] is time-aware).
- Because dates and times use the system's local time zone, a time that falls inside a skipped daylight saving spring-forward hour (for example `02:30` on a day when local clocks jump from `02:00` to `03:00`) shifts forward to `03:30`, and for a [[Recurring Tasks|recurring task]], subsequent occurrences keep that shifted time.
- [[Auto-Suggest]] only suggests dates (`YYYY-MM-DD`) without times.
- Automatically added dates (`➕` created, `✅` done, `❌` cancelled) are still recorded without a time (`YYYY-MM-DD`), though you can add a time manually or in the [[Create or edit Task|‘Create or edit Task’ Modal]].
- We are tracking fuller time support in discussions [#607](https://github.com/obsidian-tasks-group/obsidian-tasks/discussions/607) and [#668](https://github.com/obsidian-tasks-group/obsidian-tasks/discussions/668).

### Time-tracking, productivity tracking, pomodoros, notifications and similar out-of-scope

- The following are out-of-scope for the Tasks plugin: time-tracking, productivity tracking, pomodoros, notifications and similar.
- We recorded this in [discussion #2721](https://github.com/obsidian-tasks-group/obsidian-tasks/discussions/2721).

## Support

Before creating a new bug report or feature request about Dates, please check existing items to avoid duplicates.

You do not need to search manually: the links below are already filtered to the label `"scope: task dates and times"`.

- Check both Open and Closed items.
- If you find an existing item, support it there instead of adding a `+1` comment. See [[About Support and Help#How to support an existing request|How to support an existing request]].

| Type | Open | Closed | Notes |
| --- | --- | --- | --- |
| Issues | [Open](https://github.com/obsidian-tasks-group/obsidian-tasks/issues?q=is%3Aopen%20label%3A%22scope%3A+task+dates+and+times%22%20is%3Aissue%20) | [Closed](https://github.com/obsidian-tasks-group/obsidian-tasks/issues?q=is%3Aclosed%20label%3A%22scope%3A+task+dates+and+times%22%20is%3Aissue%20) | bug reports and feature requests |
| Discussions | [Open](https://github.com/obsidian-tasks-group/obsidian-tasks/discussions/categories/ideas-any-new-feature-requests-go-in-issues-please?discussions_q=is%3Aopen+label%3A%22scope%3A+task+dates+and+times%22+category%3A%22Ideas%3A+Any+New+Feature+Requests+go+in+Issues+please%22+sort%3Atop) | [Closed](https://github.com/obsidian-tasks-group/obsidian-tasks/discussions/categories/ideas-any-new-feature-requests-go-in-issues-please?discussions_q=is%3Aclosed+label%3A%22scope%3A+task+dates+and+times%22+category%3A%22Ideas%3A+Any+New+Feature+Requests+go+in+Issues+please%22+sort%3Atop) | older feature discussions from before late 2022 |

If you do not find an existing item in Issues or Discussions, see [[About Support and Help]] for how to report a bug or request a feature.
