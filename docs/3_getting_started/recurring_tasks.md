---
layout: default
title: Recurring Tasks
nav_order: 3
parent: Getting Started
has_toc: false
---

# Recurring Tasks
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

## Recurrence (Repetition)
Tasks can be recurring.
In order to specify a recurrence rule of a task, you must append the "recurrence signifier 🔁" followed by the recurrence rule.
For example: `🔁 every weekday` means the task will repeat every week on Monday through Friday.
Every recurrence rule has to start with the word `every`.

When you toggle the status of a recurring task to anything but "todo" (i.e. "done"), the orginal task that you wanted to toggle will be marked as done and get the done date appended to it, like any other task.
In addition, *a new task will be put one line above the original task.*
The new task will have the due date of the next occurrence after the due date of the original task.

Take as an example the following task:

```
- [ ] take out the trash 🔁 every Sunday 📅 2021-04-25
```

If you mark the above task "done" on Saturday, the 24th of April, the file will now look like this:

```
-   [ ] take out the trash 🔁 every Sunday 📅 2021-05-02
-   [x] take out the trash 🔁 every Sunday 📅 2021-04-25 ✅ 2021-04-24
```

*For best compatibility, a recurring task should have a due date and the recurrence rule should appear before the due date of a task.*

In the editor there is no direct feedback to whether your recurrence rule is valid.
You can validate that tasks understands your rule by using the `Tasks: Crete or edit` command when creating or editing a task.

---

## Examples

Examples of possible recurrence rules (mix and match as desired; these should be considered inspirational):

-   `🔁 every weekday` (meaning every Mon - Fri)
-   `🔁 every week on Sunday`
-   `🔁 every 2 weeks`
-   `🔁 every 3 weeks on Friday`
-   `🔁 every 2 months`
-   `🔁 every month on the 1st`
-   `🔁 every 6 months on the 1st Wednesday`
-   `🔁 every January on the 15th`
-   `🔁 every year`

