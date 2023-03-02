---
layout: default
title: Filters
nav_order: 1
parent: Queries
---

# Filters

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

### Finding Tasks with Invalid Dates

{: .released }
Validation of dates was introduced in Tasks 1.16.0.

It is possible to accidentally use a non-existent date on a task signifier, such as `📅 2022-02-30`. February has at most 29 days.

Such tasks look like they have a date, but that date will never be found. When viewed in Reading mode, the date will be shown as `Invalid date`.

Any such mistakes can be found systematically with this search:

    ```tasks
    (done date is invalid) OR (due date is invalid) OR (scheduled date is invalid) OR (start date is invalid)
    ```

<div class="code-example" markdown="1">
Warning
{: .label .label-yellow }
If the above search finds any tasks with invalid dates, they are best fixed by clicking on the backlink to navigate
to the incorrect line, and fixing it by directly typing in the new date.

If you use the 'Create or edit Task' Modal, it will discard the broken date, and there will be no information about
the original, incorrect value.
</div>

---

## Text filters

Filters that search for text strings have two flavours.

In the following examples, we describe the `heading` filter, but these comments apply to all the text filters.

1. `heading (includes|does not include) <search text>`
    - It matches all tasks in a section whose heading contains the string `<search text>`  at least once.
        - That is, it is a sub-string search.
        - So `heading includes Day Planner` will match tasks in sections `## Monday Day Planner` and `## Day Planner for typical day`.
    - It ignores capitalization. Searches are case-insensitive.
        - So `heading includes Day Planner` will match tasks in sections `## Day Planner` and `## DAY PLANNER`.
    - Any quote characters (`'` and `"`) are included in the search text.
        - So `heading includes "Day Planner"` will match a section`## "Day Planner"`.
        - But will not match tasks with headings like `## Day Planner`.
1. `heading (regex matches|regex does not match) /<JavaScript-style Regex>/`
    - Does regular expression match (case-sensitive by default).
    - Regular expression (or ‘regex’) searching is a powerful but advanced feature.
    - It requires thorough knowledge in order to use successfully, and not miss intended search results.
    - It is easy to write a regular expression that looks correct, but which has a special character with a non-obvious meaning.
    - Essential reading: [Regular Expression Searches]({{ site.baseurl }}{% link queries/regular-expressions.md %}).

---

## Matching multiple filters

{: .released }
Boolean combinations were introduced in Tasks 1.9.0

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
- `done date is invalid`

{: .released }
`no done date` and `has done date` were introduced in Tasks 1.7.0.<br>
`done date is invalid` was introduced in Tasks 1.16.0.

### Due Date

- `no due date`
- `has due date`
- `due (before|after|on) <date>`
- `due date is invalid`

{: .released }
`has due date` was introduced in Tasks 1.6.0.<br>
`due date is invalid` was introduced in Tasks 1.16.0.

### Scheduled Date

- `no scheduled date`
- `has scheduled date`
- `scheduled (before|after|on) <date>`
- `scheduled date is invalid`

{: .released }
`has scheduled date` was introduced in Tasks 1.6.0.<br>
`scheduled date is invalid` was introduced in Tasks 1.16.0.

### Start Date

- `no start date`
- `has start date`
- `starts (before|after|on) <date>`
- `start date is invalid`

{: .released }
`has start date` was Introduced in Tasks 1.6.0.<br>
`start date is invalid` was introduced in Tasks 1.16.0.

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

{: .released }
`no happens date` and `has happens date` were introduced in Tasks 1.7.0.

## Filters for Task Statuses

### Status

- `done` - matches tasks status types `DONE`, `CANCELLED` and `NON_TASK`
- `not done` - matches status types with type `TODO` and `IN_PROGRESS`

> [!info]
> Prior to Tasks 1.23.0, there was no concept of task status type, and so only the status symbol was used:
>
> - a task with `[ ]` used to count as `not done`
> - any other character than space used to count as `done`
>
> The new behaviour is more flexible and was required to introduce support for in-progress and cancelled tasks. If the original behaviour is preferred, you can change the status types of every symbol except `space` to `DONE`. See [How to set up your custom statuses]({{ site.baseurl }}{% link how-to/set-up-custom-statuses.md %}).

### Status Name

- This searches the names given to your custom statuses.
- For example, perhaps you might have named `[!]` as `Important`, and so this field would search then text `Important` for all tasks with that status symbol.
- `status.name (includes|does not include) <string>`
  - Matches case-insensitive (disregards capitalization).
- `status.name (regex matches|regex does not match) /<JavaScript-style Regex>/`
  - Does regular expression match (case-sensitive by default).
  - Essential reading: [Regular Expression Searches]({{ site.baseurl }}{% link queries/regular-expressions.md %}).

{: .released }
`status.name` text searching was introduced in Tasks 1.23.0.

For more information, including adding your own customised statuses, see [Statuses]({{ site.baseurl }}{% link getting-started/statuses.md %}).

### Status Type

- `status.type (is|is not) (TODO|DONE|IN_PROGRESS|CANCELLED|NON_TASK)`
  - The values `TODO` etc are case-insensitive: you can use `in_progress`, for example
- This searches the types you have given to your custom statuses.
- This search is efficient if you wish to find all tasks that are `IN_PROGRESS`, and you have set up your statuses to have `[/]`, `[d]` and perhaps several other all treated as `IN_PROGRESS`.
- To exclude multiple values, you can use multiple `status.type is not` lines.
- To allow multiple values, use a boolean combination, for example: `( status.type is TODO ) OR ( status.type is IN_PROGRESS )`.

{: .released }
`status.type` text searching was introduced in Tasks 1.23.0.

For more information, including adding your own customised statuses, see [Statuses]({{ site.baseurl }}{% link getting-started/statuses.md %}).

### Status Examples

Find any tasks that have status symbols you have not yet added to your Tasks settings:

    ```tasks
    status.name includes unknown
    group by path
    ```

## Filters for Other Task Properties

As well as the date-related searches above, these filters search other properties in individual tasks.

### Description

- `description (includes|does not include) <string>`
  - Matches case-insensitive (disregards capitalization).
  - Disregards the global filter when matching.
- `description (regex matches|regex does not match) /<JavaScript-style Regex>/`
  - Does regular expression match (case-sensitive by default).
  - Essential reading: [Regular Expression Searches]({{ site.baseurl }}{% link queries/regular-expressions.md %}).

{: .released }
`regex matches` and `regex does not match` were introduced in Tasks 1.12.0.

For precise searches, it may help to know that `description`:

- first removes all each task's signifier emojis and their values,
- then removes any global filter,
- then removes an trailing spaces
- and then searches the remaining text

For example:

| Global Filter    | Task line                                                                | Text searched by `description`   |
| ---------------- | ------------------------------------------------------------------------ | -------------------------------- |
| No global filter | `'- [ ] Do stuff  ⏫  #tag1 ✅ 2022-08-12 #tag2/sub-tag '`               | `'Do stuff #tag1 #tag2/sub-tag'` |
| `#task`          | `'- [ ] #task Do stuff  ⏫  #tag1 ✅ 2022-08-12 #tag2/sub-tag '`         | `'Do stuff #tag1 #tag2/sub-tag'` |
| `global-filter`  | `'- [ ] global-filter Do stuff  ⏫  #tag1 ✅ 2022-08-12 #tag2/sub-tag '` | `'Do stuff #tag1 #tag2/sub-tag'` |

### Priority

- `priority is (above|below|not)? (low|none|medium|high)`

The available priorities are (from high to low):

1. ⏫ for high priority
2. 🔼 for medium priority
3. use no signifier to indicate no priority (searched for with 'none')
4. 🔽 for low priority

For more information, see [Priorities]({{ site.baseurl }}{% link getting-started/priority.md %}) .

#### Examples

    ```tasks
    not done
    priority is above none
    ```

    ```tasks
    priority is high
    ```

    ```tasks
    not done
    priority is not none
    ```

### Recurrence

- `is recurring`
- `is not recurring`
- `recurrence (includes|does not include) <part of recurrence rule>`
  - Matches case-insensitive (disregards capitalization).
  - Note that the text searched is generated programmatically and standardised, and so may not exactly match the text in any manually typed tasks. For example, a task with `🔁 every Sunday` will be searched as `every week on Sunday`.
  - The easiest way to see the standardised recurrence rule of your tasks is to use `group by recurrence`, and review the resulting group headings.
- `recurrence (regex matches|regex does not match) /<JavaScript-style Regex>/`
  - Does regular expression match (case-sensitive by default).
  - Essential reading: [Regular Expression Searches]({{ site.baseurl }}{% link queries/regular-expressions.md %}).

{: .released }
`recurrence` text searching was introduced in Tasks 1.22.0.

### Sub-Items

- `exclude sub-items`
  - When this is set, the result list will only include tasks that are not indented in their file. It will only show tasks that are top level list items in their list.

### Tags

{: .released }
Introduced in Tasks 1.6.0.

- `tags (include|do not include) <tag>` _or_
- `tag (includes|does not include) <tag>`
  - Matches case-insensitive (disregards capitalization).
  - Disregards the global filter when matching.
  - The `#` is optional on the tag so `#home` and `home` will work to match `#home`.
  - If the `#` is given, it must be present, so searching for `#home` will match `#home` but not `#location/home`.
  - The match is partial so `tags include foo` will match `#foo/bar` and `#foo-bar`.
- `tags (regex matches|regex does not match) /<JavaScript-style Regex>/` _or_
- `tag (regex matches|regex does not match) /<JavaScript-style Regex>/`
  - Does regular expression match (case-sensitive by default).
  - Essential reading: [Regular Expression Searches]({{ site.baseurl }}{% link queries/regular-expressions.md %}).
  - This enables tag searches that avoid sub-tags, by putting a `$` character at the end of the regular expression. See examples below.
  - If searching for sub-tags, remember to escape the slashes in regular expressions: `\/`

{: .released }
`regex matches` and `regex does not match` were introduced in Tasks 1.13.0.

#### Tag Query Examples

- `tags include #todo`
- `tags do not include #todo`
- `tag regex matches /#t$/`
  - Searches for a single-character tag `#t`, with no sub-tags, because `$` matches the end of the tag text.
- `tag regex matches /#book$/i`
  - The trailing `i` means case-insensitive.
  - Searches for tags such as `#book`,  `#Book`, `#BOOK` and the `$` prevents matching of `#books`,  `#book/literature`, etc.

## Filters for File Properties

These filters allow searching for tasks in particular files and sections of files.

### File Path

Note that the path includes the `.md` extension.

- `path (includes|does not include) <path>`
  - Matches case-insensitive (disregards capitalization).
- `path (regex matches|regex does not match) /<JavaScript-style Regex>/`
  - Does regular expression match (case-sensitive by default).
  - Essential reading: [Regular Expression Searches]({{ site.baseurl }}{% link queries/regular-expressions.md %}).

{: .released }
`regex matches` and `regex does not match` were introduced in Tasks 1.12.0.

### File Name

{: .released }
Introduced in Tasks 1.13.0.

Note that the file name includes the `.md` extension.

- `filename (includes|does not include) <filename>`
  - Matches case-insensitive (disregards capitalization).
- `filename (regex matches|regex does not match) /<JavaScript-style Regex>/`
  - Does regular expression match (case-sensitive by default).
  - Essential reading: [Regular Expression Searches]({{ site.baseurl }}{% link queries/regular-expressions.md %}).

### Heading

- `heading (includes|does not include) <string>`
  - Whether or not the heading preceding the task includes the given string.
  - Always tries to match the closest heading above the task, regardless of heading level.
  - `does not include` will match a task that does not have a preceding heading in its file.
  - Matches case-insensitive (disregards capitalization).
- `heading (regex matches|regex does not match) /<JavaScript-style Regex>/`
  - Whether or not the heading preceding the task includes the given regular expression (case-sensitive by default).
  - Always tries to match the closest heading above the task, regardless of heading level.
  - `regex does not match` will match a task that does not have a preceding heading in its file.
  - Essential reading: [Regular Expression Searches]({{ site.baseurl }}{% link queries/regular-expressions.md %}).

{: .released }
`regex matches` and `regex does not match` were introduced in Tasks 1.12.0.
