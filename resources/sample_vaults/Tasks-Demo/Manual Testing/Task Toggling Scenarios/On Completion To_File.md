# On Completion To_File

## Context

- Optional automatic action upon task completion: move task to an archive file:
  - <https://github.com/obsidian-tasks-group/obsidian-tasks/issues/2855>

## Source Mode

### Complete in Source Mode with `Tasks: Toggle task done` command

- Line before
- [ ] #task Complete in **Source Mode** with `Tasks: Toggle task done` command 🏁 to_file
- Line after

✅ Whole line is moved to the archive file.

### Complete recurring task in Source Mode with `Tasks: Toggle task done` command

- Line before
- [ ] #task Complete in **Source Mode** with `Tasks: Toggle task done` command 🔁 every day 🏁 to_file ⏳ 2026-11-03
- Line after

✅ Completed task is moved to the archive file
✅ Next recurrence is written here.

## Live Preview

### Complete in Live Preview with `Tasks: Toggle task done` command

- Line before
- [ ] #task Complete in **Live Preview** with `Tasks: Toggle task done` command 🏁 to_file
- Line after

✅ Whole line is moved to the archive file.

### Complete in Live Preview clicking checkbox

- Line before
- [ ] #task Complete in **Live Preview** clicking checkbox 🏁 to_file
- Line after

✅ Whole line is moved to the archive file.

## Reading Mode

### Complete in Reading Mode clicking checkbox

- Line before
- [ ] #task Complete in **Reading Mode** clicking checkbox 🏁 to_file
- Line after

✅ Whole line is moved to the archive file.

### Complete in Reading Mode right-clicking checkbox

- Line before
- [ ] #task Complete in **Reading Mode** right-clicking checkbox 🏁 to_file
- Line after

✅ Whole line is moved to the archive file.

## Search results

### Complete in Search results clicking checkbox

- Line before
- [ ] #task Complete in **Search result**s clicking checkbox 🏁 to_file
- Line after

✅ Whole line is moved to the archive file.

### Complete in Search results right-clicking checkbox

- Line before
- [ ] #task Complete in **Search result**s right-clicking checkbox 🏁 to_file
- Line after

✅ Whole line is moved to the archive file.

### Search

```tasks
path includes {{query.file.path}}
heading includes Complete in Search results
short mode
```

## Remaining steps

```tasks
path includes {{query.file.path}}
heading does not include Final check
sort by function task.lineNumber
short mode
```

## Final check

- [ ] #task Check that there are no blank lines between each of the `Line before` and `Line after` pairs ⏫
