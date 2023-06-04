---
publish: true
---

# Grouping

---

## Contents

This page is long. Here are some links to the main sections:

- [[#Basics]
- [[#Group by Task Statuses]
- [[#Group by Dates in Tasks]
- [[#Group by Other Task Properties]
- [[#Group by File Properties]
- [[#Multiple groups]
- [[#Refining groups]
- [[#Notes]
- [[#Screenshots]
- [[#Examples]

---

## Basics

> [!released]
Introduced in Tasks 1.6.0.

By default, Tasks displays tasks in a single list.

To divide the matching tasks up with headings, you can add `group by` lines to the query.

---

## Group by Task Statuses

For more information, including adding your own customised statuses, see [[Statuses]].

### Status

- `group by status` (Done or Todo, which is capitalized for visibility in the headings)
  - Note that the Done group is displayed before the Todo group,
      which differs from the Sorting ordering of this property.

### Status Name

- `group by status.name`
  - This groups by the names you give to your custom statuses, in alphabetical order.

> [!released]
`group by status.name` was introduced in Tasks 1.23.0.

### Status Type

- `group by status.type`
  - This groups by the types you have given to your custom statuses.
  - In order to impose a useful sort order, the types are prefixed with a number, so the groups will appear in this order, and with these group names:
    - `1 IN_PROGRESS`
    - `2 TODO`
    - `3 DONE`
    - `4 CANCELLED`
    - `5 NON_TASK`

> [!released]
`group by status.type` was introduced in Tasks 1.23.0.

---

## Group by Dates in Tasks

### Done Date

- `group by done`
  - The done date of the task, including the week-day, or `No done date`.

> [!released]
>
> - `done` grouping option was introduced in Tasks 1.7.0.

### Due Date

- `group by due`
  - The due date of the task, including the week-day, or `No due date`.

> [!released]
>
> - `due` grouping option was introduced in Tasks 1.7.0.

### Scheduled Date

- `group by scheduled`
  - The scheduled date of the task, including the week-day, or `No scheduled date`.

> [!released]
>
> - `scheduled` grouping option was introduced in Tasks 1.7.0.

### Start Date

- `group by start`
  - The start date of the task, including the week-day, or `No start date`.

> [!released]
>
> - `start` grouping option was introduced in Tasks 1.7.0.

### Created Date

- `group by created`
  - The created date of the task, including the week-day, or `No created date`.

> [!released]
`created` grouping option was introduced in Tasks 2.0.0.

### Happens

- `group by happens`
  - The earliest of start date, scheduled date, and due date, including the week-day, or `No happens date` if none of those are set.

> [!released]
`happens` grouping option was introduced in Tasks 1.11.0.

---

## Group by Other Task Properties

### Priority

- `group by priority`
  - The priority of the task, namely one of:
    - `Priority 0: Highest`
    - `Priority 1: High`
    - `Priority 2: Medium`
    - `Priority 3: None`
    - `Priority 4: Low`
    - `Priority 5: Lowest`

> [!released]
>
> - `priority` grouping option was introduced in Tasks 1.11.0.

### Urgency

- `group by urgency` ([[Urgency|urgency]])
  - Currently, the groups run from the lowest urgency to highest.
  - You can reverse this with `group by urgency reverse`.
  - In a future release, the default group order will become from the highest urgency to lowest.

> [!released]
>
> - `urgency` grouping option was introduced in Tasks 3.6.0.

### Recurrence

- `group by recurring`
  - Whether the task is recurring: either `Recurring` or `Not Recurring`.
- `group by recurrence`
  - The recurrence rule of the task, for example `every week on Sunday`, or `None` for non-recurring tasks.
  - Note that the text displayed is generated programmatically and standardised, and so may not exactly match the text in any manually typed tasks. For example, a task with `🔁 every Sunday` is grouped in `every week on Sunday`.

> [!released]
>
> - `recurring` and `recurrence` grouping options were introduced in Tasks 1.11.0.

### Tags

- `group by tags`
  - The tags of the tasks or `(No tags)`. If the task has multiple tags, it will show up under every tag.

> [!released]
>
> - `tags` grouping option was introduced in Tasks 1.10.0.

---

## Group by File Properties

### File Path

- `group by path` (the path to the file that contains the task, that is, the folder and the filename)

### Root

- `group by root` (the top-level folder of the file that contains the task, that is, the first directory in the path, which will be `/` for files in root of the vault)

> [!released]
`root` grouping option was introduced in Tasks 1.11.0.

### Folder

- `group by folder` (the folder to the file that contains the task, which will be `/` for files in root of the vault)

### File Name

- `group by filename` (the link to the file that contains the task, without the `.md` extension)
  - Note that tasks from different notes with the same file name will be grouped together in the same group.

### Backlink

- `group by backlink` (the text that would be shown in the task's [[Backlinks|backlink]], combining the task's file name and heading, but with no link added)

### Heading

- `group by heading` (the heading preceding the task, or `(No heading)` if there are no headings in the file)

---

## Multiple groups

You can add multiple `group by` query options, each on an extra line.
This will create nested groups.
The first group has the highest priority.

Each subsequent `group by` will generate a new heading-level within the existing grouping:

- First `group by` is displayed as `h4` headings
- Second `group by` is displayed as `h5` headings
- Third and subsequent `group by` are displayed as `h6` headings

See the [screenshots below](#screenshots) for how this looks in practice.

> [!info]
> Headings are displayed in case-sensitive alphabetical order, not the original order.

---

## Refining groups

### Reversing groups

> [!released]
> Reversing of group headings was introduced in Tasks 3.7.0.

After the name of the property that you want to group by, you can add the `reverse` keyword.
If given, the group headings will be reversed for that property.

For example:

- `group by due` will sort the group headings:
  - from **oldest** due date first...
  - to **newest** due date last
- `group by due reverse` will sort the group headings:
  - from **newest** due date first...
  - to **oldest** due date last

> [!tip]
> The `reverse` keyword controls the order that group headings are displayed.
>
> The [[Sorting|sort by]] facility, by contrast, controls the order in which displays are displayed *inside* each group.

### Limiting group size

You can limit the number of tasks in each group, perhaps to work on the most important things first.

See [[Limiting#Limit number of tasks in each group|Limit number of tasks in each group]].

---

## Notes

> [!info]
> The order of operations ensures that grouping does not modify which tasks are displayed, for example when the `limit` option is used:
>
> 1. all the filter instructions are run
> 1. then any sorting instructions are run
> 1. then any `limit` instructions are run
> 1. then finally any grouping instructions are run

---

## Screenshots

### Before

Here is an example Tasks result, without any `group by` commands:

![Tasks Ungrouped](../images/tasks_ungrouped.png)
Tasks not grouped.

### After

And here is what this might look like, when grouped by folder, filename and heading:

![Tasks Grouped](../images/tasks_grouped.png)
Tasks grouped.

---

## Examples

Give me three levels of grouping, to indicate the locations of my tasks:

    ```tasks
    not done
    group by folder
    group by filename
    group by heading
    ```

Show me tasks I need to do today - and put today's tasks first, for visibility:

    ```tasks
    not done
    due before tomorrow
    group by due reverse
    ```
