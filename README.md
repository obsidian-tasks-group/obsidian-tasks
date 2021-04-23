# Obsidian Tasks

Task management for the [Obsidian](https://obsidian.md/) knowledge base. The latest release requires Obsidian 12.0.0 or higher.

Track tasks across your entire vault. Query them and mark them as done wherever you want.

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
In order to specify the due date of a task, you must append the "due date signifier" followed by the date it is due to the end of the task.
The date must be in the format `YYYY-MM-DD`, meaning `Year-Month-Day` with leading zeros.
For example: `📅 2021-04-09` means the task is due on the 9th of April, 2021.

```
- [ ] take out the trash 📅 2021-04-09
```

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

### Caveats

**A query result list will list tasks unindented!**

I am happy to discuss this and possibly change it.
However, there is more to it than simply indenting the task the same depth it was indented in the source file.
Below what item should it be indented? Its direct parent? Does that have to be a task?

## Development

Clone the repository, run `yarn` to install the dependencies, and run `yarn dev` to compile the plugin and watch file changes.
