---
publish: true
---

# Sorting

## Basics

By default Tasks sorts tasks by [[Urgency|a calculated score we call "urgency"]].

To sort the results of a query different from the default, you must add at least one `sort by` line to the query.

## Available sorting properties

You can sort tasks by the following properties.

### File locations

1. `path` (the path to the file that contains the task)
1. `filename` (the filename of the file that contains the task, with its extension)
    - Note that tasks from different notes with the same file name will be sorter.

> [!released]
`sort by filename` was introduced in Tasks 1.21.0.

### File contents

1. `sort by heading` (the heading preceding the task; files with empty headings sort before other tasks)

> [!released]
`sort by heading` was introduced in Tasks 1.21.0.

### Task date properties

1. `created` (the date when the task was created)
1. `start` (the date when the task starts)
1. `scheduled` (the date when the task is scheduled)
1. `due` (the date when the task is due)
1. `done` (the date when the task was done)
1. `happens` (the earliest of start date, scheduled date, and due date)

> [!released]
`sort by happens` was introduced in Tasks 1.21.0.<br>
`sort by created` was introduced in Tasks 2.0.0.

### Task statuses

1. `status` (done or todo)
1. `status.name` (Done, Todo, Cancelled, In Progress, Unknown, My very important custom status, etc - sorted alphabetically)
1. `status.type` (Sorted in the order `IN_PROGRESS`, `TODO`, `DONE`, `CANCELLED` then `NON_TASK`)

> [!released]
`sort by status.name` and `sort by status.type` were introduced in Tasks 1.23.0.

For more information, including adding your own customised statuses, see [[Statuses]].

### Other task properties

1. `description` (the description of the task)
1. `priority` (priority of the task; "low" is below "none": [[Priority|priorities]])
1. `urgency` ([[Urgency|urgency]])
1. `tag` (the description of the task)

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

## Tag sorting

> [!released]
Introduced in Tasks 1.6.0.

If you want to sort by tags, by default it will sort by the first tag found in the description. If you want to sort by a tag that comes after that then you can specify the index at the end of the query. All tasks should have the same amount of tags for optimal sorting and the tags in the same order. The index starts from 1 which is also the default.

For example this query will sort by the second tag found in the description.

    ```tasks
    sort by tag 2
    ```

---

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
