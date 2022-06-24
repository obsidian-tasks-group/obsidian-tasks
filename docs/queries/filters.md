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

- `2021-05-25`
- `yesterday`
- `today`
- `tomorrow`
- `next monday`
- `last friday`
- `14 days ago`
- `in two weeks`

Note that if it is Wednesday and you write `tuesday`, Tasks assumes you mean "yesterday", as that is the closest Tuesday.
Use `next tuesday` instead if you mean "next tuesday".

When the day changes, relative dates like `due today` are re-evaluated so that the list stays up-to-date.

---

## Matching - Workaround for Boolean OR

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

## Filters for Dates in Tasks

### Done Date

- `done`
- `not done`
- `no done date`
- `has done date`
- `done (before|after|on) <date>`

> `no done date` and `has done date` were introduced in Tasks 1.7.0.

### Due Date

- `no due date`
- `has due date`
- `due (before|after|on) <date>`

> `has due date` was introduced in Tasks 1.6.0.

### Scheduled Date

- `no scheduled date`
- `has scheduled date`
- `scheduled (before|after|on) <date>`

> `has scheduled date` was introduced in Tasks 1.6.0.

### Start Date

- `no start date`
- `has start date`
- `starts (before|after|on) <date>`

> `has start date` was Introduced in Tasks 1.6.0.

When filtering queries by [start date]({{ site.baseurl }}{% link getting-started/dates.md %}#-start),
the result will include tasks without a start date.
This way, you can use the start date as a filter to filter out any tasks that you cannot yet work on.

Such filter could be:

    ```tasks
    starts before tomorrow
    ```

### Happens

- `happens (before|after|on) <date>`

`happens` returns any task for a matching start date, scheduled date, _or_ due date.
For example, `happens before tomorrow` will return all tasks that are starting, scheduled, or due earlier than tomorrow.
If a task starts today and is due in a week from today, `happens before tomorrow` will match,
because the tasks starts before tomorrow. Only one of the dates needs to match.

- `no happens date`
  - Return tasks where _none_ of start date, scheduled date, and due date are set.
- `has happens date`
  - Return tasks where _any_ of start date, scheduled date, _or_ due date are set.

> `no happens date` and `has happens date` were introduced in Tasks 1.7.0.

## Filters for Other Task Properties

As well as the date-related searches above, these filters search other properties in individual tasks.

### Description

- `description (includes|does not include) <string>`
  - Matches case-insensitive (disregards capitalization).
  - Disregards the global filter when matching.

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

### Recurrence

- `is recurring`
- `is not recurring`

### Status

- `done`
- `not done`

### Sub-Items

- `exclude sub-items`
  - When this is set, the result list will only include tasks that are not indented in their file. It will only show tasks that are top level list items in their list.

### Tags

> Introduced in Tasks 1.6.0.

- `tags (include|do not include) <tag>` (Alternative grammar `tag (includes|does not include) <tag>` matching description syntax)
  - Matches case-insensitive (disregards capitalization).
  - Disregards the global filter when matching.
  - The `#` is optional on the tag so `#home` and `home` will work to match `#home`.
  - The match is partial so `tags include foo` will match `#foo/bar` and `#foo-bar`.

#### Tag Query Examples

- `tags include #todo`
- `tags do not include #todo`

## Filters for File Properties

These filters allow searching for tasks in particular files and sections of files.

### File Path

- `path (includes|does not include) <path>`
  - Matches case-insensitive (disregards capitalization).

### Heading

- `heading (includes|does not include) <string>`
  - Whether or not the heading preceding the task includes the given string.
  - Always tries to match the closest heading above the task, regardless of heading level.
  - `does not include` will match a task that does not have a preceding heading in its file.
  - Matches case-insensitive (disregards capitalization).
