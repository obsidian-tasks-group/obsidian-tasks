<h1 align="center">Obsidian Tasks</h1>

<p align="center">Task management for the <a href="https://obsidian.md/">Obsidian</a> knowledge base.</p>

<p align="center">
  ⚠️ The latest release requires Obsidian 12.0.0 or higher ⚠️
</p>

<p align="center">
  <a href="#installation">Installation</a> •
  <a href="#usage">Usage</a> •
  <a href="#due-dates">Due Dates</a> •
  <a href="#recurring-tasks-repetition">Recurrence</a> •
  <a href="#querying-and-listing-tasks">Querying</a>
</p>

<hr />

Track tasks across your entire vault. Query them and mark them as done wherever you want. Supports due dates, recurring tasks (repetition), done dates, sub-set of checklist items, and filtering.

## Screenshots

*You can toggle the task status in any view/query and it will update the source file.*

![ACME Tasks](./resources/screenshots/acme.png)
The `ACME` note has some tasks.

![Important Project Tasks](./resources/screenshots/important_project.png)
The `Important Project` note also has some tasks.

![Tasks Queries](./resources/screenshots/tasks_queries.png)
The `Tasks` note gathers all tasks from the vault and displays them using queries.

## Installation

Tasks is not yet available in the repository of Obsidian community plugins.
You have to download, install, and activate the plugin manually.
Follow the steps below to install Tasks.

1. Go to the latest [release](https://github.com/schemar/obsidian-tasks/releases).
2. Download:
    - `main.js`
    - `styles.css`
    - `manifest.json`
3. Copy the files into your vault under `<VaultFolder>/.obsidian/plugins/obsidian-tasks/`.
4. Enable the plugin in your Obsidian settings (find "Tasks" under "Community plugins").
5. Check the settings. It makes sense to set the global filter early on (if you want one).
6. Replace the "Toggle checklist status" hotkey with "Tasks: Toggle Done".
    - I recommend you remove the original toggle hotkey and set the "Tasks" toggle to `Ctrl + Enter` (or `Cmd + Enter` on a mac).

## Usage

Tasks tracks your checklist items from your vault.

ℹ You can set a global filter in the settings so that Tasks only matches specific checklist items.
For example, you could set it to `#tasks` to only track checklist items as task if they include the string `#tasks`.
It doesn't have to be a tag. It can be any string.
Leave it empty to reagard all checklist items as tasks.

Example with global filter `#tasks`:

```
- [ ] #tasks take out the trash
```

If you don't have a global filter set, all regular checklist items work:

```
- [ ] take out the trash
```

There are two ways to mark a task done:

1. In preview mode, click the checkbox at the beginning of the task to toggle the status between "todo" and "done".
2. In edit mode, use the command `Tasks: Toggle Done`.
    - The command will only be available if the cursor is on a line with a checklist item.
    - You can map he command to a hotkey in order to quickly toggle statuses in the editor view (I recommend to replace the original "Toggle checklist status" with it).
    - If the checklist item is not a task (e.g. due to a global filter), the command will toggle it like a regular checklist item.

A "done" task will have the date it was done appended to the end of its line.
For example: `✅ 2021-04-09` means the task was done on the 9th of April, 2021.

### Due dates

Tasks can have due dates.
In order to specify the due date of a task, you must append the "due date signifier 📅" followed by the date it is due to the end of the task.
The date must be in the format `YYYY-MM-DD`, meaning `Year-Month-Day` with leading zeros.
For example: `📅 2021-04-09` means the task is due on the 9th of April, 2021.

```
- [ ] take out the trash 📅 2021-04-09
```

**You can not put anything behind the due/done dates. Also not a global filter. Everything after the dates will be removed by Tasks.**

### Recurring tasks (repetition)

Tasks can be recurring.
In order to specify a recurrence rule of a task, you must append the "recurrence signifier 🔁" followed by the recurrence rule.
For example: `🔁 every weekday` means the task will repeat every week on Monday through Friday.

When you toggle the status of a recurring task to anything but "todo" (i.e. "done"), the orginal task that you wanted to toggle will be marked as done and get the done date appended to it, like any other task.
In addition, *a new task will be put one line above the original task.*
The new task will have the due date of the next occurrence after the due date of the original task.

Take as example the following task::

```
- [ ] take out the trash 🔁 every Sunday 📅 2021-04-25
```

If you mark the above task "done" on Saturday, the 24th of April, the file will now look like this:

```
-   [ ] take out the trash 🔁 every Sunday 📅 2021-05-02
-   [x] take out the trash 🔁 every Sunday 📅 2021-04-25 ✅ 2021-04-24
```

*For best compatibility, a recurring task should have a due date and the recurrence rule should appear before the due date of a task.*

Right now there is no direct feedback to whether your recurrence rule is valid.
You can validate that tasks understands your rule by checking that the task includes the recurrence rule when it is rendered, for example in the markdown preview of the file where it is defined or in another tasks query.
When it is shown (with the checkbox on the left), then tasks understands it.

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

### Querying and listing tasks

You can list tasks from your entire vault by querying them using a `tasks` code block.
Tasks are sorted by due date and then path.

**The result list will list tasks unindented.**
See section Caveats for more details.

The simplest way is this:

    ```tasks
    ```

In preview mode, this will list all tasks from you vault, regardless of their status.
This is probably not what you want. Therefore, Tasks allows you to filter the tasks that you want to show.
All date filters must be in the format `YYYY-MM-DD`, meaning `Year-Month-Day` with leading zeros.

The following filters exist:

- `done`
- `not done`
- `done (before|after|on) <date>`
- `no due date`
- `due (before|after|on) <date>`
- `path (includes|does not include) <path>`
- `description (includes|does not include) <string>`
- `exclude sub-items`
    - When this is set, the result list will only include tasks that are not indented in their file. It will only show tasks that are top level list items in their list.

#### Examples

Show all tasks that aren't done, are due on the 9th of April 2021, and where the path includes `GitHub`:

    ```tasks
    not done
    due on 2021-04-09
    path includes GitHub
    ````

Show all tasks that were done before the 1st of December 2020:

    ```tasks
    done before 2020-12-01
    ```

### Tips

#### Daily Agenda

If you use the [calendar](https://github.com/liamcain/obsidian-calendar-plugin) plugin,
you can use the following in your daily note *template* for an agenda:

    ## Tasks
    ### Overdue
    ```tasks
    not done
    due before {{date:YYYY-MM-DD}}
    ```
    
    ### Due today
    ```tasks
    not done
    due on {{date:YYYY-MM-DD}}
    ```
    
    ### Due in the next two weeks
    ```tasks
    not done
    due after {{date:YYYY-MM-DD}}
    due before {{date+14d:YYYY-MM-DD}}
    ```
    
    ### No due date
    ```tasks
    not done
    no due date
    ```
    
    ### Done today
    ```tasks
    done on {{date:YYYY-MM-DD}}
    ```

#### Natural Language Due Date
(Thanks to @zolrath)

If you use the [templater](https://github.com/SilentVoid13/Templater) and [nldates](https://github.com/argenos/nldates-obsidian) plugins,
you can use the following for a pop-up to add a task's due date to the end of the line:

```js
<%*
let dueDateStr = await tp.system.prompt("Task Due Date:");
let parseResult;
let parseResultMarker;
if (dueDateStr) {
    let nlDatesPlugin = this.app.plugins.getPlugin('nldates-obsidian');
    parseResult = nlDatesPlugin.parseDate(dueDateStr);
    if (parseResult.date) {
        parseResultMarker = '📅 ' + parseResult.formattedString;
    }
}

if (parseResultMarker) {
    let cmEditorAct = this.app.workspace.activeLeaf.view.sourceMode.cmEditor;
    let curLine = cmEditorAct.getCursor().line;
    cmEditorAct.setSelection({ line: curLine, ch: 0 }, { line: curLine, ch: 9999 });
    tR = tp.file.selection() + ' ' + parseResultMarker;
}
%>
```

### Caveats

**A query result list will list tasks unindented!**

I am happy to discuss this and possibly change it.
However, there is more to it than simply indenting the task the same depth it was indented in the source file.
Below what item should it be indented? Its direct parent? Does that have to be a task?

## Development

Clone the repository, run `yarn` to install the dependencies, and run `yarn dev` to compile the plugin and watch file changes.
