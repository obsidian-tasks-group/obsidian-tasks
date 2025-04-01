# On Completion Delete

## Context

- Remove line when a `onCompletion:: delete` task is completed:
  - <https://github.com/obsidian-tasks-group/obsidian-tasks/issues/3342>

## Source Mode

### Complete in Source Mode with `Tasks: Toggle task done` command

- Line before
- [ ] #task Complete in **Source Mode** with `Tasks: Toggle task done` command 🏁 delete
- Line after

==❌ This shows \#3342 - blank line remains, as of Tasks `7.18.4`.==

## Live Preview

### Complete in Live Preview with `Tasks: Toggle task done` command

- Line before
- [ ] #task Complete in **Live Preview** with `Tasks: Toggle task done` command 🏁 delete
- Line after

==❌ This shows \#3342 - blank line remains, as of Tasks `7.18.4`.==

### Complete in Live Preview clicking checkbox

- Line before
- [ ] #task Complete in **Live Preview** clicking checkbox 🏁 delete
- Line after

==❌ This shows \#3342 - blank line remains, as of Tasks `7.18.4`.==

## Reading Mode

### Complete in Reading Mode clicking checkbox

- Line before
- [ ] #task Complete in **Reading Mode** clicking checkbox 🏁 delete
- Line after

✅ Whole line is removed.

## Search results

### Complete in Search results clicking checkbox

- Line before
- [ ] #task Complete in **Search result**s clicking checkbox 🏁 delete
- Line after

```tasks
path includes {{query.file.path}}
heading includes Complete in Search results clicking checkbox
short mode
```

✅ Whole line is removed.

## Remaining steps

```tasks
path includes {{query.file.path}}
heading does not include Final check
sort by function task.lineNumber
short mode
```

## Final check

- [ ] #task Check that there are no blank lines between each of the `Line before` and `Line after` pairs ⏫
