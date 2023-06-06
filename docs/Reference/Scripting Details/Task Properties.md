---
publish: true
---

# Task Properties

<span class="related-pages">#feature/scripting</span>

> [!released]
> Task Properties were introduced in Tasks X.Y.Z.

## Introduction

In a growing number of locations, Tasks allows programmatic/scripting access to values in your Tasks:

- [[Grouping#Group by Function - Custom Groups]]

This documents all the available pieces of information in Tasks that you can access.

> [!warning]
> Tasks does store other data, but we only guarantee future support for the data items listed here without warning.

## Values for Task Statuses

For more information, including adding your own customised statuses, see [[Statuses]].

<!-- placeholder to force blank line before included text --> <!-- include: FunctionFieldReference.test.task_status.approved.md -->

| Field | Type 1 | Example 1 | Type 2 | Example 2 |
| ----- | ----- | ----- | ----- | ----- |
| `task.status.name` | `string` | `'Todo'` | `string` | `'In Progress'` |
| `task.status.type` | `string` | `'TODO'` | `string` | `'IN_PROGRESS'` |
| `task.status.symbol` | `string` | `' '` | `string` | `'/'` |
| `task.status.nextStatusSymbol` | `string` | `'x'` | `string` | `'x'` |

<!-- placeholder to force blank line after included text --> <!-- endInclude -->

---

## Values for Dates in Tasks

> [!warning]
> Do not use these properties. They will change before release.

<!-- placeholder to force blank line before included text --> <!-- include: FunctionFieldReference.test.task_dates.approved.md -->

| Field | Type 1 | Example 1 | Type 2 | Example 2 |
| ----- | ----- | ----- | ----- | ----- |
| `task.status.createdDate` | `undefined` | `undefined` | `undefined` | `undefined` |
| `task.createdDate` | `object` | `1688169600000` | `object` | `null` |
| `task.startDate` | `object` | `1688256000000` | `object` | `null` |
| `task.scheduledDate` | `object` | `1688342400000` | `object` | `null` |
| `task.dueDate` | `object` | `1688428800000` | `object` | `null` |
| `task.doneDate` | `object` | `1688515200000` | `object` | `null` |

<!-- placeholder to force blank line after included text --> <!-- endInclude -->

---

## Values for Other Task Properties

<!-- placeholder to force blank line before included text --> <!-- include: FunctionFieldReference.test.task_other_fields.approved.md -->

| Field | Type 1 | Example 1 | Type 2 | Example 2 |
| ----- | ----- | ----- | ----- | ----- |
| `task.description` | `string` | `'Do exercises #todo #health'` | `string` | `'minimal task'` |
| `task.priority` | `string` | `'2'` | `string` | `'3'` |
| `task.urgency` | `number` | `3.3000000000000007` | `number` | `1.9500000000000002` |
| `task.tags` | `object` | `#todo,#health` | `object` | `` |
| `task.indentation` | `string` | `'  '` | `string` | `''` |
| `task.listMarker` | `string` | `'-'` | `string` | `'-'` |
| `task.blockLink` | `string` | `' ^dcf64c'` | `string` | `''` |
| `task.originalMarkdown` | `string` | `'  - [ ] Do exercises #todo #health 🔼 🔁 every day when done ➕ 2023-07-01 🛫 2023-07-02 ⏳ 2023-07-03 📅 2023-07-04 ✅ 2023-07-05 ^dcf64c'` | `string` | `'- [/] minimal task'` |

<!-- placeholder to force blank line after included text --> <!-- endInclude -->

1. `task.description` has spaces at the start and end stripped off.
1. `task.description` includes any tags.
1. In a future release we will provide `task.priorityName`
1. `task.tags` actually would return `string[]`, that is `['#todo', '#health']`
1. There is a rendering problem in Obsidian and Obsidian Publish: `task.indentation` is supposed to show 2 spaces in this example of an indented task.
1. Note that `task.blockLink` really does begin with a space currently, for tasks that have a blocklink.
1. There is a rendering problem in Obsidian and Obsidian Publish: `task.originalMarkdown` is supposed to begin with 2 spaces

---

## Values for File Properties

> [!warning]
> Do not use these properties. They will change before release.

TODO Maybe use `heading` instead? Try to make field names consistent with existing filter names

<!-- placeholder to force blank line before included text --> <!-- include: FunctionFieldReference.test.task_file_properties.approved.md -->

| Field | Type 1 | Example 1 | Type 2 | Example 2 |
| ----- | ----- | ----- | ----- | ----- |
| `task.path` | `string` | `'/some/folder/fileName.md'` | `string` | `''` |
| `task.filename` | `string` | `'fileName'` | `object` | `null` |
| `task.lineNumber` | `number` | `17` | `number` | `0` |
| `task.precedingHeader` | `string` | `'My Header'` | `object` | `null` |

<!-- placeholder to force blank line after included text --> <!-- endInclude -->
