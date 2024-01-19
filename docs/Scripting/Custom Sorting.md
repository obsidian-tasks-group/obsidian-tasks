---
publish: true
---

# Custom Sorting

<span class="related-pages">#feature/scripting #feature/sorting</span>

> [!released]
> Custom sorting was introduced in Tasks 6.0.0.

## Summary

- Define your own custom task sort order, using JavaScript expressions such as:
  - `sort by function task.description.length`
  - We call the result of this expression a **sort key**.
  - Tasks with **lower values** from the sort key expression are sorted **before** tasks with **higher expression** values.
- There are examples in [[Sorting]].
  - Search for `sort by function` in that file.
- Find all the **supported tasks properties** in [[Task Properties]] and [[Quick Reference]].
  - A number of properties are only available for custom sorting, and not for built-in sorting instructions.
- Find all the **supported query properties** in [[Query Properties]].
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

The Reference section [[Query Properties]] shows all the query properties available for use in custom sorting.

### Expressions

The instructions look like this:

- `sort by function <expression>`
- `sort by function reverse <expression>`

The expression is evaluated (calculated) on each task that matches your query, and the expression result is used as the **sort key** for the task.

This table shows how the supported sort key value types behave.

| Sort key expression types          | Values that you can return                                                                                                                                                                  |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Strings                            | Example: `sort by function task.originalMarkdown`<br>Tasks are sorted alphabetically by the string key values. The sort is case-sensitive. It is aware of numbers and sorts them logically. |
| Numbers                            | Example: `sort by function task.description.length`<br>Numbers are sorted in ascending order. The lower the number, the earlier the task is sorted.                                         |
| Boolean values: `true` and `false` | Example: `sort by function task.status.name.includes('!!')` <br>Tasks with sort key `true` sort before ones with `false`.                                                                   |
| `TasksDate` and `Moment` objects   | Example: `sort by function task.created`<br>See [[Sorting#How dates are sorted\|How dates are sorted]].                                                                                     |
| `null`                             | `null` sorts after valid `TasksDate` and `Moment` objects, and before all other sort key values.                                                                                                                                                                                            |

The `expression` can:

- use a large range of properties of each task
- use any valid JavaScript language features

The `expression` must:

- use properties on a given task, such as `task.description`, `task.status.name`.
  - See the reference page [[Task Properties]] for all the available properties.
- return one of types of values listed in the table above.

## Example custom sorts

Below are some examples to give a flavour of what can be done with custom sorts.

You can find some more examples by searching for `sort by function` in the [[Sorting]] page.

### Text property examples

<!-- placeholder to force blank line before included text --><!-- include: CustomSortingExamples.test.other_properties_task.description_docs.approved.md -->

```javascript
sort by function task.description.length
```

- Sort by length of description, shortest first.
- This might be useful for finding tasks that need more information, or could be made less verbose.

```javascript
sort by function \
    const priorities = [...'🟥🟧🟨🟩🟦'];  \
    for (let i = 0; i < priorities.length; i++) {  \
        if (task.description.includes(priorities[i])) return i;  \
    }  \
    return 999;
```

- A user has defined a custom system for their task descriptions, with coloured squares as a home-grown alternative priority system.
- This allows tasks to be sorted in the order of their coloured squares.
- The function returns 0 if the first square is found in the task description, 1 if the second square is found, and so on.
- And it returns `999` if none of the squares are found.
- It is important that we use a consistent value for all the tasks not containing any of the squares, to retain their original order, so that any later `sort by` instructions still work.

<!-- placeholder to force blank line after included text --><!-- endInclude -->

### Date property examples

Useful sections:

- [[Task Properties#Values in TasksDate Properties|Values in TasksDate Properties]]
- [[Sorting#How dates are sorted|How dates are sorted]]

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

Useful sections:

- [[Task Properties#Values for File Properties|Values for File Properties]]

<!-- placeholder to force blank line before included text --><!-- include: CustomSortingExamples.test.file_properties_task.file.folder_docs.approved.md -->

```javascript
sort by function task.file.folder
```

- Enable sorting by the folder containing the task.

```javascript
sort by function task.file.path === query.file.path
```

- Sort tasks in the same file as the query before tasks in other files.
- **Note**: `true` sort keys sort before `false`.

<!-- placeholder to force blank line after included text --><!-- endInclude -->

## Troubleshooting

> [!Tip]
> To test the values obtained from your sort key, replace `sort by` with `group by`. The generated group headings provide a sort of "debugger" to show expression values.
>
> However, be aware that whilst  `group by` expressions can return arrays of values, `sort by` does not yet support arrays.

## Limitations of Custom Sorting

- Arrays cannot yet be used as sort keys, as we have not figured out the appropriate way to sort arrays of different lengths.
