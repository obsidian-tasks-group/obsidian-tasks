---
publish: true
---

# Filters

## Searching for dates

Tasks allows a lot of flexibility in the dates inside query blocks.

### Absolute dates

`<date>` filters can be given with 'absolute' dates, whose preferred format is `YYYY-MM-DD`.

Absolute dates specify a **particular date in a calendar**. They represent the same day, regardless of today's date.

Examples:

- `2021-05-25`
- `25th May 2023`
  - The [chrono](https://github.com/wanasit/chrono) library reads dates very flexibly, so you can use free text for absolute dates in your filters.
  - The `YYYY-MM-DD` format is somewhat safer, though, as there is no chance of ambiguity in reading your text.

### Relative dates

`<date>` filters can be given with `relative` dates.

Relative dates are **calculated from today's date**.

When the day changes, relative dates like `due today` are re-evaluated so that the list stays up-to-date (so long as your computer was not hibernating at midnight - see [#1289](https://github.com/obsidian-tasks-group/obsidian-tasks/issues/1289)).

Examples for inspiration:

- `yesterday`
- `today`
- `tomorrow`
- `next monday`
- `last friday`
- `14 days ago`
- `in two weeks`
- `14 October` (the current year will be used)
- `May` (1st May in the current year will be used)

Note that if it is Wednesday and you write `tuesday`, Tasks assumes you mean "yesterday", as that is the closest Tuesday.
Use `next tuesday` instead if you mean "next tuesday".

### Searching date ranges

> [!released]
Date range searches were introduced in Tasks 2.0.0.

Tasks allows date searches to specify a pair of dates, `<date range>` .

These searches are inclusive: the dates at either end are found by the search.

#### Absolute date ranges

`<date range>` may be specified as 2 valid dates in `YYYY-MM-DD` format.

Dates on either end are included, that is, it is an inclusive search.

- `before <date range>` will match before the earliest date of the range.
- `after <date range>` will match after the latest date of the range.

Notes:

- `in` and `on` may be omitted.
- If one of the `YYYY-MM-DD` dates is invalid, then it is ignored and the filter will behave as `<date>` not `<date range>`.
- Date range cannot be specified by 2 relative dates eg `next monday three weeks`.
- It is technically possible to specify absolute dates in words, such as `25th May 2023`.
  - However, we do not recommend using words for specifying the two dates in ranges.
  - This is because we have found that using two adjacent non-numeric dates can lead to ambiguity and unintended results when the [chrono](https://github.com/wanasit/chrono) library parses the dates in your `<date range>` filter.

Example absolute date ranges:

- `2022-01-01 2023-02-01`

> [!warning]
Prior to Tasks 2.0.0, the second date in absolute date ranges was ignored.
See the tables in the [[Filters#Appendix: Tasks 2.0.0 improvements to date filters|Appendix below]] to understand the changes in results, and whether you need to update any of your searches.

#### Relative date ranges

Tasks supports a very specific set of relative `<date range>` values: `last|this|next week|month|quarter|year`. The pipe (`|`) character means 'or'.

Tasks will process these ranges, based on today's date, and convert them to absolute date ranges (`YYYY-MM-DD YYYY-MM-DD`) internally.

Dates on either end are included, that is, it is an inclusive search.

Notes:

- Currently all weeks are defined as [ISO 8601](https://en.wikipedia.org/wiki/ISO_week_date) weeks **starting on Monday** and **ending on Sunday**.
  - We will provide more flexibility in a future release.
  - We are tracking this in [issue #1751](https://github.com/obsidian-tasks-group/obsidian-tasks/issues/1751)
- Relative date ranges support only the exact keywords specified above.
  - So, for example, `previous half of year` and `next semester` are not supported.

Example relative date ranges:

- `in this week` (from this week's Monday to Sunday inclusive)
- `after this month`
- `next quarter`
- `before next year`

> [!warning]
Prior to Tasks 2.0.0, the interpretation of relative date ranges was confusing, and not what most users naturally expected.
See the tables in the [[Filters#Appendix: Tasks 2.0.0 improvements to date filters|Appendix below]] to understand the changes in results, and whether you need to update any of your searches.

#### Numbered date ranges

There is also the ability to use numbered date ranges that are independent of the current date. These numbered date range types are supported:

- Week
  - Format: `YYYY-Www` (`ww` is the week number, always in 2 digits)
  - Example: `2022-W14`
- Month
  - Format: `YYYY-mm` (`mm` is the month number, always in 2 digits)
  - Example: `2023-10`
- Quarter
  - Format: `YYYY-Qq` (`q` is the quarter number, always 1 digit)
  - Example: `2021-Q4`
- Year
  - Format: `YYYY`
  - Example: `2023`

> [!released]
> Numbered date ranges were introduced in Tasks 3.1.0.

### Troubleshooting date searches

If your date searches are giving unexpected results, add an [[Explaining Queries|`explain`]] line to your query.

This will help you identify common mistakes such as:

- Accidentally using an invalid absolute date in a filter.
- Using unsupported keywords in relative date ranges.

If relative dates in queries do not update from the previous day, and your computer was sleeping at midnight, this is likely caused by a known Chrome bug and you will need to re-open the note. See [#1289](https://github.com/obsidian-tasks-group/obsidian-tasks/issues/1289).

### Finding Tasks with Invalid Dates

> [!released]
>
> - Validation of dates was introduced in Tasks 1.16.0.
> - `created date is invalid` was introduced in Tasks 2.0.0.

It is possible to accidentally use a non-existent date on a task signifier, such as `📅 2022-02-30`. February has at most 29 days.

Such tasks look like they have a date, but that date will never be found. When viewed in Reading mode, the date will be shown as `Invalid date`.

Any such mistakes can be found systematically with this search:

    ```tasks
    (created date is invalid) OR (done date is invalid) OR (due date is invalid) OR (scheduled date is invalid) OR (start date is invalid)
    ```

> [!warning]
> If the above search finds any tasks with invalid dates, they are best fixed by clicking on the [[Backlinks|backlink]] to navigate
to the incorrect line, and fixing it by directly typing in the new date.

If you use the 'Create or edit Task' Modal, it will discard the broken date, and there will be no information about
the original, incorrect value.

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
    - Essential reading: [[Regular Expressions|Regular Expression Searches]].

---

## Matching multiple filters

> [!released]
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

For full details of combining filters with boolean operators, see [[Combining Filters]].

---

## Filters for Dates in Tasks

### Done Date

- `done`
- `not done`
- `no done date`
- `has done date`
- `done (before|after|on) <date>`
- `done (before|after|in) <date range>`
  - `YYYY-MM-DD YYYY-MM-DD`
  - `(last|this|next) (week|month|quarter|year)`
  - `(YYYY-Www|YYYY-mm|YYYY-Qq|YYYY)`
- `done date is invalid`

> [!released]
>
> - `no done date` and `has done date` were introduced in Tasks 1.7.0.
> - `done date is invalid` was introduced in Tasks 1.16.0.
> - `done (before|after|in) <date range>` searches were introduced in Tasks 2.0.0.
> - `done (before|after|in) (YYYY-Www|YYYY-mm|YYYY-Qq|YYYY)` searches were introduced in Tasks 3.1.0.

### Due Date

- `no due date`
- `has due date`
- `due (before|after|on) <date>`
- `due (before|after|in) <date range>`
  - `YYYY-MM-DD YYYY-MM-DD`
  - `(last|this|next) (week|month|quarter|year)`
  - `(YYYY-Www|YYYY-mm|YYYY-Qq|YYYY)`
- `due date is invalid`

> [!released]
>
> - `has due date` was introduced in Tasks 1.6.0.
> - `due date is invalid` was introduced in Tasks 1.16.0.
> - `due (before|after|in) <date range>` searches were introduced in Tasks 2.0.0.
> - `due (before|after|in) (YYYY-Www|YYYY-mm|YYYY-Qq|YYYY)` searches were introduced in Tasks 3.1.0.

### Scheduled Date

- `no scheduled date`
- `has scheduled date`
- `scheduled (before|after|on) <date>`
- `scheduled (before|after|in) <date range>`
  - `YYYY-MM-DD YYYY-MM-DD`
  - `(last|this|next) (week|month|quarter|year)`
  - `(YYYY-Www|YYYY-mm|YYYY-Qq|YYYY)`
- `scheduled date is invalid`

> [!released]
>
> - `has scheduled date` was introduced in Tasks 1.6.0.
> - `scheduled date is invalid` was introduced in Tasks 1.16.0.
> - `scheduled (before|after|in) <date range>` searches were introduced in Tasks 2.0.0.
> - `scheduled (before|after|in) (YYYY-Www|YYYY-mm|YYYY-Qq|YYYY)` searches were introduced in Tasks 3.1.0.

### Start Date

- `no start date`
- `has start date`
- `starts (before|after|on) <date>`
- `starts (before|after|in) <date range>`
  - `YYYY-MM-DD YYYY-MM-DD`
  - `(last|this|next) (week|month|quarter|year)`
  - `(YYYY-Www|YYYY-mm|YYYY-Qq|YYYY)`
- `start date is invalid`

> [!released]
>
> - `has start date` was Introduced in Tasks 1.6.0.
> - `start date is invalid` was introduced in Tasks 1.16.0.
> - `starts (before|after|in) <date range>` searches were introduced in Tasks 2.0.0.
> - `starts (before|after|in) (YYYY-Www|YYYY-mm|YYYY-Qq|YYYY)` searches were introduced in Tasks 3.1.0.

#### Making Start Date only find tasks with Start

> [!Warning]
> When filtering queries by [[Dates#Start date|start date]],
> the result will include tasks without a start date.
> This way, you can use the start date as a filter to filter out any tasks that you cannot yet work on.

Such filter could be:

    ```tasks
    # Find tasks which:
    #    EITHER start before today or earlier
    #    OR     have no start date:
    starts before tomorrow
    ```

> [!Tip]
> To find tasks which really do start before tomorrow:
>
> ````text
> ```tasks
> # Find tasks which start today or earlier:
> ( (starts before tomorrow) AND (has start date) )
> ```
> ````

### Created Date

See [[Dates#Created date|created date]] for how to make Tasks record the created date on any task lines that it creates.

- `no created date`
- `has created date`
- `created (before|after|on) <date>`
- `created (before|after|in) <date range>`
  - `YYYY-MM-DD YYYY-MM-DD`
  - `(last|this|next) (week|month|quarter|year)`
  - `(YYYY-Www|YYYY-mm|YYYY-Qq|YYYY)`
- `created date is invalid`

Such a filter could be:

    ```tasks
    created before tomorrow
    ```

> [!released]
>
> - Created date was introduced in Tasks 2.0.0.
> - `created (before|after|in) (YYYY-Www|YYYY-mm|YYYY-Qq|YYYY)` searches were introduced in Tasks 3.1.0.

### Happens

- `happens (before|after|on) <date>`
- `happens (before|after|in) <date range>`
  - `YYYY-MM-DD YYYY-MM-DD`
  - `(last|this|next) (week|month|quarter|year)`
  - `(YYYY-Www|YYYY-mm|YYYY-Qq|YYYY)`

`happens` returns any task for a matching start date, scheduled date, _or_ due date.
For example, `happens before tomorrow` will return all tasks that are starting, scheduled, or due earlier than tomorrow.
If a task starts today and is due in a week from today, `happens before tomorrow` will match,
because the tasks starts before tomorrow. Only one of the dates needs to match.

- `no happens date`
  - Return tasks where _none_ of start date, scheduled date, and due date are set.
- `has happens date`
  - Return tasks where _any_ of start date, scheduled date, _or_ due date are set.

> [!released]
>
> - `no happens date` and `has happens date` were introduced in Tasks 1.7.0.
> - `happens (before|after|in) <date range>` searches were introduced in Tasks 2.0.0.
> - `happens (before|after|in) (YYYY-Www|YYYY-mm|YYYY-Qq|YYYY)` searches were introduced in Tasks 3.1.0.

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
> The new behaviour is more flexible and was required to introduce support for in-progress and cancelled tasks. If the original behaviour is preferred, you can change the status types of every symbol except `space` to `DONE`. See [[Set up custom statuses|How to set up your custom statuses]].

### Status Name

- This searches the names given to your custom statuses.
- For example, perhaps you might have named `[!]` as `Important`, and so this field would search the text `Important` for all tasks with that status symbol.
- `status.name (includes|does not include) <string>`
  - Matches case-insensitive (disregards capitalization).
- `status.name (regex matches|regex does not match) /<JavaScript-style Regex>/`
  - Does regular expression match (case-sensitive by default).
  - Essential reading: [[Regular Expressions|Regular Expression Searches]].

> [!released]
`status.name` text searching was introduced in Tasks 1.23.0.

For more information, including adding your own customised statuses, see [[Statuses]].

### Status Type

- `status.type (is|is not) (TODO|DONE|IN_PROGRESS|CANCELLED|NON_TASK)`
  - The values `TODO` etc are case-insensitive: you can use `in_progress`, for example
- This searches the types you have given to your custom statuses.
- This search is efficient if you wish to find all tasks that are `IN_PROGRESS`, and you have set up your statuses to have `[/]`, `[d]` and perhaps several other all treated as `IN_PROGRESS`.
- To exclude multiple values, you can use multiple `status.type is not` lines.
- To allow multiple values, use a boolean combination, for example: `( status.type is TODO ) OR ( status.type is IN_PROGRESS )`.

> [!released]
`status.type` text searching was introduced in Tasks 1.23.0.

For more information, including adding your own customised statuses, see [[Statuses]].

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
  - Essential reading: [[Regular Expressions|Regular Expression Searches]].

> [!released]
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

For more information, see [[Priority|Priorities]] .

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
  - Essential reading: [[Regular Expressions|Regular Expression Searches]].

> [!released]
`recurrence` text searching was introduced in Tasks 1.22.0.

### Sub-Items

- `exclude sub-items`
  - When this is set, the result list will only include tasks that are not indented in their file. It will only show tasks that are top level list items in their list.

### Tags

> [!released]
Introduced in Tasks 1.6.0.

- `no tags`
- `has tags`
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
  - Essential reading: [[Regular Expressions|Regular Expression Searches]].
  - This enables tag searches that avoid sub-tags, by putting a `$` character at the end of the regular expression. See examples below.
  - If searching for sub-tags, remember to escape the slashes in regular expressions: `\/`

> [!released]
>
> - `regex matches` and `regex does not match` were introduced in Tasks 1.13.0.
> - `no tags` and `has tags` were introduced in Tasks 2.0.0.

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
  - Essential reading: [[Regular Expressions|Regular Expression Searches]].

> [!released]
`regex matches` and `regex does not match` were introduced in Tasks 1.12.0.

### Root

> [!released]
> Introduced in Tasks 3.4.0.

The `root` is the top-level folder of the file that contains the task, that is, the first directory in the path, which will be `/` for files in root of the vault.

- `root (includes|does not include) <root>`
  - Matches case-insensitive (disregards capitalization).
- `root (regex matches|regex does not match) /<JavaScript-style Regex>/`
  - Does regular expression match (case-sensitive by default).
  - Essential reading: [[Regular Expressions|Regular Expression Searches]].

### Folder

> [!released]
> Introduced in Tasks 3.4.0.

This is the `folder` to the file that contains the task, which will be `/` for files in root of the vault.

- `folder (includes|does not include) <folder>`
  - Matches case-insensitive (disregards capitalization).
- `folder (regex matches|regex does not match) /<JavaScript-style Regex>/`
  - Does regular expression match (case-sensitive by default).
  - Essential reading: [[Regular Expressions|Regular Expression Searches]].

### File Name

> [!released]
Introduced in Tasks 1.13.0.

Note that the file name includes the `.md` extension.

- `filename (includes|does not include) <filename>`
  - Matches case-insensitive (disregards capitalization).
- `filename (regex matches|regex does not match) /<JavaScript-style Regex>/`
  - Does regular expression match (case-sensitive by default).
  - Essential reading: [[Regular Expressions|Regular Expression Searches]].

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
  - Essential reading: [[Regular Expressions|Regular Expression Searches]].

> [!released]
`regex matches` and `regex does not match` were introduced in Tasks 1.12.0.

## Appendix: Tasks 2.0.0 improvements to date filters

Tasks 2.0.0 introduced the concept of filtering for date ranges.

In all cases, this new feature improves the results of Tasks date filters.

This Appendix shows how the results of various searches have changes, to enable you to decide whether any existing searches need to be updated.

### due (before|on|in||after) absolute date: results unchanged

Unchanged interpretation of various **[[Filters#Absolute dates|absolute due date]]** filters:

| keyword     | Tasks 1.25.0 and earlier                                                                          | Tasks 2.0.0 onwards                                                                              |
| ----------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| **Summary** | All searches behave logically, using the correct date.                                            | Identical behaviour to previous releases.                                                         |
| `before`    | `due before 2023-02-09` =><br>  due date is before<br>2023-02-09 (Thursday 9th February 2023)<br> | `due before 2023-02-09` =><br>  due date is before<br>2023-02-09 (Thursday 9th February 2023)<br> |
| `on`        | `due on 2023-02-09` =><br>  due date is on<br>2023-02-09 (Thursday 9th February 2023)<br>         | `due on 2023-02-09` =><br>  due date is on<br>2023-02-09 (Thursday 9th February 2023)<br>         |
| `in`        | `due in 2023-02-09` =><br>  due date is on<br>2023-02-09 (Thursday 9th February 2023)<br>         | `due in 2023-02-09` =><br>  due date is on<br>2023-02-09 (Thursday 9th February 2023)<br>         |
|             | `due 2023-02-09` =><br>  due date is on<br>2023-02-09 (Thursday 9th February 2023)<br>            | `due 2023-02-09` =><br>  due date is on<br>2023-02-09 (Thursday 9th February 2023)<br>            |
| `after`     | `due after 2023-02-09` =><br>  due date is after<br>2023-02-09 (Thursday 9th February 2023)<br>   | `due after 2023-02-09` =><br>  due date is after<br>2023-02-09 (Thursday 9th February 2023)<br>   |

### due (before|on|in||after) absolute date range: results improved

Differences in interpretation of various **[[Filters#Absolute date ranges|absolute due date range]]** filters:

| keyword     | Tasks 1.25.0 and earlier                                                                                    | Tasks 2.0.0 onwards                                                                                                                                               |
| ----------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Summary** | The second date is ignored: only the first date is used.                                                    | The values are interpreted as a date range.<br>`after` takes the end date in to account.                                                                                                                                                                   |
| `before`    | `due before 2023-02-07 2023-02-11` =><br>  due date is before<br>2023-02-07 (Tuesday 7th February 2023)<br> | `due before 2023-02-07 2023-02-11` =><br>  due date is before<br>2023-02-07 (Tuesday 7th February 2023)<br>                                                        |
| `on`        | `due on 2023-02-07 2023-02-11` =><br>  due date is on<br>2023-02-07 (Tuesday 7th February 2023)<br>         | `due on 2023-02-07 2023-02-11` =><br>  due date is between<br>2023-02-07 (Tuesday 7th February 2023) and<br>2023-02-11 (Saturday 11th February 2023) inclusive<br> |
| `in`        | `due in 2023-02-07 2023-02-11` =><br>  due date is on<br>2023-02-07 (Tuesday 7th February 2023)<br>         | `due in 2023-02-07 2023-02-11` =><br>  due date is between<br>2023-02-07 (Tuesday 7th February 2023) and<br>2023-02-11 (Saturday 11th February 2023) inclusive<br> |
|             | `due 2023-02-07 2023-02-11` =><br>  due date is on<br>2023-02-07 (Tuesday 7th February 2023)<br>            | `due 2023-02-07 2023-02-11` =><br>  due date is between<br>2023-02-07 (Tuesday 7th February 2023) and<br>2023-02-11 (Saturday 11th February 2023) inclusive<br>    |
| `after`     | `due after 2023-02-07 2023-02-11` =><br>  due date is after<br>2023-02-07 (Tuesday 7th February 2023)<br>   | `due after 2023-02-07 2023-02-11` =><br>  due date is after<br>2023-02-11 (Saturday 11th February 2023)<br>                                                        |

### due (before|on|in||after) last week: results improved

Differences in interpretation of various **[[Filters#Relative date ranges|relative due date range]]** filters, when run on `2023-02-10` (Friday 10th February 2023):

| keyword     | Tasks 1.25.0 and earlier                                                                       | Tasks 2.0.0 onwards                                                                                                                               |
| ----------- | ---------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Summary** | `last week` is interpreted as a single date:<br> `7 days before the current date`.             | `last week` is interpreted as a date range:<br>the previous `Monday to Sunday`.<br>`after` takes the end date in to account.                       |
| `before`    | `due before last week` =><br>  due date is before<br>2023-02-03 (Friday 3rd February 2023)<br> | `due before last week` =><br>  due date is before<br>2023-01-30 (Monday 30th January 2023)<br>                                                     |
| `on`        | `due on last week` =><br>  due date is on<br>2023-02-03 (Friday 3rd February 2023)<br>         | `due on last week` =><br>  due date is between<br>2023-01-30 (Monday 30th January 2023) and<br>2023-02-05 (Sunday 5th February 2023) inclusive<br> |
| `in`        | `due in last week` =><br>  due date is on<br>2023-02-03 (Friday 3rd February 2023)<br>         | `due in last week` =><br>  due date is between<br>2023-01-30 (Monday 30th January 2023) and<br>2023-02-05 (Sunday 5th February 2023) inclusive<br> |
|             | `due last week` =><br>  due date is on<br>2023-02-03 (Friday 3rd February 2023)<br>            | `due last week` =><br>  due date is between<br>2023-01-30 (Monday 30th January 2023) and<br>2023-02-05 (Sunday 5th February 2023) inclusive<br>    |
| `after`     | `due after last week` =><br>  due date is after<br>2023-02-03 (Friday 3rd February 2023)<br>   | `due after last week` =><br>  due date is after<br>2023-02-05 (Sunday 5th February 2023)<br>                                                       |

### due (before|on|in||after) this week: results improved

Differences in interpretation of various **[[Filters#Relative date ranges|relative due date range]]** filters, when run on `2023-02-10` (Friday 10th February 2023):

| keyword     | Tasks 1.25.0 and earlier                                                                       | Tasks 2.0.0 onwards                                                                                                                                |
| ----------- | ---------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Summary** | `this week` is interpreted as a single date:<br>`the sunday before the current date`           | `this week` is interpreted as a date range:<br>the `Monday to Sunday containing the current day`.<br>`after` takes the end date in to account.      |
| `before`    | `due before this week` =><br>  due date is before<br>2023-02-05 (Sunday 5th February 2023)<br> | `due before this week` =><br>  due date is before<br>2023-02-06 (Monday 6th February 2023)<br>                                                      |
| `on`        | `due on this week` =><br>  due date is on<br>2023-02-05 (Sunday 5th February 2023)<br>         | `due on this week` =><br>  due date is between<br>2023-02-06 (Monday 6th February 2023) and<br>2023-02-12 (Sunday 12th February 2023) inclusive<br> |
| `in`        | `due in this week` =><br>  due date is on<br>2023-02-05 (Sunday 5th February 2023)<br>         | `due in this week` =><br>  due date is between<br>2023-02-06 (Monday 6th February 2023) and<br>2023-02-12 (Sunday 12th February 2023) inclusive<br> |
|             | `due this week` =><br>  due date is on<br>2023-02-05 (Sunday 5th February 2023)<br>            | `due this week` =><br>  due date is between<br>2023-02-06 (Monday 6th February 2023) and<br>2023-02-12 (Sunday 12th February 2023) inclusive<br>    |
| `after`     | `due after this week` =><br>  due date is after<br>2023-02-05 (Sunday 5th February 2023)<br>   | `due after this week` =><br>  due date is after<br>2023-02-12 (Sunday 12th February 2023)<br>                                                       |

### due (before|on|in||after) next week: results improved

Differences in interpretation of various **[[Filters#Relative date ranges|relative due date range]]** filters, when run on `2023-02-10` (Friday 10th February 2023):

| keyword     | Tasks 1.25.0 and earlier                                                                        | Tasks 2.0.0 onwards                                                                                                                                 |
| ----------- | ----------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Summary** | `next week` is interpreted as a single date:<br> `7 days after the current date`.               | `next week` is interpreted as a date range:<br>the next `Monday to Sunday`.<br>`after` takes the end date in to account.                             |
| `before`    | `due before next week` =><br>  due date is before<br>2023-02-17 (Friday 17th February 2023)<br> | `due before next week` =><br>  due date is before<br>2023-02-13 (Monday 13th February 2023)<br>                                                      |
| `on`        | `due on next week` =><br>  due date is on<br>2023-02-17 (Friday 17th February 2023)<br>         | `due on next week` =><br>  due date is between<br>2023-02-13 (Monday 13th February 2023) and<br>2023-02-19 (Sunday 19th February 2023) inclusive<br> |
| `in`        | `due in next week` =><br>  due date is on<br>2023-02-17 (Friday 17th February 2023)<br>         | `due in next week` =><br>  due date is between<br>2023-02-13 (Monday 13th February 2023) and<br>2023-02-19 (Sunday 19th February 2023) inclusive<br> |
|             | `due next week` =><br>  due date is on<br>2023-02-17 (Friday 17th February 2023)<br>            | `due next week` =><br>  due date is between<br>2023-02-13 (Monday 13th February 2023) and<br>2023-02-19 (Sunday 19th February 2023) inclusive<br>    |
| `after`     | `due after next week` =><br>  due date is after<br>2023-02-17 (Friday 17th February 2023)<br>   | `due after next week` =><br>  due date is after<br>2023-02-19 (Sunday 19th February 2023)<br>                                                        |
