---
layout: default
title: Getting Started
nav_order: 3
has_children: true
---

# Getting Started
{: .no_toc }

<details open markdown="block">
  <summary>
    Table of contents
  </summary>
  {: .text-delta }
1. TOC
{:toc}
</details>

---

## Usage

Tasks tracks your checklist items from your vault.
The simplest way to create a new task is to create a new checklist item.
The markdown syntax for checklist items is a list item that starts with spaced brackets: `- [ ] take out the trash`.
Now Tasks tracks that you need to take out the trash!

**⚠️ Whenever Tasks behaves in an unexpected way, please try restarting obsidian.**

**⚠️ Tasks only supports single-line checklist items.**
You cannot have checklist items that span across multiple lines.

This works:

```markdown
- [ ] This is a task
    - This is a sub-item
    - Another sub-item
    - [ ] And a sub task
        - Even more details
```

The following *does not work:*

```markdown
- [ ] This task starts on this line
      and then its description continues on the next line
```

**⚠️ Tasks only supports checklist items in markdown files with the file extension `.md`**

A more convenient way to create a task is by using the `Tasks: Create or edit` command from the command palette.
You can also bind a hotkey to the command.
The command will parse what's on the current line in your editor and pre-populate a modal.
In the modal, you can change the task's description, its due date, and a recurrence rule to have a repeating task.
See below for more details on due dates and recurrence.
You cannot toggle a task (un)done in the modal.
For that, do one of the following.

There are two ways to mark a task done:

1. In preview mode, click the checkbox at the beginning of the task to toggle the status between "todo" and "done".
2. In edit mode, use the command `Tasks: Toggle Done`.
    - The command will only be available if the cursor is on a line with a checklist item.
    - You can map he command to a hotkey in order to quickly toggle statuses in the editor view (I recommend to replace the original "Toggle checklist status" with it).
    - If the checklist item is not a task (e.g. due to a global filter), the command will toggle it like a regular checklist item.

A "done" task will have the date it was done appended to the end of its line.
For example: `✅ 2021-04-09` means the task was done on the 9th of April, 2021.

