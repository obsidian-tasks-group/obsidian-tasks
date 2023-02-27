# Embed Task in to Note

See [When a block-referenced task is made complete, it is completed after rewriting the contents of another task. · Issue #688](https://github.com/obsidian-tasks-group/obsidian-tasks/issues/688)

## Category 1

- [ ] #task task1a
- [ ] #task task1b
- [ ] #task task1c

## Category 2

- [ ] #task task2a
- [ ] #task task2b ^ca47c7
- [ ] #task task2c

## Scenario 3: Embedding individual tasks

- **Given** A bullet list which embeds a task via a block reference, in the same file or another file
- **When** When the embedded task is toggled
- **Then** There is an error message saying that the task with the block reference could not be found, to be toggled
  - See [Issue #688](https://github.com/obsidian-tasks-group/obsidian-tasks/issues/688)

## The embedded tasks

---

- ref task2 ![[#^ca47c7]]

---

- ref task4 ![[Embed File in to Note - File to Embed#^fromseparatefile]]
