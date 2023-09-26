---
publish: true
---

# Query Properties

<span class="related-pages">#feature/scripting</span>

> [!released]
> Query Properties were introduced in Tasks 4.7.0.

## Introduction

In a growing number of locations, Tasks allows programmatic/scripting access to properties of the file containing the search query:

- [[Placeholders]]

This page documents all the available pieces of information in Queries that you can access.

> [!warning]
>
> - These properties can currently only be used in [[Placeholders]].
> - Placeholders can be in [[Custom Filters]] and [[Custom Grouping]], but must be surrounded by quotes. For example: `'{{query.file.folder}}'`.
> - In a future release, we will allow expressions such as `query.file.folder` to be used directly in custom filters and groups.

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
