---
publish: true
---
# On Completion
> [!tip]
> If you have ever wished that Tasks would automatically *do something* with the tasks that you complete (*especially* likely if you use [[Recurring Tasks|recurring tasks]], which tend to accumulate within the note that holds them), then the **"On Completion"** feature could be the answer!

> [!released]
> Introduced in Tasks X.Y.Z.
## Introduction
Obsidian Tasks can automatically perform an action upon a task when it is marked 'done'.

This feature is enabled by adding (*after* the description within a task) a field consisting of:

- the *checkered flag* signifier 🏁, followed by
- a string identifying the desired ***Action*** to take when the item is completed.

At present, the following "On Completion" action is supported:

1. **Delete** &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Removes the completed instance of the task

(Two additional actions -- to move completed tasks to either a separate "completed tasks archive" note or to a "completed tasks list" within the original host note -- are under development.)

## Example "On Completion" operations

> [!note]
> To keep it simple, the following assumes that **Tasks** is configured to not use a [[Global Filter]] and not to add a [[Dates#Done date]] when you complete a task

Imagine that your vault consists of a single note file `My Project.md`, with these contents:

```text
# My Project Tasks
- [ ] Leave me alone
- [ ] Delete me upon completion 🏁 delete
- [ ] Delete my completed instance, leave my next instance 📅 2021-05-20 🔁 every day when done 🏁 delete
```

Using the plugin's default settings, after *using Tasks* to mark each task as "done", your `My Project` note file will contain:

```text
# My Project Tasks
- [x] Leave me alone
- [ ] Delete my completed instance, leave my next instance 📅 2021-05-21 🔁 every day when done 🏁 delete
```

Note that the incomplete next instance has replaced the original recurring task.

## Assigning and changing a given task's "On Completion" action

Although the "On Completion" signifier and desired **Action** identifier *can* be added to a task manually, doing so might be both tedious and error-prone -- you can also set or change each task's "On Completion" **Action** using the plugin's [[Create or edit Task|'Create or Edit Task' modal dialog]].
