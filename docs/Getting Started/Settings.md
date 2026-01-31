---
publish: true
---

# Settings

## Restart after changing settings

Changes to most of the Tasks settings take immediate effect.

Regrettably, a few require the vault to be reloaded. Tasks will show a 'Reload' button automatically if those settings are changed.

## Available settings

As the number of options in Tasks has grown, we have documented each setting in the page for the relevant topic.

For convenience, here is a list of all those documentation pages (in the order the options appear in the Tasks Settings pane):

- [[About Task Formats#Selecting the task format|Task Formats]]
- [[Global Filter#Settings for the Global Filter|Global Filter]]
- [[Global Query#Settings|Global Query]]
- [[Status Settings#Overview|Status Settings]]
- [[Dates#Date-tracking settings|Dates]]
- [[Postponing#Which date field is edited?|Postpone]]
- [[Use Filename as Default Date#Settings|Use Filename as Default Date]]
- [[Recurring Tasks#Recurrence Settings|Recurring Tasks]]
- [[Auto-Suggest#Settings|Auto-Suggest]]
- [[Create or edit Task#Turning off keyboard shortcuts|Create or edit Task modal]]
- [[Layout#Task count location|Search results]]
- [[Settings#First day of week|First day of week]]

## First day of week

Choose which day should be displayed as the first day of the week in date picker calendars.

### Available Options

- **Locale default**: Uses your system locale settings to determine the first day of the week
  - Example: en-US typically starts on Sunday, en-GB starts on Monday
- **Sunday**: Forces calendar to start on Sunday
- **Monday**: Forces calendar to start on Monday
- **Tuesday**: Forces calendar to start on Tuesday
- **Wednesday**: Forces calendar to start on Wednesday
- **Thursday**: Forces calendar to start on Thursday
- **Friday**: Forces calendar to start on Friday
- **Saturday**: Forces calendar to start on Saturday

### Where This Applies

This setting affects the **flatpickr calendar date pickers** used when:

- **Reading mode**: Clicking on any task date field:
  - Due date
  - Scheduled date
  - Start date
  - Done date
  - Cancelled date
  - Created date
- **Query results**: Clicking on dates in Tasks query search results

### Why This Setting Exists

Sometimes device's native calendar starts on one day (for example Monday), but the flatpickr calendar starts on a different day (for example Sunday).

The "Locale default" option automatically detects your system's preference, but you can override it if you prefer a different day.

### See Also

- [[Editing Dates#Date picker on task dates|Date picker on task dates]]
- [[Create or edit Task#Date picker|Date picker in Edit Task modal]]

## Support

Before creating a new bug report or feature request about Settings, please check existing items to avoid duplicates.

You do not need to search manually: the links below are already filtered to the label `"scope: settings"`.

- Check both Open and Closed items.
- If you find an existing item, support it there instead of adding a `+1` comment. See [[About Support and Help#How to support an existing request|How to support an existing request]].

| Type | Open | Closed | Notes |
| --- | --- | --- | --- |
| Issues | [Open](https://github.com/obsidian-tasks-group/obsidian-tasks/issues?q=is%3Aopen%20label%3A%22scope%3A+settings%22%20is%3Aissue%20) | [Closed](https://github.com/obsidian-tasks-group/obsidian-tasks/issues?q=is%3Aclosed%20label%3A%22scope%3A+settings%22%20is%3Aissue%20) | bug reports and feature requests |
| Discussions | [Open](https://github.com/obsidian-tasks-group/obsidian-tasks/discussions/categories/ideas-any-new-feature-requests-go-in-issues-please?discussions_q=is%3Aopen+label%3A%22scope%3A+settings%22+category%3A%22Ideas%3A+Any+New+Feature+Requests+go+in+Issues+please%22+sort%3Atop) | [Closed](https://github.com/obsidian-tasks-group/obsidian-tasks/discussions/categories/ideas-any-new-feature-requests-go-in-issues-please?discussions_q=is%3Aclosed+label%3A%22scope%3A+settings%22+category%3A%22Ideas%3A+Any+New+Feature+Requests+go+in+Issues+please%22+sort%3Atop) | older feature discussions from before late 2022 |

If you do not find an existing item in Issues or Discussions, see [[About Support and Help]] for how to report a bug or request a feature.
