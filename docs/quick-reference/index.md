---
layout: default
title: Quick Reference
nav_order: 4
has_toc: false
---

# Quick Reference

[1]: https://obsidian-tasks-group.github.io/obsidian-tasks/queries/filters/
[2]: https://obsidian-tasks-group.github.io/obsidian-tasks/queries/sorting/
[3]: https://obsidian-tasks-group.github.io/obsidian-tasks/queries/grouping/
[4]: https://obsidian-tasks-group.github.io/obsidian-tasks/queries/layout/

This table summarizes the filters and other options available inside a `tasks` block.

| Presence<br>Absence                          | [Filter][1]                                                                        | [Sort][2]<br>[Group][3]                     | [Display][4]           |
| -------------------------------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------- | ---------------------- |
|                                              | `done`<br>`not done`                                                               | `sort by status`<br>`group by status`       |                        |
| `has done date`<br>`no  done date`           | `done (before, after, on) <date>`                                                  | `sort by done`<br>`group by done`           | `hide done date`       |
| `has start date`<br>`no  start date`         | `starts (before, after, on) <date>`                                                | `sort by start`<br>`group by start`         | `hide start date`      |
| `has scheduled date`<br>`no  scheduled date` | `scheduled (before, after, on) <date>`                                             | `sort by scheduled`<br>`group by scheduled` | `hide scheduled date`  |
| `has due date`<br>`no  due date`             | `due (before, after, on) <date>`                                                   | `sort by due`<br>`group by due`             | `hide due date`        |
| `has happens date`<br>`no  happens date`     | `happens (before, after, on) <date>`                                               |                                             |                        |
|                                              | `is recurring`<br>`is not recurring`                                               |                                             | `hide recurrence rule` |
|                                              | `priority is (above, below)? (low, none, medium, high)`                            | `sort by priority`                          | `hide priority`        |
|                                              |                                                                                    | `sort by urgency`                           |                        |
|                                              | `path (includes, does not include) <path>`                                         | `sort by path`<br>`group by path`           |                        |
|                                              |                                                                                    | `group by folder`                           |                        |
|                                              |                                                                                    | `group by filename`                         |                        |
|                                              | `heading (includes, does not include) <string>`                                    | `group by heading`                          |                        |
|                                              |                                                                                    | `group by backlink`                         | `hide backlink`        |
|                                              | `description (includes, does not include) <string>`                                | `sort by description`                       |                        |
|                                              | `tag (includes, does not include) <tag>`<br>`tags (include, do not include) <tag>` | `sort by tag`<br>`sort by tag <tag_number>` |                        |
|                                              | `exclude sub-items`                                                                |                                             |                        |
|                                              | `limit to <number> tasks`<br>`limit <number>`                                      |                                             |                        |

Other layout options:

- `hide edit button`
- `hide task count`
- `short mode`
