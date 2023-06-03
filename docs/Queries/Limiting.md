---
publish: true
---

# Limiting

## Limit total number of tasks

You can limit the total number of tasks to show as query results.

Use the query string `limit to <number> tasks`.
This will only list the first `<number>` results of the query (after sorting).

Shorthand is `limit <number>`.

## Limit number of tasks in each group

You can also limit the allowed number of tasks in each group, if [[Grouping|grouping]] is used. Otherwise this limit is ignored.

Use the query string `limit groups to <number> tasks`.
This will only list the first `<number>` tasks in each group from the results of the query.

Shorthand is `limit groups <number>`.

> [!NOTE]
> `limit groups` instructions are ignored if there are no `group by` instructions in the Tasks query.

> [!released]
> `limit groups to <number> tasks` was introduced in Tasks 3.8.0.
