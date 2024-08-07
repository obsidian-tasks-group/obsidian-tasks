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

- the *checkered flag* 🏁 emoji ***signifier***, followed by
- a string identifying the desired ***action*** to take when the item is completed.

> [!info]
> If you are using [[Dataview Format]] for Tasks,  instead of the 🏁 emoji the desired ***action*** would follow the double colons in `[onCompletion:: ]`.)

## Supported actions

At present, these "On Completion" ***actions*** are supported:

| Action     | Behaviour                                                                         |
| ---------- | --------------------------------------------------------------------------------- |
| **Keep**   | Nothing will be done with the just-completed task.  (This is the default action.) |
| **Delete** | Removes the completed instance of the task.                                       |

> [!tip]
> Two additional ***actions*** are being considered for future implementation, namely moving a just-completed task to:
>
> - either a separate "completed tasks archive" note,
> - or to a "completed tasks list" within the original host note.
>
> We are tracking these ideas in [issue #2855](https://github.com/obsidian-tasks-group/obsidian-tasks/issues/2855) and [issue #2856](https://github.com/obsidian-tasks-group/obsidian-tasks/issues/2856), respectively.

## Worked examples

> [!info]
> In order to keep it simple, the following assumes that **Tasks** is configured so as not to use a [[Global Filter]] nor  add a [[Dates#Done date]] when you complete a task.

> [!example] Imagine that your vault consists of a single note file `My Project.md`, with these contents:
>
> ```text
> # My Project Tasks
> - [ ] Leave me alone
> - [ ] Leave me alone too! 🏁 keep
> - [ ] Delete me upon completion 🏁 delete
> - [ ] Delete my completed instance, leave my next instance 📅 2021-05-20 🔁 every day when done 🏁 delete
> ```

> [!success] Using the plugin's default settings, after *using Tasks* to mark each task as "done", your `My Project` note file will contain:
>
> ```text
> # My Project Tasks
> - [x] Leave me alone
> - [x] Leave me alone too! 🏁 keep
> - [ ] Delete my completed instance, leave my next instance 📅 2021-05-21 🔁 every day when done 🏁 delete
> ```

> [!note] Note that
>
> - The task assigned the `keep` action is treated the same as one that has no onCompletion field at all, and
> - The next instance of the recurring task has replaced the original, completed instance.

## Assigning and changing a given task's "On Completion" action

At present, the "On Completion" signifier and desired **Action** identifier have to be added to a task manually.

In recognition that this could be both tedious and error-prone, we will eventually enable the [[Create or edit Task|'Create or Edit Task' modal dialog]] to edit the "On Completion" **Action**.
