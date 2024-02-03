---
publish: true
---

# On Completion

## Introduction

> [!tip]
> If you have ever wished that Tasks would automatically *do something* with the tasks that you complete (*especially* likely if you use [[Recurring Tasks|recurring tasks]], which have a tendency to accumulate), then the **"On Completion"** feature is for you!

> [!released]
> Introduced in Tasks X.Y.Z.

Obsidian Tasks can automatically act upon a task when it is marked 'done'.

This feature is enabled by adding (*after* a task's description) the *checkered flag* signifier 🏁, followed by a word that identifies the desired ***Action*** to take *on completion* of the item.

The following "On completion" actions are supported:

1. **Delete** &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;**Delete the task**
2. **LogNote** &nbsp;Move the task to **a separate, archival "completed tasks" note** &nbsp;&nbsp;(default filename:  "Completed Tasks.md")
3. **LogList** &nbsp;&nbsp;&nbsp;&nbsp;Move the task to a list of completed tasks **within the *current* note** &nbsp;&nbsp;(default list heading:  "# Completed Tasks")
4. **ListEnd** &nbsp;&nbsp;&nbsp;&nbsp;Move the task to **the end of the list** in which it appears

## Example operation

> [!note]
> To keep this example simple, the following assumes that **Tasks** is *not* configured to add a `Done` field with current date when you complete a task

Imagine that your vault consists of a single note file "My Project" (`My Project.md`), with these contents:

```text
# My Project Tasks
- [ ] Move me to end of current list 🏁 ListEnd
- [ ] Move me to "# Task Log" **list** in this note 🏁 LogList
- [ ] Move me to the "Task Log" **note** 🏁 LogFile
- [ ] Delete me 🏁 Delete
- [ ] Leave me alone
```

After you use Tasks to mark all of the above tasks as "done", your vault will contain two files:

Your `My Project` note file:

```text
# My Project Tasks
- [x] Leave me alone
- [x] Move me to end of current list 🏁 ListEnd

# Completed Tasks
- [x] Move me to "# Task Log" **list** in this note 🏁 LogList
```

And a *new* `Completed Tasks` note file:

```text
- [x] Move me to the "Task Log" **note** 🏁 LogFile
```

> [!note]
> Since they didn't already exist, as you marked tasks as Done, Tasks created
>
> - the in-note list with the "# Completed Tasks" heading, and
> - the "Completed Tasks" archive note

## Assigning and changing a given task's "On Completion" action

Although the "On Completion" signifier and desire **Action** identifier *can* be added to a task manually, doing so might be both tedious and error-prone -- so the **Tasks** plugin provides two ways to add or change each task's "On Completion" **Action**.

1. Through the plugin's 'Create or Edit Task' modal dialog.
2. If a task was previously assigned an "On Completion" **Action**, you can *either* **\[Right-click\]** *or* **press-and-hold** the *checkered flag* emoji 🏁 to open a context menu from which you can select another **Action** for that task.

## Configuration

### Alternative vault-wide values

The plugin's vault-wide default values associated with the `On Completion` feature can be changed within **Tasks**' *Configuration* dialog:

- Log File (Default: "Completed Tasks.md")
- Log List Heading (for in-note list of completed tasks.  Default: "# Completed Tasks")
- Action (Default: "None")

> [!Warning]
> Take care when changing the vault-wide default Action!<br><br>
> Doing so can save a lot of time if you know that you want a majority of your completed tasks to be processed the same way.<br><br>
> But we strongly recommend against setting Delete as the default, as it may be difficult or even impossible to retrieve completed-and-deleted tasks.

### Note-specific values

Whether or not you've changed any `On Completion` defaults in **Tasks**' *Configuration*, you can over-ride the vault-wide defaults on a note-by-note basis.

Alternative **Log File** , **Log List Heading**, and/or an `On Completion` **Action** that will *apply to all tasks that **don't** have another assigned* can be specified through a note's [*Properties*](https://help.obsidian.md/Editing+and+formatting/Properties) (previously called 'YAML front matter'):

```text
tasks_oc_logfile:  # example: myfilepath\myfilename.md
tasks_oc_heading:  # example: "## My Heading" (note: headings _must_ be quoted)
tasks_oc_action:   # example: LogList
```

> [!Warning]
> Take care when setting a note's default Action!<br><br>
> Doing so can save a lot of time if you know that you want a majority of your completed tasks to be processed the same way.<br><br>
> We recommend thinking twice before setting Delete as the default, as it may be difficult or even impossible to retrieve completed-and-deleted tasks.

## Migrating from other plugins that process "completed tasks"

Prior to the "On Completion" feature being added to Tasks, a few other Obsidian plugins were created to help manage completed tasks.

For some, no migration steps will be necessary to update your existing tasks to work with "On Completion". For others, it may be both possible and desirable to systematically re-write the tasks in your vault in order to take advantage of this new feature.

If and as we learn of resources to facilitate migration from those plugins, we'll provide links below.

- #TODO ***Packrat*** ('insert URI for Packrat repo's "'On Completion' migration page" here')

If you know of any other plugins' migration guides, please [open a New Issue](https://github.com/obsidian-tasks-group/obsidian-tasks/issues) in our GitHub repo to let us know, and we'll add a link that resource above!
