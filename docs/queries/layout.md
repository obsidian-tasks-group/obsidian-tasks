---
layout: default
title: Layout
nav_order: 6
parent: Queries
---

# Layout options

{: .no_toc }

<details open markdown="block">
  <summary>
    Table of contents
  </summary>
  {: .text-delta }
1. TOC
{:toc}
</details>

## Hiding Elements

You can hide certain elements of the rendered list with the "hide" option.

The following options exist:

- `edit button`
- `backlink`
- `priority`
- `start date`
- `scheduled date`
- `due date`
- `done date`
- `recurrence rule`
- `task count`

Example:

    ```tasks
    no due date
    path includes GitHub
    hide recurrence rule
    hide task count
    hide backlink
    ```

---

## Short Mode

In short mode, query results will only show the emojis, but not the concrete recurrence rule or dates.
You can hover over the task to see the rule and dates in a tooltip.

The option is `short mode`.

Example:

    ```tasks
    not done
    short mode
    ```
