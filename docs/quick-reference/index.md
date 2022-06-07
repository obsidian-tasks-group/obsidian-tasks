---
layout: default
title: Quick Reference
nav_order: 4
has_toc: false
---

# Quick Reference

| Presence             | Absence             | Filter                                                  | Sort                  | Group                | Display                |
| -------------------- | ------------------- | ------------------------------------------------------- | --------------------- | -------------------- | ---------------------- |
| `done`               | `not done`          |                                                         | `sort by status`      | `group by status`    |                        |
| `has done date`      | `no done date`      | `done (before, after, on) <date>`                       | `sort by done`        | `group by done`      | `hide done date`       |
| `has start date`     | `no start date`     | `starts (before, after, on) <date>`                     | `sort by start`       | `group by start`     | `hide start date`      |
| `has scheduled date` | `no scheduled date` | `scheduled (before, after, on) <date>`                  | `sort by scheduled`   | `group by scheduled` | `hide scheduled date`  |
| `has due date`       | `no due date`       | `due (before, after, on) <date>`                        | `sort by due`         | `group by due`       | `hide due date`        |
| `has happens date`   | `no happens date`   | `happens (before, after, on) <date>`                    |                       |                      |                        |
| `is recurring`       | `is not recurring`  |                                                         |                       |                      | `hide recurrence rule` |
|                      |                     | `priority is (above, below)? (low, none, medium, high)` | `sort by priority`    |                      | `hide priority`        |
|                      |                     |                                                         | `sort by urgency`     |                      |                        |
|                      |                     | `path (includes, does not include) <path>`              | `sort by path`        | `group by path`      |                        |
|                      |                     |                                                         |                       | `group by folder`    |                        |
|                      |                     |                                                         |                       | `group by filename`  |                        |
|                      |                     | `heading (includes, does not include) <string>`         |                       | `group by heading`   |                        |
|                      |                     |                                                         |                       | `group by backlink`  | `hide backlink`        |
|                      |                     | `description (includes, does not include) <string>`     | `sort by description` |                      |                        |
|                      |                     | `tag (includes, does not include) <tag>`                | `sort by tag`         |                      |                        |
|                      |                     | `tags (include, do not include) <tag>`                  | `sort by tag`         |                      |                        |
|                      |                     | `exclude sub-items`                                     |                       |                      |                        |
|                      |                     | `limit to <number> tasks`                               |                       |                      |                        |
|                      |                     | `limit <number>`                                        |                       |                      |                        |

Other layout options:

- `hide edit button`
- `hide task count`
- `short mode`
