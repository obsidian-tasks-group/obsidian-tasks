# Smoke Testing the Tasks Plugin

## Introduction

- **Intended audience of this note**
  - Developers working on the Tasks plugin, reviewing a Pull Request (especially ones that change dependencies), or making a release, and who wish to do some basic tests of the plugin to make sure there are no glaring show-stopper errors.
- **What is a Smoke Test?**
  - As [Wikipedia](https://en.wikipedia.org/wiki/Smoke_testing_(software)) says: smoke testing ... is preliminary testing to reveal simple failures severe enough to, for example, reject a prospective software release.
- **Why not test everything?**
  - The Tasks plugin is run by volunteers in our finite spare time. We take care during development to write automated tests for the algorithms in our code, but there are some kinds of changes, such as in tools the project depends on, that we do not have automated tests for.
- **Why not test on every platform?**
  - It's not feasible nor a good use of limited volunteer time on a free tool.

## How the tests work

### Get the Tasks-Demo vault with the build to be tested

You can either [download the Tasks-demo vault with the build's Tasks plugin installed](https://publish.obsidian.md/tasks-contributing/Testing/How+do+I+test+a+GitHub+build+of+the+Tasks+plugin) - see Option 1.

Or you can install a download of the build's Tasks plugin inside your clone of the Tasks repo:

- Make sure you have the [obsidian-tasks repo](https://github.com/obsidian-tasks-group/obsidian-tasks) cloned and up-to-date on your machine.
- Open the Tasks-Demo vault on a machine of your choice:
  - Open Obsidian
  - Click 'Open another vault' button
  - Click 'Open folder as vault' button
  - Navigate to `obsidian-tasks/resources/sample_vaults/Tasks-Demo`
  - Click 'Open'
- Install the candidate build for the pull request or release inside the `Tasks-Demo` vault
  - See [How do I test a GitHub build of the Tasks plugin](https://publish.obsidian.md/tasks-contributing/Testing/How+do+I+test+a+GitHub+build+of+the+Tasks+plugin) - see Option 2.

### Follow the tests

- This note is a self-contained set of steps to check. You should check off tasks beginning `- [ ] check:` as you complete each section.

> [!Important]
> Several task blocks in this file depend of the the file name being unchanged. Please don't rename the file before running the tests.

---

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

### Completion of tasks

- [ ] #task Mark this task complete in **Source view** using **Tasks: Toggle task done** command
- [ ] #task Mark this task complete by clicking on it in **Reading view**
- [ ] #task Mark this task complete by clicking on it in **Live Preview**
- [ ] #task **check**: Checked all above methods for **completing tasks** - and they worked

### Un-completion of tasks

<!-- markdownlint-disable ul-style -->

* [x] #task Mark this task not complete in **Source view** using **Tasks: Toggle task done** command ✅ 2022-07-05
* [x] #task Mark this task not complete by clicking on it in **Reading view** ✅ 2022-07-05
* [x] #task Mark this task not complete by clicking on it in **Live Preview** ✅ 2022-07-05
* [ ] #task **check**: Checked all above methods for **un-completing tasks** - and they worked

<!-- markdownlint-enable ul-style -->

### Recurring Tasks

Confirm that when a recurring task is completed, a new task is created, all the date fields are incremented, and the indentation is unchanged.

> [!Todo]
>
> - [ ] #task Complete this recurring task in **Source view** using **Tasks: Toggle task done** command 🔁 every day 🛫 2022-02-17 ⏳ 2022-02-18 📅 2022-02-19
>
> > - [ ] #task Complete this recurring task in **Reading view**🔁 every day 🛫 2022-02-17 ⏳ 2022-02-18 📅 2022-02-19

- [ ] #task Complete this recurring task in **Live Preview**🔁 every day 🛫 2022-02-17 ⏳ 2022-02-18 📅 2022-02-19

> - [ ] #task **check**: Checked all above steps for **recurring tasks** worked

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

### Create or edit Task modal

- This text should copied in to the task Description, after following steps below
- [ ] #task Switch to **Live Preview** or **Source mode**, Click on the list item above, then do the following numbered steps and checks:
    1. run **Tasks: Create or edit task**
    2. **Check** that the text in the list item is copied in to the Description field
    3. Type some values in to the fields
    4. In one of the date fields, type `tm` (including the space afterwards) and **Check** it is expanded in to `tomorrow`
    5. Hit Return or click **Apply**
    6. **Check** that the list item above is converted in to a task
    7. **Check** that values you entered in the modal have been copied in to the list item above
    8. **Check** that the `#task` tag has been added to the start of the task
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
