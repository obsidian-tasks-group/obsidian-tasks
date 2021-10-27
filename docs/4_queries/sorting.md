---
layout: default
title: Sorting
nav_order: 2
parent: Queries
has_toc: false
---

# Sorting

By default Tasks sorts tasks by:

1. Status
2. Due date
3. Path

To sort the results of a query different from the default, you must add at least one `sort by` line to the query.

You can sort tasks by the following properties:

1. `status` (done or todo)
2. `due` (the date when the task is due)
3. `done` (the date when the task was done)
4. `path` (the path to the file that contains the task)
5. `description` (the description of the task)

You cann add multiple `sort by` query options, each on an extra line.
The first sort has the highest priority.
Each subsequent `sort` will sort within the existing sorting.

---

Info
{: .label .label-blue }
Sorting by description should take into account `[[Links]]` and `[Links with an|Alias]` (note pipe).
It should also take into account `*italics*` and `==highlights==`.
It sorts by the text contained within.

---

## Reverse sorting

After the name of the property that you want to sort by, you can add the `reverse` keyword.
If given, the sort order will be reverse for that property.

Note that `reverse` will reverse the entire result set.
For example, when you `sort by done reverse` and your query results contain tasks that do not have a done date, then those tasks without a done date will be listed first.

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
