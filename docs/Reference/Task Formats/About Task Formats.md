---
publish: true
---

# About Task Formats

<span class="related-pages">#task-formats #index-pages</span>

## What is a "Task Format"?

In this project, we use "Task Format" to refer to the characters to include in a task line in Markdown to express that task's properties, such as Due date and Priority.

Since its creation, the Tasks plugin has only ever used Emoji characters such as 📅 and ⏫.

## Selecting the task format

> [!released]
> Introduced in Tasks 3.3.0.

You can now choose the task format that Tasks will use to read and write data on task lines:

![Screenshot of the settings option to select Task Format](settings-task-format.png)

## Supported task formats

Tasks supports these task formats:

- [[Tasks Emoji Format]] - the default format
  - `⏫ 🔁 every day when done`
  - `🛫 2023-04-05 ⏳ 2023-04-06 📅 2023-04-07`
  - `➕ 2023-04-03 ✅ 2023-04-08`
- [[Dataview Format]]
  - `[priority:: high], [repeat:: every day when done]`
  - `[start:: 2023-04-05], [scheduled:: 2023-04-06], [due:: 2023-04-07]`
  - `[created:: 2023-04-03], [completion:: 2023-04-08]`
  - **Note:** do read this format's documentation, as there are some important differences between Tasks and Dataview interpretations.

## Impact of non-default task formats on Tasks behaviour

> [!Warning]
> In this initial support for multiple formats, **Tasks only supports reading and writing one format at a time**.
>
> If you select Dataview format, Tasks will no longer read any of its own Emoji signifiers (until you change the format back to Tasks again).
>
> We are tracking this in [issue #1891](https://github.com/obsidian-tasks-group/obsidian-tasks/issues/1891), and Tasks will be taught to *read* all supported task formats in a future release.

### Tasks features that respect the chosen format

The chosen task format determines how the Tasks plugin reads and writes task data.

The following facilities use the chosen format:

- **Reading and writing of Task lines**
  - These will **only** use the chosen format.
- **Live Preview**
- The [[Create or edit Task]] modal saves the task in the chosen format
  - Note that, while editing a task, it shows the current values in the default (Emoji) format, though.
- [[Auto-Suggest]]
  - Note that, for dataview format, you should first type the chosen brackets - `[]` or `()` - and then start typing to choose a field to insert in the brackets.

### Tasks features that don't respect the chosen format

In this early support for multiple formats, the following facilities don't (yet) use the chosen format and instead use the default (Emoji) format:

- **Reading mode**
  - When viewing a note containing task lines in Reading mode, the task data is shown with Emojis, irrespective of the user's selected task format.
  - We are tracking this in [issue #1889](https://github.com/obsidian-tasks-group/obsidian-tasks/issues/1889).
- **Display of tasks in Tasks query blocks**
  - When viewing a note containing task search results, the task data is shown with Emojis, irrespective of the user's selected task format.
  - We are tracking this in [issue #1890](https://github.com/obsidian-tasks-group/obsidian-tasks/issues/1890).

## Limitations of task format support

- The order of fields on the task line still matters.
  - See [[Auto-Suggest#What do I need to know about the order of items in a task?]]
  - We are tracking this in [issue #1505](https://github.com/obsidian-tasks-group/obsidian-tasks/issues/1505).
  - See [[Find tasks with invalid data#Finding unread emojis|Finding unread emojis]] to find and fix any tasks with unread emoji values.
- Currently, Tasks only supports one format at a time (as mentioned above).
  - If you select the Dataview format, it will no longer read or write Tasks emoji signifiers.
  - We are tracking this in [issue #1891](https://github.com/obsidian-tasks-group/obsidian-tasks/issues/1891).
- There is no facility in Tasks to convert a vault from one task format to another.
