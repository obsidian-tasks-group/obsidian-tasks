---
layout: default
title: Queries
nav_order: 4
has_children: true
---

# Queries

{: .no_toc }

You can list tasks from your entire vault by querying them using a `tasks` code block. You can edit the tasks from the query results by clicking on the little pencil icon next to them.
Tasks are by default sorted by status, due date, and then path. You can change the sorting (see query options below).

<div class="code-example" markdown="1">
Warning
{: .label .label-yellow }
The result list will list tasks unindented.
See [#51](https://github.com/obsidian-tasks-group/obsidian-tasks/issues/51) for a discussion around the topic.
Do not hesitate to contribute 😊

---

Warning
{: .label .label-yellow }
The result list will not contain any footnotes of the original task.
The footnotes will *not* be carried over to documents with ```tasks blocks.
</div>

The simplest way to query tasks is this:

    ```tasks
    ```

In preview mode, this will list *all* tasks from your vault, regardless of their properties like status.

This is probably not what you want.
Therefore, Tasks allows you to set query options to filter the tasks that you want to show.
See "Filters" in the documentation menu.
