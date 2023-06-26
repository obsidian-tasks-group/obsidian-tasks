# Urgency Scores Examples

## Purpose

This note contains the Urgency worked examples that are used in the user docs at:
<https://publish.obsidian.md/tasks/Advanced/Urgency#Examples>

They group tasks by their scores, to confirm that the calculated scores agree with the values in the documentation.

## Tasks

- [ ] #task 1 A task that is due today, has a "medium" priority, is not scheduled, and has no start date - **urgency should be 12.70**: 🔼 📅 2023-06-26

urgency = 8.8 + 3.9 + 0.0 + 0.0 = 12.7

---

- [ ] #task 2 A task that has no due date, a "high" priority, is scheduled for yesterday, and started yesterday - **urgency should be 11.00**: ⏫ 🛫 2023-06-25 ⏳ 2023-06-25

urgency = 0.0 + 6.0 + 5.0 + 0.0 = 11.0

---

- [ ] #task 3 A task that has no due date, a "high" priority, is scheduled for tomorrow, and starts tomorrow - **urgency should be 3.00**: ⏫ 🛫 2023-06-27 ⏳ 2023-06-27

urgency = 0.0 + 6.0 + 0.0 - 3.0 = 3.0

---

## Search

```tasks
filename includes Urgency Scores Examples
group by urgency
group by function task.due.formatAsDateAndTime()
```
