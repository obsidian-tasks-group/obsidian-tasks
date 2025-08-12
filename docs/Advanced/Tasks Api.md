---
publish: true
---

# Tasks API

<span class="related-pages">#plugin/quickadd</span>

## Tasks API Interface

> [!released]
The Tasks API Interface was introduced in Tasks 2.0.0.

Tasks exposes an API that can be used to integrate Tasks in other Plugins, scripts or
dynamic code blocks.

The Tasks API is available from `app.plugins.plugins['obsidian-tasks-plugin'].apiV1`,
where `app` is the Obsidian App. A reference to the Obsidian App is usually available via `this.app`,
however, this depends on the context of the executing script.

This is the interface the API exposes:

<!-- snippet: TasksApiV1.ts -->
```ts
/**
 * Tasks API v1 interface
 */
export interface TasksApiV1 {
    /**
     * Opens the Tasks UI and returns the Markdown string for the task entered.
     *
     * @returns {Promise<string>} A promise that contains the Markdown string for the task entered or
     * an empty string, if data entry was cancelled.
     */
    createTaskLineModal(): Promise<string>;

    /**
     * Opens the Tasks UI pre-filled with the provided task line for editing.
     * Does not edit the task line in the file, but returns the edited task line as a Markdown string.
     *
     * @param taskLine The markdown string of the task line to edit
     * @returns {Promise<string>} A promise that contains the Markdown string for the edited task or
     * an empty string in the case where the data entry was cancelled.
     */
    editTaskLineModal(taskLine: string): Promise<string>;

    /**
     * Executes the 'Tasks: Toggle task done' command on the supplied line string
     *
     * @param line The markdown string of the task line being toggled
     * @param path The path to the file containing line
     * @returns The updated line string, which will contain two lines
     *          if a recurring task was completed.
     */
    executeToggleTaskDoneCommand: (line: string, path: string) => string;
}
```
<!-- endSnippet -->

## `createTaskLineModal(): Promise<string>;`

> [!released]
This method was introduced in Tasks 2.0.0.

This method opens the Tasks [[Create or edit Task|Create or edit task UI]] and returns the Markdown for the task entered.
If data entry is cancelled, an empty string is returned.

```javascript
const tasksApi = this.app.plugins.plugins['obsidian-tasks-plugin'].apiV1;
let taskLine = await tasksApi.createTaskLineModal();

// Do whatever you want with the returned value.
// It's just a string containing the Markdown for the task.
console.log(taskLine);
```

> [!warning]
> This function returns a `Promise` - always `await` the result!

> [!Tip]- Find plugins that use the Tasks API to create tasks
> [Search GitHub for plugins which may use this function](https://github.com/search?q=createTaskLineModal+NOT+is%3Afork+NOT+repo%3Aobsidian-tasks-group%2Fobsidian-tasks+NOT+path%3A*.md&type=code), and by using `createTaskLineModal()`, will fully respect your Tasks settings.
> > [!warning]
> >
> > - You will need to be logged in to GitHub for this search to work.
> > - Not all of these plugins have been reviewed by the Obsidian team: you should search for them in `Settings` > `Community plugins` - or review in [Plugins - Obsidian](https://obsidian.md/plugins) - for safety.

### Usage with QuickAdd
One of the most common usage scenarios is probably in combination with the [QuickAdd](https://github.com/chhoumann/quickadd) plugin
to automatically add tasks to a specific file.

See [[QuickAdd#Launching the Create task modal via QuickAdd|Launching the Create task modal via QuickAdd]] for full details of how to do this.

## `editTaskLineModal(taskLine: string): Promise<string>;`

> [!released]
> This method was introduced in Tasks 7.21.0.

This method opens the Tasks [[Create or edit Task|Create or edit task UI]] with the provided task line pre-filled for editing.
If data entry is cancelled, an empty string is returned.

```javascript
const tasksApi = this.app.plugins.plugins['obsidian-tasks-plugin'].apiV1;
let editedTaskLine = await tasksApi.editTaskLineModal('- [ ] My existing task');

// Do whatever you want with the returned value.
// It's just a string containing the Markdown for the edited task.
console.log(editedTaskLine);
```

> [!warning]
> This function returns a `Promise` - always `await` the result!

## `executeToggleTaskDoneCommand: (line: string, path: string) => string;`

> [!released]
> This method was introduced in Tasks 7.2.0.

Executes the 'Tasks: Toggle task done' command on the supplied line string. It toggles and updates a task line according to a user's preferences, accounting for recurrence rules and completed status. It returns a string representing the toggled task.

```typescript
const tasksApi = this.app.plugins.plugins['obsidian-tasks-plugin'].apiV1;
const sourceFile: TFile = file;
const taskLine = '- [ ] This is a task 📅 2024-04-24';

const result = tasksApi.executeToggleTaskDoneCommand(taskLine, sourceFile.path);

// Do whatever you want with the returned value.
// It's just a string containing the Markdown for the toggled task.
console.log(result); // "- [x] This is a task 📅 2024-04-24 ✅ 2024-04-23"
```

> [!Tip]- Find plugins that use the Tasks API to toggle tasks
> [Search GitHub for plugins which may use this function](https://github.com/search?q=executeToggleTaskDoneCommand+NOT+is%3Afork+NOT+repo%3Aobsidian-tasks-group%2Fobsidian-tasks+NOT+path%3A*.md&type=code), and by using `executeToggleTaskDoneCommand()`, will fully respect your Tasks settings.
> > [!warning]
> >
> > - You will need to be logged in to GitHub for this search to work.
> > - Not all of these plugins have been reviewed by the Obsidian team: you should search for them in `Settings` > `Community plugins` - or review in [Plugins - Obsidian](https://obsidian.md/plugins) - for safety.

## Auto-Suggest Integration

> [!released]
> This integration was introduced in Tasks 7.2.0.

Plugins that [extend Obsidian's markdown editor](https://gist.github.com/Fevol/caa478ce303e69eabede7b12b2323838) can control if and when Tasks' [[Auto-Suggest]] displays by implementing a `showTasksPluginAutoSuggest` method on the extended editor class. This method must adhere the function definition below.

```typescript
/**
 * Returns
 * - true to explicitly request that the suggest be displayed
 * - false to request that it be hidden
 * - undefined to defer to Tasks' default behavior
 *
 * @param cursor The current cursor position in the editor
 * @param editor The editor instance
 * @param lineHasGlobalFilter True if the line the cursor is in matches the
 *        global filter or if no global filter is set
 */
showTasksPluginAutoSuggest(
  cursor: EditorPosition,
  editor: Editor,
  lineHasGlobalFilter: boolean
): boolean | undefined
```

This can be used, for example, to display the Auto-Suggest on non-task lines. [See the Kanban plugin for an example](https://github.com/mgmeyers/obsidian-kanban/blob/5fa792b9c2157390fe493f0feed6f0bc9be72910/src/components/Editor/MarkdownEditor.tsx#L100-L106).

> [!warning]
> If the `Editor` is not a `MarkdownView`, the functionality is slightly limited.
> It won't be possible to create [[Task Dependencies]] fields `id` and `dependsOn`.

> [!Tip]- Find plugins that use the Tasks API to suggest task properties
> [Search GitHub for plugins which may use this function](https://github.com/search?q=showTasksPluginAutoSuggest+NOT+is%3Afork+NOT+repo%3Aobsidian-tasks-group%2Fobsidian-tasks+NOT+path%3A*.md&type=code), and by using `showTasksPluginAutoSuggest()`, will fully respect your Tasks settings.
> > [!warning]
> >
> > - You will need to be logged in to GitHub for this search to work.
> > - Not all of these plugins have been reviewed by the Obsidian team: you should search for them in `Settings` > `Community plugins` - or review in [Plugins - Obsidian](https://obsidian.md/plugins) - for safety.

## Limitations of the Tasks API

- Auto Suggest:
  - It is not yet possible for [[auto-suggest]] to add [[Task Dependencies|dependencies]] when Auto-Suggest is used in [[Kanban plugin]] cards - or any other plugins that use the [[Tasks Api#Auto-Suggest Integration|Auto-Suggest Integration]]. We are tracking this in [issue #3274](https://github.com/obsidian-tasks-group/obsidian-tasks/issues/3274).
- Searching tasks:
  - It is not yet possible to run Tasks searches via the API. We are tracking this in [issue #2459](https://github.com/obsidian-tasks-group/obsidian-tasks/issues/2459).
