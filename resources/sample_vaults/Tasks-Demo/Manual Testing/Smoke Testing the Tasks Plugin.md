# Smoke Testing the Tasks Plugin

*[[#Remaining tests|Jump to the tests...]]*

## Remaining tests

Work through all the tasks below, until zero tasks remain in this query:

> [!Todo] Remaining groups of tests
>
> ```tasks
> not done
> path includes Smoke Testing the Tasks Plugin
> description includes **check**:
>
> short display
> ```

---

## The Smoke Tests

### Toggling tasks

#### Recurring Tasks

Confirm that when a recurring task is completed, a new task is created, all the date fields are incremented, and the indentation is unchanged.

> [!Todo]
>
> - [ ] #task Complete this recurring task in **Source view** using **Tasks: Toggle task done** command 🔁 every day 🛫 2022-02-17 ⏳ 2022-02-18 📅 2022-02-19
>
> > - [ ] #task Complete this recurring task in **Reading view** 🔁 every day 🛫 2022-02-17 ⏳ 2022-02-18 📅 2022-02-19

- [ ] #task Complete this recurring task in **Live Preview** - ==ensure the checkbox is redrawn correctly== 🔁 every day 🛫 2022-02-17 ⏳ 2022-02-18 📅 2022-02-19

> - [ ] #task **check**: Checked all above steps for **recurring tasks** worked

---

### Edit dates in Rendered Task Blocks

> [!Example]
>
> - [ ] #task Sample task: I have all the supported date types ➕ 2024-09-01 🛫 2024-09-02 ⏳ 2024-09-03 📅 2024-09-04 ❌ 2024-09-05 ✅ 2024-09-06

- View this file in **Reading mode**...
- On the task line above:
  - [ ] #task **left**-click on a date value, and use the date picker to select and save a different date. Check that the date is updated.
- In the tasks search block below:
  - [ ] #task **left**-click on a date value, and use the date picker to select and save a different date. Check that the date is updated.
- [ ] #task **check**: Checked all above steps for **editing dates** worked

```tasks
path includes {{query.file.path}}
description includes I have all the supported date types
hide backlink
hide postpone button
```
