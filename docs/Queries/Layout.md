---
publish: true
---

# Layout commands

## Hiding/Showing Elements

You can hide and show individual elements of the rendered list with the "hide" and "show" commands
together with the name of the element.

The following elements exist:

- `edit button`
- `backlink`
- `urgency`
- `priority`
- `created date`
- `start date`
- `scheduled date`
- `due date`
- `done date`
- `recurrence rule`
- `task count`

> [!released]
`urgency` was introduced in Tasks 1.14.0.<br>
`created date` was introduced in Tasks 2.0.0.

All of these elements except `urgency` are shown by default, so you will use the command `hide`
if you do not want to show any of them, or the command `show` to show the urgency score.

> [!released]
The `show` commands were introduced in Tasks 1.14.0.

Example:

    ```tasks
    no due date
    path includes GitHub
    hide recurrence rule
    hide task count
    hide backlink
    show urgency
    ```

---

## Short Mode

In short mode, query results will only show the emojis, but not the concrete recurrence rule or dates.
You can hover over the task to see the rule and dates in a tooltip.

The command is `short mode`.

Example:

    ```tasks
    not done
    short mode
    ```
