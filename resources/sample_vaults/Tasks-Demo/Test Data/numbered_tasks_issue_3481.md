# numbered_tasks_issue_3481

See https://github.com/obsidian-tasks-group/obsidian-tasks/issues/3481.

- [ ] 1. #task Task 1 in 'numbered_tasks_issue_3481'
- [ ] 2 #task Task 2 in 'numbered_tasks_issue_3481'
- [ ] 3) #task Task 3 in 'numbered_tasks_issue_3481'
- [ ] 4 - #task Task 4 in 'numbered_tasks_issue_3481'
- [ ] 5: #task Task 5 in 'numbered_tasks_issue_3481'
- [ ] (6) #task Task 6 in 'numbered_tasks_issue_3481'

## Tasks

The Tasks plugin finds ==6 tasks==, but with 2 nested list items.

### show tree

```tasks
path includes {{query.file.path}}
show tree
full mode
```

### hide tree

```tasks
path includes {{query.file.path}}
hide tree
full mode
```

## Dataview

Dataview finds ==4 tasks==:

```dataview
TASK
FROM "Test Data/numbered_tasks_issue_3481"
```

## Obsidian search

Obsidian finds ==6 tasks==:

```query
task:3481
```
