---
publish: true
---

# Settings

## Restart after changing settings

Changes to most of the Tasks settings take immediate effect.

Regrettably, a few require the vault to be reloaded. These settings are marked with `REQUIRES RESTART`.

## Available settings

As the number of options in Tasks has grown, we have documented each setting in the page for the relevant topic.

For convenience, here is a list of all those documentation pages (in the order the options appear in the Tasks Settings pane):

- [[About Task Formats#Selecting the task format|Task Formats]]
- [[Global Filter#Settings for the Global Filter|Global Filter]]
- [[Global Query#Settings|Global Query]]
- [[Status Settings#Overview|Status Settings]]
- [[Dates#Date-tracking settings|Dates]]
- [[Use Filename as Default Date#Settings|Use Filename as Default Date]]
- [[Recurring Tasks#Recurrence Settings|Recurring Tasks]]
- [[Auto-Suggest#Settings|Auto-Suggest]]
- [[Create or edit Task#Turning off keyboard shortcuts|Create or edit Task modal]]
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
- [[Create or edit Task#Date picker|Date picker in Edit Task modal]] (uses native date picker, not affected by this setting)
