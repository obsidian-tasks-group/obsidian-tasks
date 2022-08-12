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

| [Filters][1]                                                                                                        | [Sort][2]                                   | [Group][3]            | [Display][4]           |
| ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- | --------------------- | ---------------------- |
| `done`<br>`not done`                                                                                                | `sort by status`                            | `group by status`     |                        |
| `done (before, after, on) <date>`<br>`has done date`<br>`no  done date`                                             | `sort by done`                              | `group by done`       | `hide done date`       |
| `starts (before, after, on) <date>`<br>`has start date`<br>`no  start date`                                         | `sort by start`                             | `group by start`      | `hide start date`      |
| `scheduled (before, after, on) <date>`<br>`has scheduled date`<br>`no  scheduled date`                              | `sort by scheduled`                         | `group by scheduled`  | `hide scheduled date`  |
| `due (before, after, on) <date>`<br>`has due date`<br>`no  due date`                                                | `sort by due`                               | `group by due`        | `hide due date`        |
| `happens (before, after, on) <date>`<br>`has happens date`<br>`no  happens date`                                    |                                             | `group by happens`    |                        |
| `is recurring`<br>`is not recurring`                                                                                |                                             | `group by recurring`  |                        |
|                                                                                                                     |                                             | `group by recurrence` | `hide recurrence rule` |
| `priority is (above, below)? (low, none, medium, high)`                                                             | `sort by priority`                          | `group by priority`   | `hide priority`        |
|                                                                                                                     | `sort by urgency`                           |                       |                        |
| `path (includes, does not include) <path>`<br>`path (regex matches, regex does not match) /regex/i`                 | `sort by path`                              | `group by path`       |                        |
|                                                                                                                     |                                             | `group by root`       |                        |
|                                                                                                                     |                                             | `group by folder`     |                        |
|                                                                                                                     |                                             | `group by filename`   |                        |
| `heading (includes, does not include) <string>`<br>`heading (regex matches, regex does not match) /regex/i`         |                                             | `group by heading`    |                        |
|                                                                                                                     |                                             | `group by backlink`   | `hide backlink`        |
| `description (includes, does not include) <string>`<br>`description (regex matches, regex does not match) /regex/i` | `sort by description`                       |                       |                        |
| `tag (includes, does not include) <tag>`<br>`tags (include, do not include) <tag>`                                  | `sort by tag`<br>`sort by tag <tag_number>` | `group by tags`       |                        |
| `(filter 1) AND (filter 2)`                                                                                         |                                             |                       |                        |
| `(filter 1) OR (filter 2)`                                                                                          |                                             |                       |                        |
| `NOT (filter 1)`                                                                                                    |                                             |                       |                        |
| `(filter 1) XOR (filter 2)`                                                                                         |                                             |                       |                        |
| `(filter 1) AND NOT (filter 2)`                                                                                     |                                             |                       |                        |
| `(filter 1) OR NOT (filter 2)`                                                                                      |                                             |                       |                        |
| `(filter 1) AND ((filter 2) OR (filter 3))`                                                                         |                                             |                       |                        |
| `exclude sub-items`                                                                                                 |                                             |                       |                        |
| `limit to <number> tasks`<br>`limit <number>`                                                                       |                                             |                       |                        |

Other layout options:

- `hide edit button`
- `hide task count`
- `short mode`
