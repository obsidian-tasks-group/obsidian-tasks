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

### Done Date

- `done`
- `not done`
- `done (before|after|on) <date>`

### Priority

- `priority is (above|below)? (low|none|medium|high)`

#### Examples

{: .no_toc }

    ```tasks
    not done
    priority is above none
    ```

    ```tasks
    priority is high
    ```

### Start Date

- `no start date`
- `has start date`
- `starts (before|after|on) <date>`

When filtering queries by [start date]({{ site.baseurl }}{% link getting-started/dates.md %}#-start),
the result will include tasks without a start date.
This way, you can use the start date as a filter to filter out any tasks that you cannot yet work on.

Such filter could be:

    ```tasks
    starts before tomorrow
    ```

### Scheduled Date

- `no scheduled date`
- `has scheduled date`
- `scheduled (before|after|on) <date>`

### Due Date

- `no due date`
- `has due date`
- `due (before|after|on) <date>`

### Happens

- `happens (before|after|on) <date>`

`happens` returns any task for a matching start date, scheduled date, _or_ due date.
For example, `happens before tomorrow` will return all tasks that are starting, scheduled, or due earlier than tomorrow.
If a task starts today and is due in a week from today, `happens before tomorrow` will match,
because the tasks starts before tomorrow. Only one of the dates needs to match.

### Recurrence

- `is recurring`
- `is not recurring`

### File Path

- `path (includes|does not include) <path>`
  - Matches case-insensitive (disregards capitalization).

### Description

- `description (includes|does not include) <string>`
  - Matches case-insensitive (disregards capitalization).
  - Disregards the global filter when matching.

### Heading

- `heading (includes|does not include) <string>`
  - Whether or not the heading preceding the task includes the given string.
  - Always tries to match the closest heading above the task, regardless of heading level.
  - `does not include` will match a task that does not have a preceding heading in its file.
  - Matches case-insensitive (disregards capitalization).

### Sub-Items

- `exclude sub-items`
  - When this is set, the result list will only include tasks that are not indented in their file. It will only show tasks that are top level list items in their list.

### Tags

- `tags (include|do not include) <tag>` (Alternative grammar `tag (includes|does not include) <tag>` matching description syntax)
  - Matches case-insensitive (disregards capitalization).
  - Disregards the global filter when matching.
  - The `#` is optional on the tag so `#home` and `home` will work to match `#home`.
  - The match is partial so `tags include foo` will match `#foo/bar` and `#foo-bar`.

#### Tag Query Examples

- `tags include #todo`
- `tags do not include #todo`
