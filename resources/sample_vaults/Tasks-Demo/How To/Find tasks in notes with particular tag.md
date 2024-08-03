# Find tasks in notes with particular tag

Suppose we wanted to find all tasks in notes that had a particular tag `#examples` in the frontmatter.

Since Tasks X.Y.Z, this is now possible in Tasks queries:

```tasks
filter by function task.file.property('tags').includes('#examples')
```
