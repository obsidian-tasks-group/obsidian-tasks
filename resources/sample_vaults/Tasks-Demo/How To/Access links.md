---
TQ_short_mode: true
TQ_extra_instructions:
---

# Accessing Links

> [!Warning]
>
> - The queries in this file are **experimental**, and **may not continue to work**.
> - For example, once the Obsidian Bases facility is finalised, we *may* update the vocabulary used here to match that of Obsidian.

## Filtering

### `task.outlinks`: Task lines containing an outgoing link

````text
```tasks
# Task line has a link
filter by function task.outlinks.length > 0
limit groups 1
```
````

```tasks
# Task line has a link
filter by function task.outlinks.length > 0
limit groups 1
```

### `task.file.outlinksInProperties`: Tasks in files whose properties/frontmatter contains a link

````text
```tasks
filter by function task.file.outlinksInProperties.length > 0
limit groups 1
```
````

```tasks
filter by function task.file.outlinksInProperties.length > 0
limit groups 1
```

### `task.file.outlinksInBody`: Tasks in files whose markdown body contains a link

````text
```tasks
filter by function task.file.outlinksInBody.length > 0
limit groups 1
```
````

```tasks
filter by function task.file.outlinksInBody.length > 0
limit groups 1
```

### `task.file.outlinks`: Tasks in files whose file contains a link anywhere

````text
```tasks
filter by function task.file.outlinks.length > 0
limit groups 1
```
````

```tasks
filter by function task.file.outlinks.length > 0
limit groups 1
```

### Task lines that contain broken links

````text
```tasks
filter by function task.outlinks.some(link => link.destinationPath === null)
```
````

```tasks
filter by function task.outlinks.some(link => link.destinationPath === null)
```

### Tasks lines that link to the file containing the query

#### Tasks - version 1

This should match one task, in [[Link to Access links file]].

````text
```tasks
filter by function task.outlinks.some(link => link.destinationPath === query.file.path)
```
````

```tasks
filter by function task.outlinks.some(link => link.destinationPath === query.file.path)
```

#### Tasks - version 2

This should match one task, in [[Link to Access links file]].

There is a bug: this does not yet find the task it should do.

````text
```tasks
filter by function task.outlinks.some(link => link.isLinkTo(query.file))
```
````

```tasks
filter by function task.outlinks.some(link => link.isLinkTo(query.file))
```

#### Dataview version

````text
```dataview
TASK
WHERE contains(file.outlinks, this.file.link)
```
````

```dataview
TASK
WHERE contains(file.outlinks, this.file.link)
```

## Grouping

### Group by task outlinks

````text
```tasks
filter by function task.outlinks.length > 0
group by function task.outlinks.map(link => link.markdown).sort().join(' · ')
```
````

```tasks
filter by function task.outlinks.length > 0
group by function task.outlinks.map(link => link.markdown).sort().join(' · ')
```

### Group tasks by the files they link to

The value of `link.destinationPath`  is null if the link is broken.

````text
```tasks
filter by function task.outlinks.length > 0
group by function task.outlinks.map(link => link.destinationPath).sort().join(' · ')
```
````

```tasks
filter by function task.outlinks.length > 0
group by function task.outlinks.map(link => link.destinationPath).sort().join(' · ')
```
