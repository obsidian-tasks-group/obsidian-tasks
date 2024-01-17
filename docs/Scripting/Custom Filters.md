---
publish: true
---

# Custom Filters

<span class="related-pages">#feature/scripting #feature/filters</span>

> [!released]
> Custom filters were introduced in Tasks 4.2.0.

## Summary

- Define your own custom task filters, using JavaScript expressions such as:
  - `filter by function task.description.replace('#task ', '').length < 3`
- The expression must evaluate to a `boolean`, so `true` or `false`.
- There are loads of examples in [[Filters]].
  - Search for `filter by function` in that file.
- Find all the **supported tasks properties** in [[Task Properties]] and [[Quick Reference]].
  - A number of properties are only available for custom filters and grouping, and not for built-in grouping instructions.
- Find all the **supported query properties** in [[Query Properties]].
- Learn a bit about how expressions work in [[Expressions]].

## Custom filters introduction

The Tasks plugin provides a lot of built-in ways to [[Filters|filter]] tasks in Tasks query results.

But sometimes the built-in facility just doesn't quite do what you want.

**Custom filtering** allows you to **invent your own search scheme** to group tasks.

You use the instruction `filter by function` and then add a rule, written in JavaScript, to determine whether or not each task should be included in the search results. See the examples below.

## How it works

### Available Task Properties

The Reference section [[Task Properties]] shows all the task properties available for use in custom filters.

The available task properties are also shown in the [[Quick Reference]] table.

### Available Query Properties

The Reference section [[Query Properties]] shows all the query properties available for use in custom filters.

> [!released]
>
> - Query properties and placeholders were introduced in Tasks 4.7.0, accessible via Placeholders.
> - Direct access to Query properties was introduced in Tasks 5.1.0.

### Expressions

The instructions look like this:

- `filter by function <expression>`

The expression is evaluated (calculated) on one task at a time from your vault.

The expression must evaluate to a `boolean`, so `true` or `false`.

If the expression result is `true` for a task, it means that this task matches your custom filter.

And of course, if the expression result is `false`, this task does not match your custom filter.

## Example custom filters

Below are some examples to give a flavour of what can be done with custom filters.

You can find many more examples by searching for `filter by function` in the [[Filters]] page.

### Text property examples

<!-- placeholder to force blank line before included text --><!-- include: CustomFilteringExamples.test.other_properties_task.description_docs.approved.md -->

```javascript
filter by function task.description.length > 100
```

- Find tasks with long descriptions.

<!-- placeholder to force blank line after included text --><!-- endInclude -->

### Date property examples

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

### Number property examples

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

### File property examples

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
