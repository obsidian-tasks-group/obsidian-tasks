---
layout: default
title: Recurring Tasks (Repetition)
nav_order: 3
parent: Getting Started
has_toc: false
---

# Recurring Tasks (Repetition)
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

If you mark the above task "done", the file will now look like this:

```
-   [ ] take out the trash 🔁 every Sunday 📅 2021-05-02
-   [x] take out the trash 🔁 every Sunday 📅 2021-04-25 ✅ 2021-04-24
```

The next Sunday after 25 April 2021 is on 2 May.

Important
{: .label .label-yellow }

*A recurring task should have a due date and the recurrence rule must appear before the due date on the line.*

In the editor there is no direct feedback to whether your recurrence rule is valid.
You can validate that tasks understands your rule by using the `Tasks: Crete or edit` command when creating or editing a task.

---

## Known Issues

1. You can *not* use rules where recurrence happens a certain number of times (`for x times`). Tasks doesn't link the tasks and doesn't know how often it occurred.
2. You can *not* use rules where recurrence ends on a specific date (`until "date"`). There is a bug in [`rrule`](https://github.com/jakubroztocil/rrule) where `until "date"` rules are not converted to the correct text. As a consequence, every subsequent task's "until" date will be one day earlier than the one before.

## Examples

Examples of possible recurrence rules (mix and match as desired; these should be considered inspirational):

-   `🔁 every weekday` (meaning every Mon - Fri)
-   `🔁 every week on Sunday`
-   `🔁 every 2 weeks`
-   `🔁 every 3 weeks on Friday`
-   `🔁 every 2 months`
-   `🔁 every month on the 1st`
-   `🔁 every 6 months on the 2nd Wednesday`
-   `🔁 every January on the 15th`
-   `🔁 every year`

