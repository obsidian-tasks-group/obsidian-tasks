---
publish: true
aliases:
  - Queries/Queries
---

# About Queries

<span class="related-pages">#index-pages</span>

## The Simplest Query

You can list tasks from your entire vault by querying them using a `tasks` code block. You can edit the tasks from the query results by clicking on the little pencil icon next to them.
Tasks are by default sorted by status, due date, and then path. You can change the sorting (see query options below).

The simplest way to query tasks is this:

    ```tasks
    ```

In Live Preview and Reading modes, this will list *all* tasks from your vault, regardless of their properties like status.

This is probably not what you want.
Therefore, Tasks allows you to set query options to filter the tasks that you want to show.

For instance, you can show only the tasks (from anywhere in the vault) that are due today:

    ## Due today
    ```tasks
    due today
    not done
    ```

You can create as many task queries as you like, and you can also wrap them into [callouts](https://help.obsidian.md/Editing+and+formatting/Callouts) if you want to style them differently:

    > [!check] Due today
    > ```tasks
    > due today
    > not done
    > ```

In the following sections we will explain all the various options that are available for querying tasks.

## Tasks Query options

### Searching tasks - Basics

- [[Filters]]
- [[Explaining Queries]]
- [[Comments]]
- [[Examples]]

### Searching tasks - Advanced

- [[Global Query]]
- [[Combining Filters]]
- [[Regular Expressions]]
- [[Line Continuations]]

### Viewing the results

- [[Backlinks]]

### Controlling the display

- [[Limiting]]
- [[Sorting]]
- [[Grouping]]
- [[Layout]]

## Query Tips

### Capitals in Query Instructions - Case Insensitivity

> [!released]
> The ability to use capital letters in query instructions was introduced in Tasks 5.2.0.

Almost all Tasks query instructions are now case-INsensitive: they can now be typed with capital letters. This is especially helpful when typing them on mobile phones, and for emphasising important words.

For example, the following instructions are identical:

- `due before tomorrow`
- `Due before tomorrow`
- `due BEFORE Tomorrow`

The only exceptions to this flexibility are:

- When [[Combining Filters]], the boolean operators such as `AND`, `OR` and `NOT` must still be capitalised.
- In [[Regular Expressions]], the search pattern and flags are still case-sensitive.
- The code in expressions in [[Custom Filters]], [[Custom Sorting]] and [[Custom Grouping]] remain case-sensitive.

### Why is my query not working?

If a query gives unexpected results, see [[Explaining Queries]] and add the `explain` instruction.

## Limitations of Queries

### Tasks are not indented in query results

> [!warning]
> The result list will list tasks unindented.
See [#60](https://github.com/obsidian-tasks-group/obsidian-tasks/discussions/60) for a discussion around the topic.
Do not hesitate to contribute 😊

### Footnotes are not displayed in query results

> [!warning]
> The result list will not contain any footnotes of the original task.
> The footnotes will *not* be carried over to documents with ```tasks blocks. We are tracking this in [issue #2571](https://github.com/obsidian-tasks-group/obsidian-tasks/issues/2571).

See also [[Getting Started#Tasks with Footnotes]].
