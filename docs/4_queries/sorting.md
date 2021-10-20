---
layout: default
title: Sorting
nav_order: 2
parent: Queries
has_toc: false
---

# Sorting

To sort the results of a Tasks query, you must add at least one `sort by` line to the query.

- `sort by (status|due|done|path|description)`
    - Sorts the tasks by the given property.
    - For example, `sort by due` will sort the tasks by due date.
    - You cann add multiple `sort by` query options, each on an extra line.
        - The first sort has the highest priority.
        - Each subsequent `sort` will sort within the existing sorting.

## Example

    ```tasks
    not done
    due today
    sort by due
    ```
