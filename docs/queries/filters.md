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

## Matching multiple filters

> Boolean combinations were introduced in Tasks 1.9.0

Each line of a query has to match in order for a task to be listed.
In other words, lines are considered to have an 'AND' operator between them.
Within each line, you can use the boolean operators `NOT`, `AND`, `OR`, `AND NOT`, `OR NOT` and `XOR`, as long as individual filters are wrapped in parentheses:

    ```tasks
    (no due date) OR (due after 2021-04-04)
    path includes GitHub
    ```

    ```tasks
    due after 2021-04-04
    (path includes GitHub) AND NOT (tags include #todo)
    ```

For full details of combining filters with boolean operators, see [Combining Filters]({{ site.baseurl }}{% link queries/combining-filters.md %}).

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
- `description (regex matches|regex does not match) <JavaScript-style Regex>`
  - Matches based on [JavaScript's RegExp implementation](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions)
  - Supports [JavaScript RegExp Flags](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#advanced_searching_with_flags)
  - **_Use with extreme care; this is a tool for software developers or people willing to spend a lot of time reading complicated documentation_**

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
