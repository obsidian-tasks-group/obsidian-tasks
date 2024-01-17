# Invalid dates with Sorting and Grouping

## Tasks

Numbers indicate the sort order I feel is useful, as invalid dates require action to fix them, so they should be prioritised.

- [ ] #task 1 invalid due date 📅 1999-02-32
- [ ] #task 2 valid over-due date 📅 2023-01-01
- [ ] #task 3 valid future-due date 📅 2050-01-01
- [ ] #task 4 undated

## Query - Grouping

### Group by due - built-in

`Invalid date` should be the first heading, as action is required.

Bug report: **`group by due` and similar should put `Invalid date` heading before the headings for valid dates.**

```tasks
group by due

path includes {{query.file.path}}
hide backlinks
hide postpone button
hide task count
```

### Group by due - custom function

A heading `Invalid` should be the first heading, with the invalid task inside it.

Bug report: **`task.due.category.groupText` and similar should put tasks with invalid dates in a heading `Invalid` or `Invalid date`, not `Future`.**

```tasks
group by function task.due.category.groupText

path includes {{query.file.path}}
hide backlinks
hide postpone button
hide task count
```

## Query - Sorting

### Sort by due - built-in

The invalid task should be before the dated ones.

[Bug report](https://github.com/obsidian-tasks-group/obsidian-tasks/issues/2589): **`sort by due` and similar should put tasks with invalid dates before the tasks with valid dates.**

```tasks
sort by due

path includes {{query.file.path}}
hide backlinks
hide postpone button
hide task count
```

### Sort by due - custom function

The invalid task should be before the dated ones.

Bug report: **`sort by function task.due.category.groupText` and similar should put tasks with invalid dates before the tasks with valid dates - same for `task.due.category.sortOrder`.**

```tasks
sort by function task.due.category.groupText

path includes {{query.file.path}}
hide backlinks
hide postpone button
hide task count
```

### Default sort order

The invalid task should be before the dated ones.

```tasks
path includes {{query.file.path}}
hide backlinks
hide postpone button
hide task count
```

## Expected sort order

```tasks
sort by description

path includes {{query.file.path}}
hide backlinks
hide postpone button
hide task count
```
