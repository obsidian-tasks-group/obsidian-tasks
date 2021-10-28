---
layout: default
title: Queries
nav_order: 4
has_children: true
---

# Queries
{: .no_toc }

<details open markdown="block">
  <summary>
    Table of contents
  </summary>
  {: .text-delta }
1. TOC
{:toc}
</details>

---

## Querying and listing tasks

You can list tasks from your entire vault by querying them using a `tasks` code block. You can edit the tasks from the query results by clicking on the little pencil icon next to them.
Tasks are by default sorted by status, due date, and then path. You can change the sorting (see query options below).

---

Warning
{: .label .label-yellow }
*The result list will list tasks unindented.*
See [#51](https://github.com/schemar/obsidian-tasks/issues/51) for a discussion around the topic.
Do not hesitate to contribute 😊

---

The simplest way to query tasks is this:

    ```tasks
    ```

In preview mode, this will list *all* tasks from your vault, regardless of their properties like status.

This is probably not what you want.
Therefore, Tasks allows you to set query options to filter the tasks that you want to show.
See "Filters" in the documentation menu.
