# Embed Task in to Note

## Scenario: Embedding individual tasks

- **Given** a bullet list which embeds a task via a block reference, in the same file or another file
- **When** the embedded task is toggled
- **Then** there is an error message saying that the task with the block reference could not be found, to be toggled
  - See [Issue #688](https://github.com/obsidian-tasks-group/obsidian-tasks/issues/688)

## Category 1

- [ ] #task task1a
- [ ] #task task1b

## Category 2

- [ ] #task task2a
- [ ] #task task2b ^ca47c7

## The embedded tasks

To reproduce issue 688, click on the following checkbox in Reading mode:

- ref task2 ![[#^ca47c7]]
