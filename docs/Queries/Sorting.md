---
publish: true
---

# Sorting

<!-- NEW_QUERY_INSTRUCTION_EDIT_REQUIRED -->

## Contents

This page is long. Here are some links to the main sections:

- [[#Basics]]
- [[#Sort by Task Statuses]]
- [[#Sort by Dates in Tasks]]
- [[#Sort by Other Task Properties]]
- [[#Sort by File Properties]]
- [[#Multiple sort criteria]]
- [[#Notes]]
- [[#Reverse sorting]]
- [[#Examples]]

## Basics

By default Tasks sorts tasks by [[Urgency|a calculated score we call "urgency"]].

To sort the results of a query different from the default, you must add at least one `sort by` line to the query.

## Sort by Task Statuses

For more information, including adding your own customised statuses, see [[Statuses]].

### Status

- `sort by status` (done or todo)

### Status Name

- `sort by status.name` (Done, Todo, Cancelled, In Progress, Unknown, My very important custom status, etc - sorted alphabetically)

> [!released]
`sort by status.name` was introduced in Tasks 1.23.0.

### Status Type

- `sort by status.type` (Sorted in the order `IN_PROGRESS`, `TODO`, `DONE`, `CANCELLED` then `NON_TASK`)

> [!released]
`sort by status.type` was introduced in Tasks 1.23.0.

## Sort by Dates in Tasks

### Done Date

- `sort by done` (the date when the task was done)

### Due Date

- `sort by due` (the date when the task is due)

### Scheduled Date

- `sort by scheduled` (the date when the task is scheduled)

### Start Date

- `sort by start` (the date when the task starts)

### Created Date

- `sort by created` (the date when the task was created)

> [!released]
`sort by created` was introduced in Tasks 2.0.0.

### Happens

- `sort by happens` (the earliest of start date, scheduled date, and due date)

> [!released]
`sort by happens` was introduced in Tasks 1.21.0.

## Sort by Other Task Properties

### Description

- `sort by description` (the description of the task)

### Priority

- `sort by priority` (priority of the task; "low" is below "none": [[Priority|priorities]])

### Urgency

- `sort by urgency` ([[Urgency|urgency]])

### Recurrence

- `sort by recurring` (recurring tasks sort before non-recurring ones: [[Recurring Tasks]])

### Tags

See [[Tags]] for important information about how tags behave in the Tasks plugin.

- `sort by tag` (the description of the task)

If you want to sort by tags, by default it will sort by the first tag found in the description. If you want to sort by a tag that comes after that then you can specify the index at the end of the query. All tasks should have the same amount of tags for optimal sorting and the tags in the same order. The index starts from 1 which is also the default.

For example this query will sort by the second tag found in the description.

    ```tasks
    sort by tag 2
    ```

> [!released]
Tag sorting was introduced in Tasks 1.6.0.

## Sort by File Properties

### File Path

- `sort by path` (the path to the file that contains the task)

### Root

It is not currently possible to sort by the top-level folder that contains the task.

### Folder

It is not currently possible to sort by the folder that contains the task.

### File Name

- `sort by filename` (the filename of the file that contains the task, with its extension)
  - Note that tasks from different notes with the same file name will be sorter.

> [!released]
`sort by filename` was introduced in Tasks 1.21.0.

### Heading

- `sort by sort by heading` (the heading preceding the task; files with empty headings sort before other tasks)

> [!released]
`sort by heading` was introduced in Tasks 1.21.0.

## Multiple sort criteria

You can add multiple `sort by` query options, each on an extra line.
The first sort has the highest priority.
Each subsequent `sort` will sort within the existing sorting.

## Notes

> [!info]
> If you want tasks to be sorted the way they were sorted before urgency was introduced,
add the following `sort` expressions to your queries:

    ```tasks
    sort by status
    sort by due
    sort by path
    ```

---

> [!info]
> Sorting by description should take into account `[[Links]]` and `[Links with an|Alias]` (note pipe).
It should also take into account `*italics*` and `==highlights==`.
It sorts by the text that's visible in preview mode.

## Reverse sorting

After the name of the property that you want to sort by, you can add the `reverse` keyword.
If given, the sort order will be reverse for that property.

Note that `reverse` will reverse the entire result set.
For example, when you `sort by done reverse` and your query results contain tasks that do not have a done date, then those tasks without a done date will be listed first.

## Examples

    ```tasks
    not done
    due today
    sort by due
    ```

    ```tasks
    done
    sort by done reverse
    ```

    ```tasks
    not done
    due before next monday
    sort by status
    sort by description reverse
    sort by path
    ```
