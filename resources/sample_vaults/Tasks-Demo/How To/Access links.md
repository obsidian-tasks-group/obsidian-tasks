---
TQ_short_mode: true
TQ_extra_instructions:
---

# Accessing Links

These facilities were introduced in Tasks 7.21.0.

## Filtering

### `task.outlinks`: Task lines containing an outgoing link

````text
```tasks
# Task line has a link
filter by function task.outlinks.length > 0
limit 10
```
````

```tasks
# Task line has a link
filter by function task.outlinks.length > 0
limit 10
```

### `task.file.outlinksInProperties`: Tasks in files whose properties/frontmatter contains a link

````text
```tasks
filter by function task.file.outlinksInProperties.length > 0
limit 10
```
````

```tasks
filter by function task.file.outlinksInProperties.length > 0
limit 10
```

### `task.file.outlinksInBody`: Tasks in files whose markdown body contains a link

````text
```tasks
filter by function task.file.outlinksInBody.length > 0
limit 10
```
````

```tasks
filter by function task.file.outlinksInBody.length > 0
limit 10
```

### `task.file.outlinks`: Tasks in files whose file contains a link anywhere

````text
```tasks
filter by function task.file.outlinks.length > 0
limit 10
```
````

```tasks
filter by function task.file.outlinks.length > 0
limit 10
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
filter by function task.outlinks.some(link => link.linksTo(query.file))
```
````

```tasks
filter by function task.outlinks.some(link => link.linksTo(query.file))
```

#### Tasks - version 2

This should match one task, in [[Link to Access links file]].

````text
```tasks
filter by function task.outlinks.some(link => link.destinationPath === query.file.path)
```
````

```tasks
filter by function task.outlinks.some(link => link.destinationPath === query.file.path)
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

### Demonstrate link.displayText

```tasks
filter by function task.outlinks.length > 0
group by function task.outlinks.map(link => `\`${link.originalMarkdown}\` -><br> \`${link.displayText}\``)
```
