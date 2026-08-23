---
publish: true
---

# On Completion

> [!tip]
> If you have ever wished that Tasks would automatically *do something* with the tasks that you complete (*especially* likely if you use [[Recurring Tasks|recurring tasks]], which tend to accumulate within the note that holds them), then the **"On Completion"** feature could be the answer!

> [!released]
> Introduced in Tasks 7.8.0.

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
> Several additional ***actions*** are being considered for future implementation, namely moving a just-completed task to:
>
> - a separate "completed tasks archive" note,
>   - see [issue #2855](https://github.com/obsidian-tasks-group/obsidian-tasks/issues/2855)
> - a "completed tasks list" within the original host note,
>   - see [issue #2856](https://github.com/obsidian-tasks-group/obsidian-tasks/issues/2856)
> - the end of the list.
>   - see [discussion #2426](https://github.com/obsidian-tasks-group/obsidian-tasks/discussions/2426).

## Worked examples

### Demos

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

### Do not break your nested tasks

> [!warning] ***Never, ever*** put `🏁 delete` on a task that has [nested tasks or list items](https://help.obsidian.md/Editing+and+formatting/Basic+formatting+syntax#Nesting+lists), also known as child items, or sub-items.
>
> Don't do this:
>
> ```text
> - [ ] Delete me upon completion 🏁 delete
>     - [ ] I am a nested task
>     - I am a nested list item.
> ```
>
> When that first task is completed, the text will become:
>
> ```text
>     - [ ] I am a nested task
>     - I am a nested list item.
> ```
>
> Those two lines are now indented, which means they now form a code block, not a list!
>
> | Before: 2 tasks and a list item | After: No tasks, just a code block |
> | ------------------------------- | ---------------------------------- |
> | ![[on-completion-before.png]]   | ![[on-completion-after.png]]       |
>
> Tasks does not yet issue any warnings if this happens.

## Assigning and changing a given task's "On Completion" action

The "On Completion" signifier and desired **Action** identifier can be added with [[Auto-Suggest]], to save typing them manually.

We will also eventually enable the [[Create or edit Task|'Create or Edit Task' modal dialog]] to edit the "On Completion" **Action**. We are tracking this in [issue #3222](https://github.com/obsidian-tasks-group/obsidian-tasks/issues/3222).

## Support

Before creating a new bug report or feature request about On Completion, please check existing items to avoid duplicates.

You do not need to search manually: the links below are already filtered to the label `"scope: lifecycle of tasks"`.

- Check both Open and Closed items.
- If you find an existing item, support it there instead of adding a `+1` comment. See [[About Support and Help#How to support an existing request|How to support an existing request]].

| Type | Open | Closed | Notes |
| --- | --- | --- | --- |
| Issues | [Open](https://github.com/obsidian-tasks-group/obsidian-tasks/issues?q=is%3Aopen%20label%3A%22scope%3A+lifecycle+of+tasks%22%20is%3Aissue%20) | [Closed](https://github.com/obsidian-tasks-group/obsidian-tasks/issues?q=is%3Aclosed%20label%3A%22scope%3A+lifecycle+of+tasks%22%20is%3Aissue%20) | bug reports and feature requests |
| Discussions | [Open](https://github.com/obsidian-tasks-group/obsidian-tasks/discussions/categories/ideas-any-new-feature-requests-go-in-issues-please?discussions_q=is%3Aopen+label%3A%22scope%3A+lifecycle+of+tasks%22+category%3A%22Ideas%3A+Any+New+Feature+Requests+go+in+Issues+please%22+sort%3Atop) | [Closed](https://github.com/obsidian-tasks-group/obsidian-tasks/discussions/categories/ideas-any-new-feature-requests-go-in-issues-please?discussions_q=is%3Aclosed+label%3A%22scope%3A+lifecycle+of+tasks%22+category%3A%22Ideas%3A+Any+New+Feature+Requests+go+in+Issues+please%22+sort%3Atop) | older feature discussions from before late 2022 |

If you do not find an existing item in Issues or Discussions, see [[About Support and Help]] for how to report a bug or request a feature.
