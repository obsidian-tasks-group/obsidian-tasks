# numbered_tasks_issue_3481_searches

## Tasks

The Tasks plugin finds ==6 tasks==, but with 2 nested list items.

### show tree

```tasks
path includes numbered_tasks_issue_3481
show tree
full mode
```

### hide tree

```tasks
path includes numbered_tasks_issue_3481
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
