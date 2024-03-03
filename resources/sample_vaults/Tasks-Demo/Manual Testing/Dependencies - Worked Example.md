# Dependencies - Worked Example

This file can be used to work through the 'Worked example' in the [the Task Dependencies](https://publish.obsidian.md/tasks/Getting+Started/Task+Dependencies) documentation page.

## Tasks

- [ ] #task Build a first draft
- [ ] #task Test with users

## Searches

### Things to do first as they are block

```tasks
is blocking

path includes {{query.file.path}}
hide backlink
hide task count
```

### Search for any tasks to do, that are not blocked

```tasks
not done
is not blocked

path includes {{query.file.path}}
hide backlink
hide task count
```

### Things that cannot be done yet

```tasks
is blocked

path includes {{query.file.path}}
hide backlink
hide task count
```
