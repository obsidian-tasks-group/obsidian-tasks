---
layout: default
title: Recurring Tasks
nav_order: 4
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

When you toggle the status of a recurring task to anything but "todo" (i.e. "done"), the original task that you wanted to toggle will be marked as done and get the done date appended to it, like any other task.
In addition, _a new task will be put one line above the original task._
The new task will have updated dates based off the original task.

Take as an example the following task:

```markdown
- [ ] take out the trash 🔁 every Sunday 📅 2021-04-25
```

If you mark the above task "done", the file will now look like this:

```markdown
-   [ ] take out the trash 🔁 every Sunday 📅 2021-05-02
-   [x] take out the trash 🔁 every Sunday 📅 2021-04-25 ✅ 2021-04-24
```

The next Sunday after 25 April 2021 is on 2 May.

<div class="code-example" markdown="1">
Important
{: .label .label-yellow }

A recurring task should have a due date and the recurrence rule must appear before the due date on the line.

</div>

In the editor there is no direct feedback to whether your recurrence rule is valid.
You can validate that tasks understands your rule by using the `Tasks: Create or edit` command when creating or editing a task.

---

## Repeating a Task Based on the Original Due Date or the Completion Date

When you create a recurring task, you can decide whether the next occurrence should be based on the original dates or the date when you completed the task.
The default behavior results in newly created tasks having dates relative to the original task rather than "today".

For example, given that today is the 13. February 2022 and you just completed the lower task:

```markdown
- [ ] sweep the floors 🔁 every week ⏳ 2021-02-13
- [x] sweep the floors 🔁 every week ⏳ 2021-02-06 ✅ 2022-02-13
```

Since you missed the original scheduled date,
the newly created task is scheduled one week after the original scheduled date: the same day you completed the original task.

If you want to have tasks be scheduled relative to the "done" date rather than the original dates,
then you will need to add `when done` to the end of the recurrence rule.
Below is the same example as above, but this time the new task is scheduled based on the current date when you completed the task:

```markdown
- [ ] sweep the floors 🔁 every week when done ⏳ 2022-02-20
- [x] sweep the floors 🔁 every week when done ⏳ 2021-02-06 ✅ 2022-02-13
```

Now the newly created task is scheduled 1 week after the task was completed rather than 1 week after it was originally scheduled.

---

## Priority of Dates

A task can have [various dates]({{ site.baseurl }}{% link getting-started/dates.md %}).
When a task has multiple dates, one of them is selected as reference date based on the following priorities:

1. Due date
2. Scheduled date
3. Start date

If more dates than the reference date exist on the orginial recurring task, the next occurrence will have the same dates.
All dates of the next occurring task will have the relative distance to the reference date that they had on the original task.

For example: A task has a due date and a scheduled date.
The scheduled date is set 2 days before the due date.
The task is set to repeat every two weeks.

```markdown
-   [ ] Mow the lawn 🔁 every 2 weeks ⏳ 2021-10-28 📅 2021-10-30
```

The new task will have the due date advanced by two weeks and a scheduled date that is two days before the due date, like on the original task.

```markdown
-   [ ] Mow the lawn 🔁 every 2 weeks ⏳ 2021-11-11 📅 2021-11-13
```

---

## Known Issues

1. You can _not_ use rules where recurrence happens a certain number of times (`for x times`). Tasks doesn't link the tasks and doesn't know how often it occurred.
2. You can _not_ use rules where recurrence ends on a specific date (`until "date"`). There is a bug in [`rrule`](https://github.com/jakubroztocil/rrule) where `until "date"` rules are not converted to the correct text. As a consequence, every subsequent task's "until" date will be one day earlier than the one before.

---

## Examples

Examples of possible recurrence rules (mix and match as desired; these should be considered inspirational):

- `🔁 every 3 days`
- `🔁 every 10 days when done`
- `🔁 every weekday` (meaning every Mon - Fri)
- `🔁 every week on Sunday`
- `🔁 every 2 weeks`
- `🔁 every 3 weeks on Friday`
- `🔁 every 2 months`
- `🔁 every month on the 1st`
- `🔁 every 6 months on the 2nd Wednesday`
- `🔁 every January on the 15th`
- `🔁 every April and December on the 1st and 24th` (meaning every _April 1st_ and _December 24th_)
- `🔁 every year`
