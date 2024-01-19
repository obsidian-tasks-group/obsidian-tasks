---
publish: true
---

# Custom Grouping

<span class="related-pages">#feature/scripting #feature/grouping</span>

> [!released]
> Custom grouping was introduced in Tasks 4.0.0.

## Summary

- Define your own custom task groups, using JavaScript expressions such as:
  - `group by function task.urgency.toFixed(3)`
- There are loads of examples in [[Grouping]].
  - Search for `group by function` in that file.
- Find all the **supported tasks properties** in [[Task Properties]] and [[Quick Reference]].
  - A number of properties are only available for custom grouping and filters, and not for built-in grouping instructions.
- Find all the **supported query properties** in [[Query Properties]].
- Learn a bit about how expressions work in [[Expressions]].

## Custom grouping introduction

The Tasks plugin provides a lot of built-in ways to [[Grouping|group]] similar tasks in Tasks query results.

But sometimes the built-in facility just doesn't quite do what you want.

**Custom grouping** allows you to **invent your own naming scheme** to group tasks.

You use the instruction `group by function` and then add a rule, written in JavaScript, to calculate a group name for a task. See the examples below.

## How it works

### Available Task Properties

The Reference section [[Task Properties]] shows all the task properties available for use in custom grouping.

The available task properties are also shown in the [[Quick Reference]] table.

### Available Query Properties

The Reference section [[Query Properties]] shows all the query properties available for in custom grouping.

> [!released]
>
> - Query properties and placeholders were introduced in Tasks 4.7.0.
> - Direct access to Query properties was introduced in Tasks 5.1.0.

### Expressions

The instructions look like this:

- `group by function <expression>`
- `group by function reverse <expression>`

The expression is evaluated (calculated) on each task that matches your query, and the expression result is used as the group heading for the task.

| Desired heading                                                             | Values that you can return                                                                             |
| --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| A single group name for the task                                            | A single value, such as `'group name'`.<br>An array, with a single value in, such as `['group name']`. |
| Display the task potentially more than once (as is done by `group by tags`) | An array of values, such as:<br>`['heading 1', 'heading 2']`                                             |
| No heading                                                                  | `null`<br>Empty string `''`<br>Empty array `[]`                                                        |

The `expression` can:

- use a large range of properties of each task
- use any valid JavaScript language features

The `expression` must:

- use properties on a given task, such as `task.description`, `task.status.name`
  - See the reference page [[Task Properties]] for all the available properties
- return one of:
  - either a single value of any type that can be converted to string
  - or an array of values (in which case, the task will be displayed multiple times, once under each heading generated from the array)

> [!warning]
> The strings returned are rendered as-is. This means, for example, that if the text you return has underscores in (`_`) that are not meant to indicate italics, you should escape them with backslashes ('\_') like this:
>
> ```javascript
> group by function task.description.replaceAll('_', '\\_')
>```

## Example custom groups

Below are some examples to give a flavour of what can be done with custom groups.

You can find many more examples by searching for `group by function` in the [[Grouping]] page.

### Text property examples

<!-- placeholder to force blank line before included text --><!-- include: CustomGroupingExamples.test.other_properties_task.description_docs.approved.md -->

```javascript
group by function task.description
```

- group by description.
- This might be useful for finding completed recurrences of the same task.

```javascript
group by function task.description.toUpperCase()
```

- Convert the description to capitals.

```javascript
group by function task.description.slice(0, 25)
```

- Truncate descriptions to at most their first 25 characters, and group by that string.

```javascript
group by function task.description.replace('short', '==short==')
```

- Highlight the word "short" in any group descriptions.

<!-- placeholder to force blank line after included text --><!-- endInclude -->

### Date property examples

<!-- placeholder to force blank line before included text --><!-- include: CustomGroupingExamples.test.dates_task.due_docs.approved.md -->

```javascript
group by function task.due.category.groupText
```

- Group task due dates in to 5 broad categories: `Invalid date`, `Overdue`, `Today`, `Future` and `Undated`, displayed in that order.
- Try this on a line before `group by due` if there are a lot of due date headings, and you would like them to be broken down in to some kind of structure.
- The values `task.due.category.name` and `task.due.category.sortOrder` are also available.

```javascript
group by function task.due.fromNow.groupText
```

- Group by the [time from now](https://momentjs.com/docs/#/displaying/fromnow/), for example `8 days ago`, `in 11 hours`.
- It users an empty string (so no heading) if there is no due date.
- The values `task.due.fromNow.name` and `task.due.fromNow.sortOrder` are also available.

```javascript
group by function task.due.format("YYYY-MM-DD dddd")
```

- Like "group by due", except it uses no heading, instead of a heading "No due date", if there is no due date.

```javascript
group by function task.due.formatAsDate()
```

- Format date as YYYY-MM-DD or empty string (so no heading) if there is no due date.

```javascript
group by function task.due.formatAsDateAndTime()
```

- Format date as YYYY-MM-DD HH:mm or empty string if no due date.
- Note:
  - This is shown for demonstration purposes.
  - Currently the Tasks plugin does not support storing of times.
  - Do not add times to your tasks, as it will break the reading of task data.

```javascript
group by function task.due.format("YYYY[%%]-MM[%%] MMM", "no due date")
```

- Group by month, for example `2023%%-05%% May` ...
  - ... which gets rendered by Obsidian as `2023 May`.
- Or show a default heading "no due date" if no date.
- The hidden month number is added, commented-out between two `%%` strings, to control the sort order of headings.
- To escape characters in format strings, you can wrap the characters in square brackets (here, `[%%]`).

```javascript
group by function task.due.format("YYYY[%%]-MM[%%] MMM [- Week] WW")
```

- Group by month and week number, for example `2023%%-05%% May - Week 22` ...
  - ... which gets rendered by Obsidian as `2023 May - Week 22`.
- If the month number is not embedded, in some years the first or last week of the year is displayed in a non-logical order.

<!-- placeholder to force blank line after included text --><!-- endInclude -->

There are many more date examples in [[Grouping#Due Date]].

### Number property examples

<!-- placeholder to force blank line before included text --><!-- include: CustomGroupingExamples.test.other_properties_task.urgency_docs.approved.md -->

```javascript
group by function task.urgency.toFixed(3)
```

- Show the urgency to 3 decimal places, unlike the built-in "group by urgency" which uses 2.

<!-- placeholder to force blank line after included text --><!-- endInclude -->

### File property examples

<!-- placeholder to force blank line before included text --><!-- include: CustomGroupingExamples.test.file_properties_task.file.folder_docs.approved.md -->

```javascript
group by function task.file.folder
```

- Same as 'group by folder'.

```javascript
group by function task.file.folder.slice(0, -1).split('/').pop() + '/'
```

- Group by the immediate parent folder of the file containing task.
- Here's how it works:
  - '.slice(0, -1)' removes the trailing slash ('/') from the original folder.
  - '.split('/')' divides the remaining path up in to an array of folder names.
  - '.pop()' returns the last folder name, that is, the parent of the file containing the task.
  - Then the trailing slash is added back, to ensure we do not get an empty string for files in the top level of the vault.

<!-- placeholder to force blank line after included text --><!-- endInclude -->

## Sorting the groups

### Default sort order: alphabetical

Group names are sorted alphabetically.

For example, the following instruction sorts the groups by priority name, from `High priority` to `Normal priority`:

```javascript
group by function task.priorityName +' priority'
```

### Controlling the sort order of groups

It is possible to enforce a sort order by including some hidden text in the group names, inside a `%%....%%` comment.

Alternatively, we can use a hidden `task.priorityNumber` value to force the sort order, which will now run from `High priority` to `Lowest priority`:

```javascript
group by function '%%' + task.priorityNumber.toString() + '%%' + task.priorityName +' priority'
```

## Formatting the groups

Here is an example of adding formatting to groups.

(Make sure you paste the long `group by function task.due.format` lines as single lines, without accidentally splitting the lines.)

<!-- the following example can be tested and screen-shotted with:
'/Users/clare/Documents/develop/Obsidian/schemar/obsidian-tasks/resources/sample_vaults/Tasks-Demo/How To/Use formatting in custom group headings.md'
-->

```javascript
group by function task.due.format("YYYY %%MM%% MMMM [<mark style='background: var(--color-base-00); color: var(--color-base-40)'>- Week</mark>] WW", "Undated")
group by function task.due.format("[%%]YYYY-MM-DD[%%]dddd [<mark style='background: var(--color-base-00); color: var(--color-base-40);'>](YYYY-MM-DD)[</mark>]")
```

Notes:

- The formatting draws the enclosed text in a muted colour.
- The text in square brackets (`[...]`) is included verbatim in the output.
- The named colours such as `var(--color-base-00)` are defined by the current Obsidian theme, and whether the display mode is Light or Dark.
  - See the [Obsidian documentation Colors page](https://docs.obsidian.md/Reference/CSS+variables/Foundations/Colors) for available colours.

It might look like this:

![Tasks Grouped](../images/tasks_custom_groups_with_formatting.png)
Tasks with custom date groups, including formatting.

## Tips

- To create a complex custom group, start something simple and gradually build it up.
- Use the [[Limiting#Limit number of tasks in each group|Limit number of tasks in each group]] facility - `limit groups 1` - when experimenting, to speed up feedback.
- You can try out hard-coded expressions, to explore how the custom grouping works:
  - `group by function null`
  - `group by function ''`
  - `group by function []`
  - `group by function "hello world"`
  - `group by function ["hello world"]`
  - `group by function ["hello", "world"]`
  - `group by function 6 * 7`
  - `group by function undefined`
- See [[Expressions]] for more examples to try out.
- You can use:
  - A task, whose data you can access via all the [[Task Properties]].
  - Some information about the file containing the query, which you can access via all the [[Query Properties]].
- The generated text is rendered by Obsidian, so you can insert markdown characters to add formatting to your headings.

## Troubleshooting

> [!Warning]
> Currently most types of error in function expressions are only detected when the search runs.
>
> This means that error messages are displayed in the group headings, when results are viewed.
>
> In a future release, we plan to show errors in formulae when the query block is being read.

### Syntax error

The following example gives an error:

````text
```tasks
group by function hello
```
````

gives this heading name:

```text
##### Error: Failed calculating expression "hello". The error message was: hello is not defined
```

> [!todo]
> Do syntax-error checking when parsing the instruction
