---
publish: true
---

# Query Properties

<span class="related-pages">#feature/scripting</span>

> [!released]
>
> - Query Properties were introduced in Tasks 4.7.0.
> - Their direct use in Custom Filters and Custom Groups, without the use of Placeholders, was introduced in Tasks 5.1.0.

## Introduction

In a growing number of locations, Tasks allows programmatic/scripting access to properties of the file containing the search query:

- [[Placeholders]]
- [[Custom Filters]]
- [[Custom Sorting]]
- [[Custom Grouping]]

This page documents all the available pieces of information in Queries that you can access.

## Values for Query File Properties

<!-- placeholder to force blank line before included text --><!-- include: QueryProperties.test.query_file_properties.approved.md -->

| Field | Type | Example |
| ----- | ----- | ----- |
| `query.file.path` | `string` | `'root/sub-folder/file containing query.md'` |
| `query.file.pathWithoutExtension` | `string` | `'root/sub-folder/file containing query'` |
| `query.file.root` | `string` | `'root/'` |
| `query.file.folder` | `string` | `'root/sub-folder/'` |
| `query.file.filename` | `string` | `'file containing query.md'` |
| `query.file.filenameWithoutExtension` | `string` | `'file containing query'` |

<!-- placeholder to force blank line after included text --><!-- endInclude -->

1. `query.file` is a `TasksFile` object.
1. You can see the current [TasksFile source code](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/src/Scripting/TasksFile.ts), to explore its capabilities.
1. The presence of `.md` filename extensions is chosen to match the existing conventions in the Tasks filter instructions [[Filters#File Path|path]] and [[Filters#File Name|filename]].
1. `query.file.pathWithoutExtension` was added in Tasks 4.8.0.
1. `query.file.filenameWithoutExtension` was added in Tasks 4.8.0.

## Values for Query Search Properties

<!-- placeholder to force blank line before included text --><!-- include: QueryProperties.test.query_search_properties.approved.md -->

| Field | Type | Example |
| ----- | ----- | ----- |
| `query.allTasks` | `Task[]` | `[... an array with all the Tasks-tracked tasks in the vault ...]` |

<!-- placeholder to force blank line after included text --><!-- endInclude -->

1. `query.allTasks` provides access to all the tasks that Tasks has read from the vault.
    - If [[Global Filter|global filter]] is enabled, only tasks containing the global filter are included.
    - The [[Global Query|global query]] does not affect `query.allTasks`: all tasks tracked by the Tasks plugin are included.
    - See [[Task Properties]] for the available properties on each task.
    - `query.allTasks` was added in Tasks 6.1.0.
