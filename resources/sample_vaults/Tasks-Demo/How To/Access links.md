---
TQ_short_mode: true
TQ_extra_instructions: |-
  group by folder
  group by function task.file.filenameWithoutExtension
---

# Accessing Links

> [!Warning]
>
> - The queries in this file are **experimental**, and **may not continue to work**.
> - For example, once the Obsidian Bases facility is finalised, we *may* update the vocabulary used here to match that of Obsidian.

## Filtering

### `task.outlinks`: Task lines containing an outgoing link

```tasks
# Task line has a link
filter by function task.outlinks.length > 0
limit groups 1
```

### `task.file.outlinksInProperties`: Tasks in files whose properties/frontmatter contains a link

```tasks
filter by function task.file.outlinksInProperties.length > 0
limit groups 1
```

### `task.file.outlinksInBody`: Tasks in files whose markdown body contains a link

```tasks
filter by function task.file.outlinksInBody.length > 0
limit groups 1
```

### `task.file.outlinks`: Tasks in files whose file contains a link anywhere

```tasks
filter by function task.file.outlinks.length > 0
limit groups 1
```

## Grouping

### Group by task outlinks

```tasks
# Task line has a link
filter by function task.outlinks.length > 0
group by function task.outlinks.map(link => link.markdown).sort().join(' · ')
limit groups 1
```
