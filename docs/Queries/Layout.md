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
- `tags`
- `task count`

> [!Info] About `hide tags`
>
> 1. Only tags recognised by Obsidian are hidden with `hide tags`.
>     - Tasks is a bit more relaxed in recognising tags than Obsidian. For example,  `#123` is treated as a tag by Tasks, and so is included in Tasks' searches, sorting and grouping code.
>     - However, `#123` is [not recognised as a valid Obsidian tag](https://help.obsidian.md/Editing+and+formatting/Tags#Tag+format) and so not hidden.
>     - See [[Tags#Recognising Tags]] for more information.
> 1. It is not possible to hide or show individual tags. We are tracking this in [discussion #848](https://github.com/obsidian-tasks-group/obsidian-tasks/discussions/848).

> [!released]
`urgency` was introduced in Tasks 1.14.0.<br>
`created date` was introduced in Tasks 2.0.0.<br>
`tags` was introduced in Tasks 4.1.0.

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

## Short Mode

In short mode, query results will only show the emojis, but not the concrete recurrence rule or dates.
You can hover over the task to see the rule and dates in a tooltip.

The command is `short mode`.

Example:

    ```tasks
    not done
    short mode
    ```
