---
publish: false
---

# On Completion

## Introduction

> [!tip]
> If you have ever wished that Tasks would automatically do *something* to get your completed tasks "out of the way" (*especially* likely if you use many recurring tasks), then the **"On Completion"** feature is for you!

> [!released]
> Introduced in Tasks X.Y.Z.

Obsidian Tasks can automatically act upon a task when it is marked 'done'.  

This feature is enabled by adding (*after* a task's description) the *checkered flag* signifier 🏁, followed by a word that identifies the desired ***Action*** to take "On Completion" of the item.  The following are supported:

1. **Bottom** &nbsp;Upon completion, move the task to the end of its current list
2. **Log** &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Upon completion, move the task to a "task log" list within the current note  (default header:  "# Completed Tasks")
3. **Archive** &nbsp;Upon completion, move the task to a separate "task archive" note  (default filename:  "Completed Tasks.md")
4. **Delete** &nbsp;&nbsp;&nbsp;Upon completion, delete the task

## Example operation

Imagine that your vault consists of a single note file `My Project`, with the following contents:

```text
# My Project Tasks
- [ ] Move me to end of current task list 🏁 Bottom
- [ ] Move me to "**# Completed Tasks Log**" list in this note 🏁 Log
- [ ] Move me to the "**Completed Tasks Archive**" note 🏁 Archive
- [ ] Delete me 🏁 Delete
- [ ] Leave me alone
```

If you use Tasks to mark all of the above tasks as "done", afterward your vault will contain two files:

Your `My Project` note file:

```text
# My Project Tasks
- [x] Leave me alone
- [x] Move me to end of current task list 🏁 Bottom

# Completed Tasks Log
- [x] Move me to "**# Completed Tasks Log**" list in this note 🏁 Log
```

And a new `Completed Tasks Archive` note file:

```text
- [x] Move me to the "**Completed Tasks Archive**" note 🏁 Archive
```

## Assigning and changing a task's "On Completion" action

An "On Completion" action can be assigned to a task through the Tasks plugin's 'Create or Edit Task' modal dialog.

Alternatively:  when a task already already has an assigned "On Completion" ***Action***, you can **Right-click** or **press-and-hold** the *checkered flag* emoji 🏁 to open a context menu from which you can either select another **Action** or 'turn off' the feature for that particular task.

## Configuration

### Vault-wide

The default values of both the **Archive** file's name ("Completed Tasks Archive") and the default **Header** for in-note lists of completed tasks ("# Completed Tasks Log") can be changed on a vault-wide basis in the Task plugin's configuration dialog.

### Note-specific

An alternative **Archive** file name and/or **Header** for in-note lists of completed tasks can be specified on a note-by-note basis using the following Properties (also known as 'YAML front matter'):

- **tasks-archive-file:**
- **tasks-log-list-heading:**

## Migrating from other plugins that processed "completed tasks"

Prior to the "On Completion" feature being added to Tasks, a few other Obsidian plugins were created to help manage completed tasks.  

For some of these plugins, no migration steps will be necessary to update your existing tasks to work with "On Completion".  For others, it may be both desirable and possible to systematically re-write your tasks to take advantage of this new feature.

If and as we learn of resources to facilitate migration from those plugins, we'll provide links below.  

- #TODO ***Packrat*** ('insert URI for Packrat repo's "'On Completion' migration page" here')

If you know of any other plugins' migration guides, please [open a New Issue](https://github.com/obsidian-tasks-group/obsidian-tasks/issues) in our GitHub repo to let us know, and we'll add a link that resource above!
