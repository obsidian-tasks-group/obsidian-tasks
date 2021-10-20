---
layout: default
title: Filters
nav_order: 1
parent: Queries
---

# Filters
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

## Dates

`<date>` filters can be given in natural language or in formal notation.
The following are some examples of valid `<date>` filters as inspiration:
- `2021-05-05`
- `today`
- `tomorrow`
- `next monday`
- `last friday`
- `in two weeks`

Note that if it is Wednesday and you write `tuesday`, Tasks assumes you mean "yesterday", as that is the closest Tuesday.
Use `next tuesday` instead if you mean "next tuesday".

When the day changes, relative dates like `due today` are re-evaluated so that the list stays up-to-date.

---

## Matching
All filters of a query have to match in order for a task to be listed.
This means you cannot show tasks that have "GitHub in the path and have no due date or are due after 2021-04-04".
Instead you would have two queries, one for each condition:

    ### Not due

    ```tasks
    no due date
    path includes GitHub
    ```

    ### Due after 2021-04-04

    ```tasks
    due after 2021-04-04
    path includes GitHub
    ```

---

## List of Available Filters

The following filters exist:

- `done`
- `not done`
- `done (before|after|on) <date>`
- `no due date`
- `due (before|after|on) <date>`
- `is recurring`
- `is not recurring`
- `path (includes|does not include) <path>`
    - Matches case-insensitive (disregards capitalization).
- `description (includes|does not include) <string>`
    - Matches case-insensitive (disregards capitalization).
- `heading (includes|does not include) <string>`
    - Whether or not the heading preceding the task includes the given string.
    - Always tries to match the closest heading above the task, regardless of heading level.
    - `does not include` will match a task that does not have a preceding heading in its file.
    - Matches case-insensitive (disregards capitalization).
- `exclude sub-items`
    - When this is set, the result list will only include tasks that are not indented in their file. It will only show tasks that are top level list items in their list.
- `limit to <number> tasks`
    - Only lists the first `<number>` tasks of the result.
    - Shorthand is `limit <number>`.
