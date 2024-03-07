---
publish: true
---

# Filters

<span class="related-pages">#feature/filters</span>

<!-- NEW_QUERY_INSTRUCTION_EDIT_REQUIRED -->

## Contents

This page is long. Here are some links to the main sections:

- [[#Custom Filters]]
- [[#Searching for dates]]
- [[#Text filters]]
- [[#Matching multiple filters]]
- [[#Filters for Task Statuses]]
- [[#Filters for Task Dependencies]]
- [[#Filters for Dates in Tasks]]
- [[#Filters for Other Task Properties]]
- [[#Filters for File Properties]]
- [[#Appendix: Tasks 2.0.0 improvements to date filters]]

## Custom Filters

> [!released]
> `filter by function` was introduced in Tasks 4.2.0.

Tasks provides many built-in filtering options, but sometimes they don't quite do what is wanted by all users.

Now Tasks has a powerful mechanism for you to create your own **custom filters**, offering incredible flexibility.

There are many examples of the custom filtering instruction `filter by function` in the documentation below, with explanations, for when the instructions built in to Tasks do not satisfy your preferences.

You can find out more about this very powerful facility in [[Custom Filters]].

## Searching for dates

Tasks allows a lot of flexibility in the dates inside query blocks.

There are basically two broad types of date search:

- [[#Searching particular dates]]
- [[#Searching date ranges]]

### Searching particular dates

This section describes searches that use single dates, for example:

    ```tasks
    starts before 2023-04-20
    due on or before today
    ```

See also [[#Searching date ranges]].

#### Date search options

There are several options available when searching with a particular date:

- `on <date>` or `<date>`
  - will match the date.
  - `on` is the default for date searches and may be omitted.
- `before <date>`
  - will match all dates before the date.
- `after <date>`
  - will match all dates after the date.
- `on or before <date>`
  - will match the date and all earlier dates.
- `on or after <date>`
  - will match the date and all later dates.

This table may help visualise these options:

| option         | all earlier dates | `search date` | all later dates |
|----------------| ----------------- | ------------ | --------------- |
| `before`       | matches           |              |                 |
| `on or before` | matches           | matches      |                 |
| `on`           |                   | matches      |                 |
| `on or after`  |                   | matches      | matches         |
| `after`        |                   |              | matches         |

> [!released]
> `on or before` and `on or after` were introduced in Tasks 4.6.0.

#### Absolute dates

`<date>` filters can be given with 'absolute' dates, whose preferred format is `YYYY-MM-DD`.

Absolute dates specify a **particular date in a calendar**. They represent the same day, regardless of today's date.

Examples:

- `2021-05-25`
- `25th May 2023`
  - The [chrono](https://github.com/wanasit/chrono) library reads dates very flexibly, so you can use free text for absolute dates in your filters.
  - The `YYYY-MM-DD` format is somewhat safer, though, as there is no chance of ambiguity in reading your text.

#### Relative dates

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

Tasks allows date searches to specify a pair of dates, `<date range>`.

This section describes date range searches, for example:

    ```tasks
    due 2023-11-25 2023-11-30
    happens this week
    ```

See also [[#Searching particular dates]].

#### Date range options

There are several options available when searching with date ranges:

- `in <date range>` or `<date range>`
  - will match the **start** date, the **end** date and all dates in between.
  - `in` is the default for date range searches and may be omitted.
- `before <date range>`
  - will match all dates before the **start** date.
- `after <date range>`
  - will match all dates after the **end** date.
- `in or before <date range>`
  - will match the **end** date and all earlier dates.
- `in or after <date range>`
  - will match the **start** date and all later dates.

This table may help visualise these options:

| option         | all earlier dates | `start date` | all dates<br>inside the range | `end date` | all later dates |
| -------------- | ----------------- | ------------ | -------------------------------- | ---------- | --------------- |
| `before`       | matches           |              |                                  |            |                 |
| `in or before` | matches           | matches      | matches                          | matches    |                 |
| `in`           |                   | matches      | matches                          | matches    |                 |
| `in or after`  |                   | matches      | matches                          | matches    | matches         |
| `after`        |                   |              |                                  |            | matches         |

> [!released]
> `in or before` and `in or after` were introduced in Tasks 4.6.0.

#### Absolute date ranges

`<date range>` may be specified as 2 valid dates in `YYYY-MM-DD` format.

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
- `on or before next year`

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

## Filters for Task Statuses

### Status

- `done` - matches tasks with status types `DONE`, `CANCELLED` and `NON_TASK`
- `not done` - matches tasks with status types `TODO` and `IN_PROGRESS`

> [!info]
> Prior to Tasks 1.23.0, there was no concept of task status type, and so only the status symbol was used:
>
> - a task with `[ ]` used to count as `not done`
> - any other character than space used to count as `done`
>
> The new behaviour is more flexible and was required to introduce support for in-progress and cancelled tasks. If the original behaviour is preferred, you can change the status types of every symbol except `space` to `DONE`. See [[Set up custom statuses|How to set up your custom statuses]].

Since Tasks 4.2.0, **[[Custom Filters|custom filtering]] by status** is now possible, using `task.isDone`.

<!-- placeholder to force blank line before included text --><!-- include: CustomFilteringExamples.test.other_properties_task.isDone_docs.approved.md -->

```javascript
filter by function task.isDone
```

- Same as the `done` filter, but might be useful in conjunction with other expressions on the same line.

```javascript
filter by function ! task.isDone
```

- Same as the `not done` filter, but might be useful in conjunction with other expressions on the same line.

<!-- placeholder to force blank line after included text --><!-- endInclude -->

> [!NOTE]
> `task.status.type` (see [[#Status Type]]) gives more precision in custom filters than `task.isDone`.

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

Since Tasks 4.2.0, **[[Custom Filters|custom filtering]] by status names** is now possible, using `task.status.name`.

<!-- placeholder to force blank line before included text --><!-- include: CustomFilteringExamples.test.statuses_task.status.name_docs.approved.md -->

```javascript
filter by function task.status.name === 'Unknown'
```

- Find all tasks with custom statuses not yet added to the Tasks settings.

<!-- placeholder to force blank line after included text --><!-- endInclude -->

### Status Type

- `status.type (is|is not) (TODO|DONE|IN_PROGRESS|CANCELLED|NON_TASK)`
  - The values `TODO` etc are case-insensitive: you can use `in_progress`, for example
- This searches the types you have given to your custom statuses.
- This search is efficient if you wish to find all tasks that are `IN_PROGRESS`, and you have set up your statuses to have `[/]`, `[d]` and perhaps several others all treated as `IN_PROGRESS`.
- To search for multiple possible status types:
  - To exclude multiple values, you can use multiple `status.type is not` lines.
  - To allow multiple values, use a boolean combination, for example: `( status.type is TODO ) OR ( status.type is IN_PROGRESS )`.
  - Or see the 'custom filtering' examples below.

> [!released]
`status.type` text searching was introduced in Tasks 1.23.0.

For more information, including adding your own customised statuses, see [[Statuses]].

Since Tasks 4.2.0, **[[Custom Filters|custom filtering]] by status type** is now possible, using `task.status.type`.

<!-- placeholder to force blank line before included text --><!-- include: CustomFilteringExamples.test.statuses_task.status.type_docs.approved.md -->

```javascript
filter by function task.status.type === 'NON_TASK'
```

- Find tasks of type `NON_TASK`.

```javascript
filter by function 'TODO,IN_PROGRESS'.includes(task.status.type)
```

- Find tasks that are either type `TODO` or type `IN_PROGRESS`.
- This can be more convenient than doing Boolean `OR` searches.

```javascript
filter by function ! 'NON_TASK,CANCELLED'.includes(task.status.type)
```

- Find tasks that are not type `NON_TASK` and not type `CANCELLED`.

<!-- placeholder to force blank line after included text --><!-- endInclude -->

### Status Symbol

There is no built-in instruction to filter by status symbols.

Since Tasks 4.2.0, **[[Custom Filters|custom filtering]] by status symbol** is now possible, using `task.status.symbol`.

<!-- placeholder to force blank line before included text --><!-- include: CustomFilteringExamples.test.statuses_task.status.symbol_docs.approved.md -->

```javascript
filter by function task.status.symbol === '-'
```

- Find tasks with a checkbox `[-]`, which is conventionally used to mean "cancelled".

```javascript
filter by function task.status.symbol !== ' '
```

- Find tasks with anything but the space character as their status symbol, that is, without the checkbox `[ ]`.

```javascript
filter by function \
    const symbol = task.status.symbol; \
    return symbol === 'P' || symbol === 'C' || symbol === 'Q' || symbol === 'A';
```

- Note that because we use a variable to avoid repetition, we need to add `return`
- Find tasks with status symbol `P`, `C`, `Q` or `A`.
- This can get quite verbose, the more symbols you want to search for.

```javascript
filter by function 'PCQA'.includes(task.status.symbol)
```

- Find tasks with status symbol `P`, `C`, `Q` or `A`.
- This is a convenient shortcut over a longer statement testing each allowed value independently.

```javascript
filter by function !' -x/'.includes(task.status.symbol)
```

- Find tasks with any status symbol not supported by Tasks in the default settings.

<!-- placeholder to force blank line after included text --><!-- endInclude -->

### Next Status Symbol

There is no built-in instruction to filter by next status symbols.

Since Tasks 4.2.0, **[[Custom Filters|custom filtering]] by next status symbol** is now possible, using `task.status.nextSymbol`.

<!-- placeholder to force blank line before included text --><!-- include: CustomFilteringExamples.test.statuses_task.status.nextSymbol_docs.approved.md -->

```javascript
filter by function task.status.symbol === task.status.nextSymbol
```

- Find tasks that toggle to themselves, because the next symbol is the same as the current symbol.

<!-- placeholder to force blank line after included text --><!-- endInclude -->

### Status Examples

Find any tasks that have status symbols you have not yet added to your Tasks settings:

    ```tasks
    status.name includes unknown
    group by path
    ```

## Filters for Task Dependencies

At a high level, task dependencies define the order in which you want to work on a set of tasks. You can read more about them in [[Task Dependencies]].

> [!released]
> Task Dependencies were introduced in Tasks 6.1.0.

### Blocking Tasks

- `is blocking`
  - This shows tasks that you probably want to do first, as they are preventing other tasks from being done.
- `is not blocking`
  - This shows tasks that are not preventing others from being done, so perhaps may be considered as lower priority.
  - This would typically be used with `not done`.

A task is treated as `blocking` if:

- it has an `id` value,
- at least one other task in the vault has that `id` value in its `dependsOn` list,
- both tasks have status type `TODO` or `IN_PROGRESS`.

For example:

```text
- [ ] I am blocking 🆔 12345
- [ ] I am not blocking ⛔ 12345
```

Note also:

- Only direct dependencies are considered.
- Tasks with status type `DONE`, `CANCELLED` or `NON_TASK` are never treated as `blocking`.

For more information, see [[Task Dependencies]].

> [!released]
>
> - `is blocking` and `is not blocking` were introduced in Tasks 6.1.0.

### Blocked Tasks

- `is blocked`
  - This shows tasks you cannot currently do, as they are waiting for another task to be completed.
- `is not blocked`
  - This shows tasks that are not waiting for any other tasks to be completed.
  - This would typically be used with `not done`.

A task is treated as `blocked` if:

- it has one or more `dependsOn` values,
- its `dependsOn` list includes the id any tasks in the vault,
- both tasks have status type `TODO` or `IN_PROGRESS`.

For example:

```text
- [ ] I am not blocked 🆔 12345
- [ ] I am blocked ⛔ 12345
```

Note also:

- Only direct dependencies are considered.
- Tasks with status type `DONE`, `CANCELLED` or `NON_TASK` are never treated as `blocked`.

For more information, see [[Task Dependencies]].

> [!released]
>
> - `is blocked` and `is not blocked` were introduced in Tasks 6.1.0.

### Id

The `id` field adds an identifier to a task, so that other tasks may be marked as `dependsOn` that task.

- `has id`
- `no id`
- `id (includes|does not include) <string>`
  - Matches case-insensitive (disregards capitalization).
- `id (regex matches|regex does not match) /<JavaScript-style Regex>/`
  - Does regular expression match (case-sensitive by default).
  - Essential reading: [[Regular Expressions|Regular Expression Searches]].

For more information, see [[Task Dependencies]].

> [!released]
>
> - Task Id was introduced in Tasks 6.1.0.

Since Tasks 6.1.0, **[[Custom Filters|custom filtering]] by Id** is now possible, using `task.id`.

### Depends On

The `dependsOn` field allows a task to be marked as depending on the `id` of one or more other tasks. Multiple `id` values are separated by commas (`,`) with no spaces.

- `has depends on`
- `no depends on`

For more information, see [[Task Dependencies]].

> [!released]
>
> - Task Depends On was introduced in Tasks 6.1.0.

Since Tasks 6.1.0, **[[Custom Filters|custom filtering]] by Depends On** is now possible, using `task.dependsOn`.

## Filters for Dates in Tasks

### Due Date

- `no due date`
- `has due date`
- `due (on|before|after|on or before|on or after) <date>`
- `due (in|before|after|in or before|in or after) <date range>`
  - `YYYY-MM-DD YYYY-MM-DD`
  - `(last|this|next) (week|month|quarter|year)`
  - `(YYYY-Www|YYYY-mm|YYYY-Qq|YYYY)`
- `due date is invalid`

For more information, see [[Dates#Due date|Due date]].

> [!released]
>
> - `has due date` was introduced in Tasks 1.6.0.
> - `due date is invalid` was introduced in Tasks 1.16.0.
> - `due (before|after|in) <date range>` searches were introduced in Tasks 2.0.0.
> - `due (before|after|in) (YYYY-Www|YYYY-mm|YYYY-Qq|YYYY)` searches were introduced in Tasks 3.1.0.
> - `due (on or before|on or after) <date>` and `due (in or before|in or after) <date range>` searches were introduced in Tasks 4.6.0

Since Tasks 4.2.0, **[[Custom Filters|custom filtering]] by due date** is now possible, using `task.due`.

These examples all use  `task.due` property, which is a `TasksDate` object. See [[Task Properties#Values in TasksDate Properties|Values in TasksDate Properties]] to explore its capabilities.

Some of these examples use the [moment.js format characters](https://momentjs.com/docs/#/displaying/format/).

<!-- placeholder to force blank line before included text --><!-- include: CustomFilteringExamples.test.dates_task.due_docs.approved.md -->

```javascript
filter by function task.due.format('dddd') === 'Tuesday'
```

- Find tasks due on Tuesdays, that is, any Tuesday.
- On non-English systems, you may need to supply the day of the week in the local language.

<!-- placeholder to force blank line after included text --><!-- endInclude -->

For users who are comfortable with JavaScript, these more complicated examples may also be of interest:

<!-- placeholder to force blank line before included text --><!-- include: CustomFilteringExamples.test.dates_task.due.advanced_docs.approved.md -->

```javascript
filter by function \
    const date = task.due.moment; \
    return date ? !date.isValid() : false;
```

- Like `due date is invalid`.
- It matches tasks that have a due date and the due date is invalid, such as `2022-13-32`

```javascript
filter by function task.due.moment?.isSameOrBefore(moment(), 'day') || false
```

- Find all tasks due today or earlier.
- `moment()` returns the current date and time, which we need to convert to the start of the day.
- As the second parameter determines the precision, and not just a single value to check, using 'day' will check for year, month and day.
- See the documentation of [isSameOrBefore](https://momentjscom.readthedocs.io/en/latest/moment/05-query/04-is-same-or-before/).

```javascript
filter by function task.due.moment?.isSameOrAfter(moment(), 'day') || false
```

- Due today or later.

```javascript
filter by function task.due.moment?.isSame(moment('2023-05-31'), 'day') || false
```

- Find all tasks due on 31 May 2023.

```javascript
filter by function task.due.moment?.isSame(moment('2023-05-31'), 'week') || false
```

- Find all tasks due in the week of 31 May 2023.

<!-- placeholder to force blank line after included text --><!-- endInclude -->

### Done Date

- `no done date`
- `has done date`
- `done (on|before|after|on or before|on or after) <date>`
- `done (in|before|after|in or before|in or after) <date range>`
  - `YYYY-MM-DD YYYY-MM-DD`
  - `(last|this|next) (week|month|quarter|year)`
  - `(YYYY-Www|YYYY-mm|YYYY-Qq|YYYY)`
- `done date is invalid`

For more information, see [[Dates#Done date|Done date]].

> [!released]
>
> - `no done date` and `has done date` were introduced in Tasks 1.7.0.
> - `done date is invalid` was introduced in Tasks 1.16.0.
> - `done (before|after|in) <date range>` searches were introduced in Tasks 2.0.0.
> - `done (before|after|in) (YYYY-Www|YYYY-mm|YYYY-Qq|YYYY)` searches were introduced in Tasks 3.1.0.
> - `done (on or before|on or after) <date>` and `done (in or before|in or after) <date range>` searches were introduced in Tasks 4.6.0

Since Tasks 4.2.0, **[[Custom Filters|custom filtering]] by done date** is now possible, using `task.done`.

<!-- placeholder to force blank line before included text --><!-- include: CustomFilteringExamples.test.dates_task.done_docs.approved.md -->

```javascript
filter by function task.done.format('dddd') === 'Thursday'
```

- Find tasks done on Thursdays, that is, any Thursday.
- On non-English systems, you may need to supply the day of the week in the local language.

<!-- placeholder to force blank line after included text --><!-- endInclude -->

For more examples, see [[#Due Date]].

### Scheduled Date

- `no scheduled date`
- `has scheduled date`
- `scheduled (on|before|after|on or before|on or after) <date>`
- `scheduled (in|before|after|in or before|in or after) <date range>`
  - `YYYY-MM-DD YYYY-MM-DD`
  - `(last|this|next) (week|month|quarter|year)`
  - `(YYYY-Www|YYYY-mm|YYYY-Qq|YYYY)`
- `scheduled date is invalid`

For more information, see [[Dates#Scheduled date|Scheduled date]].

> [!released]
>
> - `has scheduled date` was introduced in Tasks 1.6.0.
> - `scheduled date is invalid` was introduced in Tasks 1.16.0.
> - `scheduled (before|after|in) <date range>` searches were introduced in Tasks 2.0.0.
> - `scheduled (before|after|in) (YYYY-Www|YYYY-mm|YYYY-Qq|YYYY)` searches were introduced in Tasks 3.1.0.
> - `scheduled (on or before|on or after) <date>` and `scheduled (in or before|in or after) <date range>` searches were introduced in Tasks 4.6.0

Since Tasks 4.2.0, **[[Custom Filters|custom filtering]] by scheduled date** is now possible, using `task.scheduled`.

<!-- placeholder to force blank line before included text --><!-- include: CustomFilteringExamples.test.dates_task.scheduled_docs.approved.md -->

```javascript
filter by function task.scheduled.format('dddd') === 'Wednesday'
```

- Find tasks scheduled on Wednesdays, that is, any Wednesday.
- On non-English systems, you may need to supply the day of the week in the local language.

<!-- placeholder to force blank line after included text --><!-- endInclude -->

For more examples, see [[#Due Date]].

### Start Date

- `no start date`
- `has start date`
- `starts (on|before|after|on or before|on or after) <date>`
- `starts (in|before|after|in or before|in or after) <date range>`
  - `YYYY-MM-DD YYYY-MM-DD`
  - `(last|this|next) (week|month|quarter|year)`
  - `(YYYY-Www|YYYY-mm|YYYY-Qq|YYYY)`
- `start date is invalid`

For more information, see [[Dates#Start date|Start date]].

> [!released]
>
> - `has start date` was Introduced in Tasks 1.6.0.
> - `start date is invalid` was introduced in Tasks 1.16.0.
> - `starts (before|after|in) <date range>` searches were introduced in Tasks 2.0.0.
> - `starts (before|after|in) (YYYY-Www|YYYY-mm|YYYY-Qq|YYYY)` searches were introduced in Tasks 3.1.0.
> - `starts (on or before|on or after) <date>` and `starts (in or before|in or after) <date range>` searches were introduced in Tasks 4.6.0

Since Tasks 4.2.0, **[[Custom Filters|custom filtering]] by start date** is now possible, using `task.start`.

<!-- placeholder to force blank line before included text --><!-- include: CustomFilteringExamples.test.dates_task.start_docs.approved.md -->

```javascript
filter by function task.start.format('dddd') === 'Sunday'
```

- Find tasks starting on Sundays, that is, any Sunday.
- On non-English systems, you may need to supply the day of the week in the local language.

<!-- placeholder to force blank line after included text --><!-- endInclude -->

For more examples, see [[#Due Date]].

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
- `created (on|before|after|on or before|on or after) <date>`
- `created (in|before|after|in or before|in or after) <date range>`
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
> - `created (on or before|on or after) <date>` and `created (in or before|in or after) <date range>` searches were introduced in Tasks 4.6.0

Since Tasks 4.2.0, **[[Custom Filters|custom filtering]] by created date** is now possible, using `task.created`.

<!-- placeholder to force blank line before included text --><!-- include: CustomFilteringExamples.test.dates_task.created_docs.approved.md -->

```javascript
filter by function task.created.format('dddd') === 'Monday'
```

- Find tasks created on Mondays, that is, any Monday.
- On non-English systems, you may need to supply the day of the week in the local language.

<!-- placeholder to force blank line after included text --><!-- endInclude -->

For more examples, see [[#Due Date]].

### Cancelled Date

- `no cancelled date`
- `has cancelled date`
- `cancelled (on|before|after|on or before|on or after) <date>`
- `cancelled (in|before|after|in or before|in or after) <date range>`
  - `YYYY-MM-DD YYYY-MM-DD`
  - `(last|this|next) (week|month|quarter|year)`
  - `(YYYY-Www|YYYY-mm|YYYY-Qq|YYYY)`
- `cancelled date is invalid`

For more information, see [[Dates#Cancelled date|Cancelled date]].

Such a filter could be:

    ```tasks
    cancelled yesterday
    ```

> [!released]
>
> - Cancelled date was introduced in Tasks 5.5.0.

Since Tasks 5.5.0, **[[Custom Filters|custom filtering]] by cancelled date** is now possible, using `task.cancelled`.

<!-- placeholder to force blank line before included text --><!-- include: CustomFilteringExamples.test.dates_task.cancelled_docs.approved.md -->

```javascript
filter by function task.cancelled.format('dddd') === 'Wednesday'
```

- Find tasks cancelled on Wednesdays, that is, any Wednesday.
- On non-English systems, you may need to supply the day of the week in the local language.

<!-- placeholder to force blank line after included text --><!-- endInclude -->

For more examples, see [[#Due Date]].

### Happens

- `happens (on|before|after|on or before|on or after) <date>`
- `happens (in|before|after|in or before|in or after) <date range>`
  - `YYYY-MM-DD YYYY-MM-DD`
  - `(last|this|next) (week|month|quarter|year)`
  - `(YYYY-Www|YYYY-mm|YYYY-Qq|YYYY)`

`happens` returns any task for a matching start date, scheduled date, _or_ due date.
For example, `happens before tomorrow` will return all tasks that are starting, scheduled, or due earlier than tomorrow.
If a task starts today and is due in a week from today, `happens before tomorrow` will match,
because the tasks starts before tomorrow. Only one of the dates needs to match.

Invalid start, scheduled or due dates are ignored by `happens`.

- `no happens date`
  - Return tasks where _none_ of start date, scheduled date, and due date are set.
- `has happens date`
  - Return tasks where _any_ of start date, scheduled date, _or_ due date are set.

> [!released]
>
> - `no happens date` and `has happens date` were introduced in Tasks 1.7.0.
> - `happens (before|after|in) <date range>` searches were introduced in Tasks 2.0.0.
> - `happens (before|after|in) (YYYY-Www|YYYY-mm|YYYY-Qq|YYYY)` searches were introduced in Tasks 3.1.0.
> - `happens (on or before|on or after) <date>` and `happens (in or before|in or after) <date range>` searches were introduced in Tasks 4.6.0

Since Tasks 4.2.0, **[[Custom Filters|custom filtering]] by happens date** is now possible, using `task.happens`.

<!-- placeholder to force blank line before included text --><!-- include: CustomFilteringExamples.test.dates_task.happens_docs.approved.md -->

```javascript
filter by function task.happens.format('dddd') === 'Friday'
```

- Find tasks happens on Fridays, that is, any Friday.
- On non-English systems, you may need to supply the day of the week in the local language.

<!-- placeholder to force blank line after included text --><!-- endInclude -->

For more examples, see [[#Due Date]].

### Troubleshooting date searches

If your date searches are giving unexpected results, add an [[Explaining Queries|explain]] line to your query.

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

Since Tasks 4.2.0, **[[Custom Filters|custom filtering]] by description** is now possible, using `task.description`.

<!-- placeholder to force blank line before included text --><!-- include: CustomFilteringExamples.test.other_properties_task.description_docs.approved.md -->

```javascript
filter by function task.description.length > 100
```

- Find tasks with long descriptions.

<!-- placeholder to force blank line after included text --><!-- endInclude -->

### Description without tags

Since Tasks 4.2.0, it is possible to remove tags from the descriptions in custom filters, for use in **[[Custom Filters|custom filtering]]**, using `task.descriptionWithoutTags`.

<!-- placeholder to force blank line before included text --><!-- include: CustomFilteringExamples.test.other_properties_task.descriptionWithoutTags_docs.approved.md -->

<!-- placeholder to force blank line after included text --><!-- endInclude -->

### Priority

- `priority is (above|below|not)? (lowest|low|none|medium|high|highest)`

The available priorities are (from high to low):

1. 🔺 for highest priority
2. ⏫ for high priority
3. 🔼 for medium priority
4. use no signifier to indicate no priority (searched for with 'none')
5. 🔽 for low priority
6. ⏬️ for lowest priority

For more information, see [[Priority|Priorities]].

> [!released]
> Priorities 'lowest' and 'highest' were introduced in Tasks 3.9.0.

Since Tasks 4.2.0, **[[Custom Filters|custom filtering]] by priority name and number** is now possible, using `task.priorityName` and `task.priorityNumber`.

Using the priority name:

<!-- placeholder to force blank line before included text --><!-- include: CustomFilteringExamples.test.other_properties_task.priorityName_docs.approved.md -->

```javascript
filter by function task.priorityName !== 'Normal'
```

- The same as `priority is not none`.

<!-- placeholder to force blank line after included text --><!-- endInclude -->

Using the priority number:

<!-- placeholder to force blank line before included text --><!-- include: CustomFilteringExamples.test.other_properties_task.priorityNumber_docs.approved.md -->

```javascript
filter by function task.priorityNumber % 2 === 0
```

- Filter using the task's priority number, where Highest is 0 and Lowest is 5.
- This artificial example finds all the tasks with even priority numbers, so Highest, Medium and Low priorities.

<!-- placeholder to force blank line after included text --><!-- endInclude -->

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

### Urgency

There is no built-in instruction to filter by urgency.

Since Tasks 4.2.0, **[[Custom Filters|custom filtering]] by urgency** is now possible, using `task.urgency`.

> [!Warning]
> Please read the following examples carefully. To use `task.urgency`  with `filter by function` successfully, it is important to understand how to handle searches for non-integer numbers.

<!-- placeholder to force blank line before included text --><!-- include: CustomFilteringExamples.test.other_properties_task.urgency_docs.approved.md -->

```javascript
filter by function task.urgency > 8.9999
```

- Find tasks with an urgency score above `9.0`.
- Note that limiting value used is `8.9999`.
- Searches that compare two urgency values for 'less than' or 'more than' (using one of `>`, `>=`, `<` or `<=`) **must adjust their values slightly to allow for rounding**.

```javascript
filter by function task.urgency > 7.9999 && task.urgency < 11.0001
```

- Find tasks with an urgency score between `8.0` and `11.0`, inclusive.

```javascript
filter by function task.urgency.toFixed(2) === 1.95.toFixed(2)
```

- Find tasks with the [[Urgency#Why do all my tasks have urgency score 1.95?|default urgency]] of `1.95`.
- This is the correct way to do an equality or inequality search for any numeric values.
- The `.toFixed(2)` on both sides of the `===` ensures that two numbers being compared are both rounded to the same number of decimal places (2).
- This is important, to prevent being tripped up `10.29` being not exactly the same when comparing non-integer numbers.

```javascript
filter by function task.urgency.toFixed(2) !== 1.95.toFixed(2)
```

- Find tasks with any urgency other than the default score of `1.95`.

```javascript
filter by function task.urgency === 10.29
```

- **This will not find any tasks**.
- ==Do not use raw numbers in searches for equality or inequality of any numbers==, either seemingly integer or floating point ones.
- From using `group by urgency` and reviewing the headings, we might conclude that tasks with the following values have urgency `10.19`:
  - due tomorrow,
  - have no priority symbol.
- From this, it might be natural to presume that we can search for `task.urgency === 10.29`.
- However, our function is checking the following values for equality:
  - `task.urgency` is approximately:
    - `10.292857142857140928526860079728`
  - `10.29` is approximately:
    - `10.289999999999999147348717087880`
- These values are **not exactly equal**, so the test fails to find any matching tasks.

<!-- placeholder to force blank line after included text --><!-- endInclude -->

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

For more information, see [[Recurring Tasks]].

> [!released]
`recurrence` text searching was introduced in Tasks 1.22.0.

Since Tasks 4.2.0, **[[Custom Filters|custom filtering]] by recurrence** is now possible, using `task.isRecurring` and `task.recurrenceRule`.

Using `task.isRecurring`:

<!-- placeholder to force blank line before included text --><!-- include: CustomFilteringExamples.test.other_properties_task.isRecurring_docs.approved.md -->

```javascript
filter by function task.isRecurring
```

- This is identical to `is recurring`.
- It can be used with `&&` (Boolean AND) or `||` (Boolean OR) in conjunction with other conditions.

```javascript
filter by function !task.isRecurring
```

- This is identical to `is not recurring`.
- It can be used with `&&` (Boolean AND) or `||` (Boolean OR) in conjunction with other conditions.

```javascript
filter by function (!task.isRecurring) && task.originalMarkdown.includes('🔁')
```

- Find tasks that have a **broken/invalid recurrence rule**.
- This assumes use of the Tasks emoji format, and should of course be updated if using another format.
- This uses knowledge of an implementation detail of Tasks, which is that recurrence rules are read and removed from the description even if they are invalid.
- So we have to search for the recurrence marker in `task.originalMarkdown` to see whether the original task contained the recurrence signifier when `task.isRecurring` even though false.

<!-- placeholder to force blank line after included text --><!-- endInclude -->

Using `task.recurrenceRule` - please read [[Task Properties#Values for Other Task Properties]] notes on `task.recurrenceRule` before use:

<!-- placeholder to force blank line before included text --><!-- include: CustomFilteringExamples.test.other_properties_task.recurrenceRule_docs.approved.md -->

```javascript
filter by function task.recurrenceRule.includes("every week")
```

- Similar to `recurrence includes every week`, but case-sensitive.

```javascript
filter by function !task.recurrenceRule.includes("every week")
```

- Similar to `recurrence does not include every week`, but case-sensitive.

```javascript
filter by function task.recurrenceRule.includes("every week") && task.recurrenceRule.includes("when done")
```

- Find tasks that are due every week, and **do** contain `when done` in their recurrence rule.

```javascript
filter by function task.recurrenceRule.includes("every week") && !task.recurrenceRule.includes("when done")
```

- Find tasks that are due every week, and do **not** contain `when done` in their recurrence rule.

<!-- placeholder to force blank line after included text --><!-- endInclude -->

### Sub-Items

- `exclude sub-items`
  - When this is set, the result list will only include tasks that are not indented in their file. It will only show tasks that are top level list items in their list.

### Tags

> [!released]
Introduced in Tasks 1.6.0.

See [[Tags]] for important information about how tags behave in the Tasks plugin.

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

Since Tasks 4.2.0, **[[Custom Filters|custom filtering]] by tags** is now possible, using `task.tags`.

<!-- placeholder to force blank line before included text --><!-- include: CustomFilteringExamples.test.other_properties_task.tags_docs.approved.md -->

```javascript
filter by function task.tags.length === 1
```

- Find tasks with exactly 1 tag (other than any global filter).

```javascript
filter by function task.tags.length > 1
```

- Find tasks with more than one tag (other than any global filter).

<!-- placeholder to force blank line after included text --><!-- endInclude -->

These are more complicated examples, which you might like to copy if you use tasks with [nested tags](https://help.obsidian.md/Editing+and+formatting/Tags#Nested+tags).

<!-- placeholder to force blank line before included text --><!-- include: CustomFilteringExamples.test.other_properties_task.tags.advanced_docs.approved.md -->

```javascript
filter by function task.tags.find( (tag) => tag.includes('/') ) && true || false
```

- Find all tasks that have at least one nested tag.

```javascript
filter by function task.tags.find( (tag) => tag.split('/').length >= 3 ) && true || false
```

- Find all tasks that have at least one doubly-nested tag, such as `#context/home/ground-floor`.
- This splits each tag at the `/` character, and counts as a match if there are at least 3 words.

<!-- placeholder to force blank line after included text --><!-- endInclude -->

#### Tag Query Examples

- `tags include #todo`
- `tags do not include #todo`
- `tag regex matches /#t$/`
  - Searches for a single-character tag `#t`, with no sub-tags, because `$` matches the end of the tag text.
- `tag regex matches /#book$/i`
  - The trailing `i` means case-insensitive.
  - Searches for tags such as `#book`,  `#Book`, `#BOOK` and the `$` prevents matching of `#books`,  `#book/literature`, etc.

### Original Markdown

There is no built-in instruction to filter by the original markdown line.

Since Tasks 4.2.0, **[[Custom Filters|custom filtering]] by original markdown line** is now possible, using `task.originalMarkdown`.

For example, this could be used to extract information from `task.originalMarkdown` that Tasks does not parse, to use for filtering tasks.

<!-- placeholder to force blank line before included text --><!-- include: CustomFilteringExamples.test.other_properties_task.originalMarkdown_docs.approved.md -->

<!-- placeholder to force blank line after included text --><!-- endInclude -->

## Filters for File Properties

These filters allow searching for tasks in particular files and sections of files.

### File Path

Note that the path includes the `.md` extension.

- `path (includes|does not include) <path>`
  - Matches case-insensitive (disregards capitalization).
  - Use `{{query.file.path}}` or `{{query.file.pathWithoutExtension}}` as a placeholder for the path of the file containing the current query.
    - For example, `path includes {{query.file.path}}`
    - Useful reading: [[Query Properties]] and [[Placeholders]]
- `path (regex matches|regex does not match) /<JavaScript-style Regex>/`
  - Does regular expression match (case-sensitive by default).
  - Essential reading: [[Regular Expressions|Regular Expression Searches]].

> [!released]
>
> - `regex matches` and `regex does not match` were introduced in Tasks 1.12.0.
> - Placeholders were released in Tasks 4.7.0.

Since Tasks 4.2.0, **[[Custom Filters|custom filtering]] by file path** is now possible, using `task.file.path`.

In Tasks 4.8.0 `task.file.pathWithoutExtension` was added.

Since Tasks 5.1.0, the query's file path can be used conveniently in custom filters:

- `query.file.path` or
- `query.file.pathWithoutExtension`
- Useful reading: [[Query Properties]].

<!-- placeholder to force blank line before included text --><!-- include: CustomFilteringExamples.test.file_properties_task.file.path_docs.approved.md -->

```javascript
filter by function task.file.path.includes('tasks releases/4.1.0 Release.md')
```

- Like 'path includes', except that it is **case-sensitive**: capitalisation matters.

```javascript
filter by function task.file.path === 'tasks releases/4.1.0 Release.md'
```

- An exact, **case-sensitive**, equality search.
- Note that the file extension needs to be included too.
- With built-in searches, this could only be done using a regular expression, with special characters `^` and `$`, and escaping any characters with special meaning such as `/`.

```javascript
filter by function task.file.path.toLocaleLowerCase() === 'TASKS RELEASES/4.1.0 RELEASE.MD'.toLocaleLowerCase()
```

- An exact, **non**-case-sensitive, equality search.
- By lower-casing both values, we do not have to worry about manually lower-casing them in our query.

<!-- placeholder to force blank line after included text --><!-- endInclude -->
### Root

> [!released]
>
> - Introduced in Tasks 3.4.0.
> - Placeholders were released in Tasks 4.7.0.

The `root` is the top-level folder of the file that contains the task, that is, the first directory in the path, which will be `/` for files in the root of the vault.

- `root (includes|does not include) <root>`
  - Matches case-insensitive (disregards capitalization).
  - Use `{{query.file.root}}` as a placeholder for the root of the file containing the current query.
    - For example, `root includes {{query.file.root}}`
    - Useful reading: [[Query Properties]] and [[Placeholders]]
- `root (regex matches|regex does not match) /<JavaScript-style Regex>/`
  - Does regular expression match (case-sensitive by default).
  - Essential reading: [[Regular Expressions|Regular Expression Searches]].

Since Tasks 4.2.0, **[[Custom Filters|custom filtering]] by root folder** is now possible, using `task.file.root`.

Since Tasks 5.1.0, the query's file root can be used conveniently in custom filters:

- `query.file.root`
- Useful reading: [[Query Properties]].

<!-- placeholder to force blank line before included text --><!-- include: CustomFilteringExamples.test.file_properties_task.file.root_docs.approved.md -->

```javascript
filter by function task.file.root === '/'
```

- Find tasks in files in the root of the vault.
- Note that this is **case-sensitive**: capitalisation matters.

```javascript
filter by function task.file.root === 'Work/'
```

- Find tasks in files inside the folder `Work` which is in the root of the vault.
- Note that this is **case-sensitive**: capitalisation matters.

<!-- placeholder to force blank line after included text --><!-- endInclude -->

### Folder

> [!released]
>
> - Introduced in Tasks 3.4.0.
> - Placeholders were released in Tasks 4.7.0.

This is the `folder` to the file that contains the task, which will be `/` for files in root of the vault.

- `folder (includes|does not include) <folder>`
  - Matches case-insensitive (disregards capitalization).
  - Use `{{query.file.folder}}` as a placeholder for the folder of the file containing the current query.
    - For example, `folder includes {{query.file.folder}}`, which will match tasks in the folder containing the query **and all sub-folders**.
    - Useful reading: [[Query Properties]] and [[Placeholders]]
- `folder (regex matches|regex does not match) /<JavaScript-style Regex>/`
  - Does regular expression match (case-sensitive by default).
  - Essential reading: [[Regular Expressions|Regular Expression Searches]].

Since Tasks 4.2.0, **[[Custom Filters|custom filtering]] by folder** is now possible, using `task.file.folder`.

Since Tasks 5.1.0, the query's file root can be used conveniently in custom filters:

- `query.file.root`
- Useful reading: [[Query Properties]].

<!-- placeholder to force blank line before included text --><!-- include: CustomFilteringExamples.test.file_properties_task.file.folder_docs.approved.md -->

```javascript
filter by function task.file.folder === "Work/Projects/"
```

- Find tasks in files in any file in the given folder **only**, and not any sub-folders.
- The equality test, `===`, requires that the trailing slash (`/`) be included.

```javascript
filter by function task.file.folder.includes("Work/Projects/")
```

- Find tasks in files in a specific folder **and any sub-folders**.

```javascript
filter by function task.file.folder.includes( query.file.folder )
```

- Find tasks in files in the folder that contains the query **and any sub-folders**.

```javascript
filter by function task.file.folder === query.file.folder
```

- Find tasks in files in the folder that contains the query only (**not tasks in any sub-folders**).

```javascript
filter by function task.file.folder.includes("Work/Projects")
```

- By leaving off the trailing slash (`/`) this would also find tasks in any file inside folders such as:
  - `Work/Projects 2023/`
  - `Work/Projects Top Secret/`

<!-- placeholder to force blank line after included text --><!-- endInclude -->

### File Name

> [!released]
>
> - Introduced in Tasks 3.4.0.
> - Placeholders were released in Tasks 4.7.0.

Note that the file name includes the `.md` extension.

- `filename (includes|does not include) <filename>`
  - Matches case-insensitive (disregards capitalization).
  - Use `{{query.file.filename}}`  or `{{query.file.filenameWithoutExtension}}` as a placeholder for the file name of the file containing the current query.
    - For example, `filename includes {{query.file.filename}}`
    - Useful reading: [[Query Properties]] and [[Placeholders]]
- `filename (regex matches|regex does not match) /<JavaScript-style Regex>/`
  - Does regular expression match (case-sensitive by default).
  - Essential reading: [[Regular Expressions|Regular Expression Searches]].

Since Tasks 4.2.0, **[[Custom Filters|custom filtering]] by file name** is now possible, using `task.file.filename`.

In Tasks 4.8.0 `task.file.filenameWithoutExtension` was added.

Since Tasks 5.1.0, the query's file name can be used conveniently in custom filters:

- `query.file.filename` or
- `query.file.filenameWithoutExtension`
- Useful reading: [[Query Properties]].

<!-- placeholder to force blank line before included text --><!-- include: CustomFilteringExamples.test.file_properties_task.file.filename_docs.approved.md -->

```javascript
filter by function task.file.filename === "4.1.0 Release.md"
```

- Find tasks in files with the exact file name, but in any folder.
- The equality test, `===`, requires that the file extension `.md` be included.

```javascript
filter by function task.file.filename.includes("4.1.0 Release")
```

- Find tasks in files whose name contains the given text.
- By using `.includes()` and leaving out the file extension, this will also find files such as `14.1.0 Release.md` and `4.1.0 Release Notes.md`.

<!-- placeholder to force blank line after included text --><!-- endInclude -->

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

Since Tasks 4.2.0, **[[Custom Filters|custom filtering]] by heading** is now possible, using `task.heading`.

> [!Tip]
> Heading searches can be very powerful: you can put information in headings and then write your searches to look for the information:
>
> - either on the task,
> - or if it's missing from the task, then look for it in the preceding heading.
>
> It is like a more generalisable version of the built-in mechanism to infer [[Use Filename as Default Date|a scheduled date from a filename]], under your own control.

<!-- placeholder to force blank line before included text --><!-- include: CustomFilteringExamples.test.file_properties_task.heading_docs.approved.md -->

```javascript
filter by function \
    const taskDate = task.due.moment; \
    const wanted = '2023-06-11'; \
    return taskDate?.isSame(wanted, 'day') || ( !taskDate && task.heading?.includes(wanted)) || false
```

- Find tasks that:
  - **either** due on the date `2023-06-11`,
  - **or** do not have a due date, and their preceding heading contains the same date as a string: `2023-06-11`.
- Note that because we use variables to avoid repetition of values, we need to add `return`.

```javascript
filter by function \
    const taskDate = task.due.moment; \
    const now = moment(); \
    return taskDate?.isSame(now, 'day') || ( !taskDate && task.heading?.includes(now.format('YYYY-MM-DD')) ) || false
```

- Find tasks that:
  - **either** due on today's date,
  - **or** do not have a due date, and their preceding heading contains today's date as a string, formatted as `YYYY-MM-DD`.

```javascript
filter by function \
    const wanted = '#context/home'; \
    return task.heading?.includes(wanted) || task.tags.find( (tag) => tag === wanted ) && true || false;
```

- Find tasks that:
  - **either** have a tag exactly matching `#context/home` on the task line,
  - **or** their preceding heading contains the text `#context/home` anywhere.
    - For demonstration purposes, this is slightly imprecise, in that it would also match nested tasks, such as `#context/home/ground-floor`.

<!-- placeholder to force blank line after included text --><!-- endInclude -->

![Custom filters can extract dates and tags from headings](images/search-headings-for-date-and-tag.png)
Custom filters can extract dates and tags from headings.

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
