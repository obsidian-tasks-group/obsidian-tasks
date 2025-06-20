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
  - Control which tasks are shown in Tasks Queries.
- [[Explaining Queries]]
  - Get Tasks to show how your query is interpreted, so you can check your instructions.
- [[Comments]]
  - Write notes to your future self, explaining your Queries.
- [[Examples]]
  - A selection of some of the more commonly used search instructions.

### Searching tasks - Re-using instructions

- [[Global Query]]
  - Set a global query in the settings that Tasks will add to the start of all the Queries in your vault.
- [[Presets]]
  - Define named instructions that you can re-use in multiple queries throughout your whole vault.
- [[Query File Defaults]]
  - Set properties in note frontmatter, to instruct tasks to add instructions to all the Queries in that file.

> [!tip] The Query is assembled like this:
>
> 1. Get the **Global Query**, from settings.
>     - This will be discarded if `ignore global query` is present in any of the following locations.
> 2. Append the **Query File Defaults**, based on the Query file's properties.
> 3. Append the **Query Source**, from the `tasks` block.
>
> Later [[Layout]] instructions will override earlier ones.

### Searching tasks - Advanced

- [[Combining Filters]]
  - How to use `AND`, `OR` and `NOT`.
  - Warning: Make sure you understand where to place brackets in these instructions!
- [[Regular Expressions]]
  - A complex but powerful alternative to simple text searches.
- [[Line Continuations]]
  - Break long instructions up across multiple lines for readability.

### Viewing the results

- [[Backlinks]]
  - Navigate from tasks in Queries back to the source Markdown line.

### Controlling the display

- [[Limiting]]
  - Control the maximum number of tasks displayed in a Query's results, and in each group of tasks.
- [[Sorting]]
  - Define the sort order.
- [[Grouping]]
  - Define headings to group tasks.
- [[Layout]]
  - Hide and show individual elements of the Query results.

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

By default, the result list will list tasks unindented.

> [!tip]
> Use the `show tree` instruction to indent tasks and list items in query results. See [[Layout#Hide and Show Tree|Hide and Show Tree]].
>
> ![Sample search results with 'show tree' instruction](../images/show-tree.png)
<span class="caption">Sample search results with 'show tree' instruction</span>

You can see related feature requests in:

- ["scope: sub-tasks and super-tasks" Issues](https://github.com/obsidian-tasks-group/obsidian-tasks/issues?q=is%3Aopen%20label%3A%22scope%3A%20sub-tasks%20and%20super-tasks%22%20is%3Aissue%20)
- ["scope: sub-tasks and super-tasks" Discussions](https://github.com/obsidian-tasks-group/obsidian-tasks/discussions/categories/ideas-any-new-feature-requests-go-in-issues-please?discussions_q=is%3Aopen+label%3A%22scope%3A+sub-tasks+and+super-tasks%22+category%3A%22Ideas%3A+Any+New+Feature+Requests+go+in+Issues+please%22+sort%3Atop)

### Footnotes are not displayed in query results

> [!warning]
> The result list will not contain any footnotes of the original task.
> The footnotes will *not* be carried over to documents with ```tasks blocks. We are tracking this in [issue #2571](https://github.com/obsidian-tasks-group/obsidian-tasks/issues/2571).

See also [[Getting Started#Tasks with Footnotes]].
