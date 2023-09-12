# Search for tasks in file or folder containing the Query

See [How to get all tasks in the current file](https://publish.obsidian.md/tasks/How+To/How+to+get+tasks+in+current+file).

## Sample Tasks

- [ ] #task Task 1
- [ ] #task Task 2
- [ ] #task Task 3
- [ ] #task Task 4

## Search

```tasks
explain
path includes {{query.file.path}}
root includes {{query.file.root}}
folder includes {{query.file.folder}}
filename includes {{query.file.filename}}
```
