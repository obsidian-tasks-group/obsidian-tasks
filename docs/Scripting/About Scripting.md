---
publish: true
---

# About Scripting

<span class="related-pages">#index-pages #feature/scripting</span>

## Introduction

This is the start of a growing set of documentation on facilities to get finer control of searches within Tasks.

We are using the word 'scripting' in a very loose sense here:

- For now, it refers only to writing JavaScript expressions in Tasks query blocks.
- It is intended to evolve in to something broader over time.

## Placeholder capabilities

- [[Placeholders]] - use placeholder text in native Tasks queries, such as  `{{query.file.path}}` to refer to some properties of the file containing the query.

## Scripting capabilities

- [[Custom Filters]] - write short JavaScript expressions to create task search filters.
  - See also the many `filter by function` examples added to the [[Filters]] documentation.
- [[Custom Sorting]] - write short JavaScript expressions to sort tasks in Tasks query results.
  - See also the many `sort by function` examples added to the [[Sorting]] documentation.
- [[Custom Grouping]] - write short JavaScript expressions to create task group names in Tasks query results.
  - See also the many `group by function` examples added to the [[Grouping]] documentation.

## Scripting reference

- [[Task Properties]] - all the available task properties, such as `task.description`,  `task.file.path`.
  - Note: The properties are also listed in [[Quick Reference]].
- [[Query Properties]] - all the available task properties, such as  `query.file.path`,  `query.file.path` - available for use via [[Placeholders]].
- [[Expressions]] - some background about how JavaScript expressions work, for use in Tasks code blocks.
