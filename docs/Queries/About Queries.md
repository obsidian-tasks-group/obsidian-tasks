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

### Viewing the results

- [[Backlinks]]

### Controlling the display

- [[Limiting]]
- [[Sorting]]
- [[Grouping]]
- [[Layout]]

## Limitations of Queries

> [!warning]
> The result list will list tasks unindented.
See [#60](https://github.com/obsidian-tasks-group/obsidian-tasks/discussions/60) for a discussion around the topic.
Do not hesitate to contribute 😊

---

> [!warning]
> The result list will not contain any footnotes of the original task.
The footnotes will *not* be carried over to documents with ```tasks blocks.
