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

### On Completion

#### On Completion Delete: Non-recurring tasks

Confirm that the **task line is deleted**.

- [ ] #task Complete this auto-deleting non-recurring task in **Source view** using **Tasks: Toggle task done** command 🏁 delete 📅 2024-10-27
- [ ] #task Complete this auto-deleting non-recurring task in **Reading view** 🏁 delete 📅 2024-10-27
- [ ] #task Complete this auto-deleting non-recurring task in **Live Preview** 🏁 delete 📅 2024-10-27
- [ ] #task **check**: Checked all above steps for **auto-deleting non-recurring tasks** worked

#### On Completion Delete: Recurring Tasks

Confirm that when an auto-deleting recurring task is completed, a **new task is created replacing the old task**, and the checkbox remains not-done.

- [ ] #task Complete this auto-deleting recurring task in **Source view** using **Tasks: Toggle task done** command 🔁 every day 🏁 delete 📅 2024-10-27
- [ ] #task Complete this auto-deleting recurring task in **Reading view** 🔁 every day 🏁 delete 📅 2024-10-27
- [ ] #task Complete this auto-deleting recurring task in **Live Preview** - ==ensure the checkbox is redrawn correctly== 🔁 every day 🏁 delete 📅 2024-10-27
- [ ] #task **check**: Checked all above steps for **auto-deleting recurring tasks** worked

### Rendering of Task Blocks

Steps to do:

<!-- markdownlint-disable ul-style -->

+ [ ] #task View this file in **Reading view** and confirm that the tasks in this section are listed
+ [ ] #task View this file in **Live Preview** and confirm that the tasks in this section are listed
+ [ ] #task **check**: Checked all above steps for **viewing task blocks** worked

<!-- markdownlint-enable ul-style -->

---

Tasks block to check - should list all the tasks in this section, regardless of state

```tasks
path includes Smoke Testing the Tasks Plugin
heading includes Rendering of Task Blocks
```

---

### Styling of Rendered Task Blocks

- [ ] #task **check**: Open the file [[Styling of Queries]] and follow the steps there

---

### Edit dates in Rendered Task Blocks

> [!Example]
>
> - [ ] #task Sample task: I have all the supported date types ➕ 2024-09-01 🛫 2024-09-02 ⏳ 2024-09-03 📅 2024-09-04 ❌ 2024-09-05 ✅ 2024-09-06

- View this file in **Reading mode**...
- On the task line above:
  - [ ] #task **left**-click on a date value, and use the date picker to select and save a different date. Check that the date is updated.
  - [ ] #task **left**-click on a date value, and click outside the date picker, to confirm that the picker closes.
  - [ ] #task **right**-click on a date value, and use the context menu to select and save a different date. Check that the date is updated.
  - [ ] #task **right**-click on a date value, and click outside the context menu, to confirm that the menu closes.
- In the tasks search block below:
  - [ ] #task **left**-click on a date value, and use the date picker to select and save a different date. Check that the date is updated.
  - [ ] #task **left**-click on a date value, and click outside the date picker, to confirm that the picker closes.
  - [ ] #task **right**-click on a date value, and use the context menu to select and save a different date. Check that the date is updated.
  - [ ] #task **right**-click on a date value, and click outside the context menu, to confirm that the menu closes.
- [ ] #task **check**: Checked all above steps for **editing dates** worked

```tasks
path includes {{query.file.path}}
description includes I have all the supported date types
hide backlink
hide postpone button
```

---

### Create or edit Task modal

- This text should copied in to the task Description, after following steps below
- [ ] #task Switch to **Live Preview** or **Source mode**, Click on the list item above, then do the following numbered steps and checks:
    1. run **Tasks: Create or edit task**
    2. **Check** that the text in the list item is copied in to the Description field
    3. Type some values in to the fields
    4. In one of the date fields, type `tm` (including the space afterwards) and **Check** it is expanded in to `tomorrow`
    5. In one of the date fields, left-click the calendar button, and use the context menu to select and save a date. Check that the date is saved.
    6. In one of the date fields, left-click the calendar button, and click outside the date picker, to confirm that the picker closes and the modal is still usable.
    7. Hit Return or click **Apply**
    8. **Check** that the list item above is converted in to a task
    9. **Check** that values you entered in the modal have been copied in to the list item above
    10. **Check** that the `#task` tag has been added to the start of the task
- [ ] #task **check**: Checked all above steps for **creating a task via the modal** worked

---

## Check the plugin starts OK with no `data.json` settings file

- Preparation
  - Go to Settings -> Community plugins -> Installed plugins -> click on the folder icon to **Open plugins folder**
  - Quit Obsidian
  - Open the `obsidian-tasks-plugin` folder
  - Delete `data.json`
- Test
  - Restart obsidian
  - Go to Settings
  - Check that `Tasks` is shown in the list of **Community plugins**
  - View -> Toggle Developer Tools
  - Open the console
  - Confirm that there are no red messages mentioning Tasks
- [ ] #task **check**: Checked that Tasks works correctly when **there is no `data.json` present**
