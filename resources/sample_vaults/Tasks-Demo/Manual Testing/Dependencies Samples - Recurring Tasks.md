# Dependencies Samples - Recurring Tasks

See [#2654](https://github.com/obsidian-tasks-group/obsidian-tasks/issues/2654): Tasks that are 'blocked by' a recurring task are forever blocked.

## Recurring tasks

Step 1:

- [ ] #task I am recurring task **step 1** 🆔 step1 🔁 every day 📅 2024-02-12

Step 2:

- [ ] #task I am recurring task **step 2** ⛔ step1 🔁 every day 📅 2024-02-12

## Search

Tasks which are not blocked:

```tasks
not done
is not blocked

path includes {{query.file.path}}

hide backlink

# To simplify the explain output:
ignore global query

explain
```
