---
layout: default
title: Include and Exclude Filters
nav_order: 6
parent: Advanced
has_toc: false
---

# Include and Exclude Filters

You can create more flexible filter matching rules by adding `include:` and `exclude:` clauses
to your task queries. For example:

    ```tasks
    is recurring
    include:
    due after 2022-03-03
    no due date
    exclude:
    path includes Daily
    ```

This will match all recurring tasks due after 2022-03-02 or have no due date excluding any tasks
thaty have "Daily" in their path.

## Filter Priority

Regular filters take precedence. For instance, in the example above, only recurring tasks
will be matched regardless of what is specified in the `include:` or `exclude:` clauses.

> Note: regular filters must be specifed **before** any include or exlude filters.

## Include Filters

Include filters will match a task if *any* of the specified filters matches. For example:

    ```tasks
    include:
    scheduled on 2022-03-06
    due on 2022-03-06
    not done
    ```

This will match tasks that are scheduled or due on 2022-06 or any task that is not done.

## Exclude Filters

Exclude filters will match tasks that *don't* match any of the specified filters. For
example:

    ```tasks
    is recurring
    exclude:
    done before 2022-03-06
    is recurring every day
    ```

This will show all recurring tasks except ones that recur every day and tasks
that were marked done before 2022-03-06.
