---
publish: true
---

# Custom Sorting

<span class="related-pages">#feature/scripting #feature/sorting</span>

> [!released]
> Custom sorting was introduced in Tasks X.Y.Z.

## Summary

- Define your own custom task sort order, using JavaScript expressions such as:
  - `sort by function task.description.length`
- There are examples in [[Sorting]].
  - Search for `sort by function` in that file.
- Find all the **supported tasks properties** in [[Task Properties]] and [[Quick Reference]].
  - A number of properties are only available for custom sorting, and not for built-in sorting instructions.
- Find all the **supported query properties** in [[Query Properties]].
  - ==TODO Query properties are not yet supported in custom sorters.==
- Learn a bit about how expressions work in [[Expressions]].

## Custom sorting introduction

The Tasks plugin provides a lot of built-in ways to [[Sorting|sort]] similar tasks in Tasks query results.

But sometimes the built-in facility just doesn't quite do what you want.

**Custom sorting** allows you to **invent your own ordering scheme** to sort tasks.

You use the instruction `sort by function` and then add a rule, written in JavaScript, to calculate a sort key for a task. See the examples below.

## How it works

### Available Task Properties

The Reference section [[Task Properties]] shows all the task properties available for use in custom sorting.

The available task properties are also shown in the [[Quick Reference]] table.
### Available Query Properties

The Reference section [[Query Properties]] shows all the query properties available for use via [[Placeholders]] in custom sorting.

Any placeholders in custom sorts must be surrounded by quotes.

> [!released]
> Query properties and placeholders were introduced in Tasks 4.7.0.

### Expressions

The instructions look like this:

- `sort by function <expression>`
- `sort by function reverse <expression>`

The expression is evaluated (calculated) on each task that matches your query, and the expression result is used as the sort key for the task.

==TODO Update this==

| Desired heading                                                             | Values that you can return                                                                             |
| --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| A single sort name for the task                                            | A single value, such as `'sort name'`.<br>An array, with a single value in, such as `['sort name']`. |
| Display the task potentially more than once (as is done by `sort by tags`) | An array of values, such as:<br>`['heading 1', 'heading 2']`                                             |
| No heading                                                                  | `null`<br>Empty string `''`<br>Empty array `[]`                                                        |

The `expression` can:

- use a large range of properties of each task
- use any valid JavaScript language features

The `expression` must:

==TODO Update this==

- use properties on a given task, such as `task.description`, `task.status.name`
  - See the reference page [[Task Properties]] for all the available properties
- return one of:
  - either a single value of any type that can be converted to string
  - or an array of values (in which case, the task will be displayed multiple times, once under each heading generated from the array)

## Example custom sorts

Below are some examples to give a flavour of what can be done with custom sorts.

You can find many more examples by searching for `sort by function` in the [[Sorting]] page.

### Text property examples

<!-- placeholder to force blank line before included text --><!-- include: CustomSortingExamples.test.other_properties_task.description_docs.approved.md -->

```javascript
sort by function task.description.length
```

- Sort by length of description, shortest first.
- This might be useful for finding tasks that need more information, or could be made less verbose.

```javascript
sort by function task.description.replace('🟥', 1).replace('🟧', 2).replace('🟨', 3).replace('🟩', 4).replace('🟦', 5)
```

- A user has defined custom system for their task descriptions, with coloured squares at the **start** of task lines as a home-grown alternative priority system.
- This allows tasks to be sorted in the order of their coloured squares.

<!-- placeholder to force blank line after included text --><!-- endInclude -->

### Date property examples

<!-- placeholder to force blank line before included text --><!-- include: CustomSortingExamples.test.dates_task.due_docs.approved.md -->

```javascript
sort by function task.due.format("dddd")
```

- Sort by due date's day of the week, alphabetically.

<!-- placeholder to force blank line after included text --><!-- endInclude -->

### Number property examples

<!-- placeholder to force blank line before included text --><!-- include: CustomSortingExamples.test.other_properties_task.urgency_docs.approved.md -->

```javascript
sort by function reverse task.urgency
```

- Sort by task urgency values.
- We use `reverse` to put the most urgent tasks first.

<!-- placeholder to force blank line after included text --><!-- endInclude -->

### File property examples

<!-- placeholder to force blank line before included text --><!-- include: CustomSortingExamples.test.file_properties_task.file.folder_docs.approved.md -->

```javascript
sort by function task.file.folder
```

- Enable sorting by the folder containing the task.

<!-- placeholder to force blank line after included text --><!-- endInclude -->

## Troubleshooting

> [!Warning]
> Currently most types of error in function expressions are only detected when the search runs.
>
> This means that error messages are displayed in the sort headings, when results are viewed.
>
> In a future release, we plan to show errors in formulae when the query block is being read.

### Syntax error

The following example gives an error:

````text
```tasks
sort by function hello
```
````

gives this heading name:

```text
##### Error: Failed calculating expression "hello". The error message was: hello is not defined
```

> [!todo]
> Do syntax-error checking when parsing the instruction
