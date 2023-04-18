---
publish: true
---

# About Formats

<span class="related-pages">#formats</span>

## Selecting the task format

> [!released]
> Introduced in Tasks X.Y.Z.

You can chose the format that Tasks will use to read and write data on task lines:

![Screenshot of the settings option to select Task Format](settings-task-format.png)

> [!Warning]
> Currently tasks only supports one format at a time.
>
> If you select the dataview format, Tasks will no longer read any of its own Emoji signifiers.
>
> We are tracking this in [issue #1891](https://github.com/obsidian-tasks-group/obsidian-tasks/issues/1891).

## Supported formats

- [[Tasks Format]] - the Default format
  - `⏫ 🔁 every day when done`
  - `🛫 2023-04-05 ⏳ 2023-04-06 📅 2023-04-07`
  - `➕ 2023-04-03 ✅ 2023-04-08`
- [[Dataview Format]]
  - `[priority:: high] [repeat:: every day when done]`
  - `[start:: 2023-04-05] [scheduled:: 2023-04-06] [due:: 2023-04-07]`
  - `[created:: 2023-04-03] [completion:: 2023-04-08]`
  - **Note:** do read the documentation, as there are some important differences between Tasks and Dataview interpretations.

## Impact of format on Tasks behaviour

### Where the chosen format is used

The chosen file format determines how the Tasks plugin reads and writes task data.

The following facilities **use** the chosen format:

- **Live Preview**
- The [[Create or edit Task]] modal saves the task in the chosen format
  - Note that, while editing a task, it shows the current values in the default (Emoji) format, though.
- [[Auto-Suggest]]
  - Note that, for dataview format, the user is required to first type the chosen brackets - `[]` or `()` - and then start typing to chose a field to insert in the brackets.

### Where the default format is NOT used

In this early support for multiple formats, the following facilities currently **ignore** the chosen format and instead use the default emoji format:

- **Reading mode**
  - When viewing a note containing task lines in Reading mode, the task data is shown with Emojis, irrespective of the user's selected task format.
  - We are tracking this in [issue #1889](https://github.com/obsidian-tasks-group/obsidian-tasks/issues/1889).
- **Display of tasks in Tasks query blocks**
  - When viewing a note containing task search results, the task data is shown with Emojis, irrespective of the user's selected task format.
  - We are tracking this in [issue #1890](https://github.com/obsidian-tasks-group/obsidian-tasks/issues/1890).

## Limitations of file format support

- The order of fields on the task line still matters.
  - See [[Auto-Suggest#What do I need to know about the order of items in a task?]]
  - We are tracking this in [issue #1505](https://github.com/obsidian-tasks-group/obsidian-tasks/issues/1505).
- Currently, Tasks only supports one format at a time.
  - If you select the Dataview format, it will no longer read or write Tasks emoji signifiers.
  - We are tracking this in [issue #1891](https://github.com/obsidian-tasks-group/obsidian-tasks/issues/1891).
- There is no facility in Tasks to convert vault from one format to another.
