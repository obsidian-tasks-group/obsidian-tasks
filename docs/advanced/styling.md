---
layout: default
title: Styling
nav_order: 2
parent: Advanced
has_toc: false
---

# Styling Tasks

Each task entry has CSS styles that allow you to change the look and feel of how the tasks are displayed. The
following styles are available.

| Class                          | Usage                                                                                                           |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------- |
| plugin-tasks-query-result      | This is applied to the UL used to hold all the tasks, each task is stored in a LI.                              |
| plugin-tasks-query-explanation | This is applied to the PRE showing the query's explanation when the `explain` instruction is used.              |
| plugin-tasks-list-item         | This is applied to the LI that holds each task and the INPUT element for it.                                    |
| tasks-backlink                 | This is applied to the SPAN that wraps the backlink if displayed on the task.                                   |
| tasks-edit                     | This is applied to the SPAN that wraps the edit button/icon shown next to the task that opens the task edit UI. |
| tasks-urgency                  | This is applied to the SPAN that wraps the urgency score if displayed on the task.                              |
| task-list-item-checkbox        | This is applied to the INPUT element for the task.                                                              |
| tasks-group-heading            | This is applied to H4, H5 and H6 group headings                                                                 |

> `tasks-group-heading` was introduced in Tasks 1.6.0.<br>
> `plugin-tasks-query-explanation` was introduced in Tasks 1.19.0.
