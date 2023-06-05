---
publish: true
---

# Task Properties

<span class="related-pages">#feature/scripting</span>

> [!released]
> Task Properties were introduced in Tasks X.Y.Z.

## Introduction

In a growing number of locations, Tasks allows programmatic/scripting access to values in your Tasks:

- [[Grouping#Group by Function]]

This documents all the available pieces of information in Tasks that you can access.

> [!warning]
> Tasks does store other data, but we only guarantee future support for the data items listed here.

## Values for Task Statuses

<!-- placeholder to force blank line before included text --> <!-- include: FunctionFieldReference.test.task_status.approved.md -->

| Field | Type | Example |
| ----- | ----- | ----- |
| `task.status.name` | `string` | `'Todo'` |
| `task.status.type` | `string` | `'TODO'` |
| `task.status.symbol` | `string` | `' '` |
| `task.status.nextStatusSymbol` | `string` | `'x'` |

<!-- placeholder to force blank line after included text --> <!-- endInclude -->

---

## Values for Dates in Tasks

None supported yet.

---

## Values for Other Task Properties

<!-- placeholder to force blank line before included text --> <!-- include: FunctionFieldReference.test.task_other_fields.approved.md -->

| Field | Type | Example |
| ----- | ----- | ----- |
| `task.description` | `string` | `'Do exercises #todo #health'` |
| `task.priority` | `string` | `'2'` |
| `task.urgency` | `number` | `3.3000000000000007` |
| `task.tags` | `object` | `#todo,#health` |
| `task.indentation` | `string` | `'  '` |
| `task.listMarker` | `string` | `'-'` |
| `task.blockLink` | `string` | `' ^dcf64c'` |
| `task.originalMarkdown` | `string` | `'  - [ ] Do exercises #todo #health 🔼 🔁 every day when done ➕ 2023-07-01 🛫 2023-07-02 ⏳ 2023-07-03 📅 2023-07-04 ✅ 2023-07-05 ^dcf64c'` |

<!-- placeholder to force blank line after included text --> <!-- endInclude -->

---

## Values for File Properties

TODO Maybe use `heading` instead? Try to make field names consistent with existing filter names

<!-- placeholder to force blank line before included text --> <!-- include: FunctionFieldReference.test.task_file_properties.approved.md -->

| Field | Type | Example |
| ----- | ----- | ----- |
| `task.precedingHeader` | `string` | `'My Header'` |

<!-- placeholder to force blank line after included text --> <!-- endInclude -->
