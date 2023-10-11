---
publish: true
---

# Task Dependencies

## Introduction

At a high level, task dependencies define the order in which you want to work on tasks.

This can be useful in mapping out larger projects.  

Obsidian tasks exclusively allows for Finish to start (FS) dependencies, meaning Task A needs to be finished before you start on Task B.

<https://en.wikipedia.org/wiki/Dependency_(project_management)>

> [!released]
> Introduced in Tasks X.Y.Z.

```text
- [ ] test 1 🆔 rib277
- [ ] test 2 🆔 5gdmsd
- [ ] test 3 🆔 knzxte
- [ ] mega-blocked ⤵️ rib277,5gdmsd,knzxte
```

## Nomenclature

Fields:

- `depends` (to avoid capitalisation confusion `blockedby`/`blockedBy` - dataview format)
- `id`
UI:
- Blocked by [implies an id of another task]
- Blocks
Query
- blocking
- blocked
-

## Adding Dependencies

## Searching For Dependencies

`is not blocked`

`is blocking`

![[Pasted image 20231011181837.png]]

## Known Limitations

- Its not yet possible to directly navigate from a task to the tasks it depends on
- Outside of the edit task modal, it is not possible to see the descriptions of the blocking tasks
- It is not yet possible to visualise the relationships in a graph viewer
-
