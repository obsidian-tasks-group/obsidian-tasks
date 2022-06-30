# 654 - Unable to find section, when title has tag inside

- [Unable to find section, when title has tag inside · Issue #654 · obsidian-tasks-group/obsidian-tasks · GitHub](https://github.com/obsidian-tasks-group/obsidian-tasks/issues/654)

## Section with tag in #example-tag and #another-tag

- [ ] #task Task in section with tag in heading name

## Searches

### The Bug

The bug is that ==clicking on the `[file name] > [section name]`  text below does not jump to the section containing the task.==

```tasks
path includes 654
sort by description
```

### Correct behaviour

Clicking on `Section with tag in #example-tag` in the task results block above should:

1. scroll to that section
2. highlight the section
