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

Tasks also exposes `apiV2`, which includes all `apiV1` methods and adds versioned task objects,
task search, task creation, task editing, and task ID generation.

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

## Tasks API V2 Interface

Use `app.plugins.plugins['obsidian-tasks-plugin'].apiV2` to access V2.

V2 returns `TaskV1` objects instead of the internal Tasks `Task` class.
Date fields are strings in `YYYY-MM-DD` format or `null`.
Line numbers are zero-based, matching Obsidian's editor and cache positions.

```ts
interface TaskV1 {
    id: string;
    description: string;
    status: string;
    priority: string;
    createdDate: string | null;
    startDate: string | null;
    scheduledDate: string | null;
    dueDate: string | null;
    doneDate: string | null;
    cancelledDate: string | null;
    recurrenceRule: string;
    onCompletion: string;
    dependsOn: string[];
    tags: string[];
    blockLink: string;
    originalMarkdown: string;
    path: string;
    lineNumber: number;
}

interface TaskCreationDestinationV1 {
    path: string;
    line?: number;
    placement?: 'before' | 'after' | 'replace' | 'append';
}

interface TasksApiV2 extends TasksApiV1 {
    queryTasks(query: string): TaskV1[];
    createTask(
        destination: TaskCreationDestinationV1,
        description: string,
        taskData?: Partial<TaskV1>,
    ): Promise<TaskV1>;
    editTask(taskId: string, taskData: Partial<TaskV1>): Promise<TaskV1>;
    ensureTaskHasUniqueId(task: TaskV1): TaskV1;
}
```

## `queryTasks(query: string): TaskV1[];`

Runs a Tasks query over the current task cache and returns matching tasks as `TaskV1` objects.
Invalid queries throw an error.
Query strings use the same syntax as Tasks code blocks.
See [[About Queries]], [[Filters]], [[Combining Filters]], and [[Regular Expressions]] for the full query language.

```javascript
const tasksApi = this.app.plugins.plugins['obsidian-tasks-plugin'].apiV2;
const dueSoon = tasksApi.queryTasks('not done\ndue before tomorrow');
```

Find open tasks in a project tag or work folder:

```javascript
const projectTasks = tasksApi.queryTasks('not done\n(description includes #project) OR (path includes Work/)');
```

Find high-priority tasks:

```javascript
const highPriorityTasks = tasksApi.queryTasks('priority is high');
```

Find tasks whose descriptions match a regular expression:

```javascript
const waitingTasks = tasksApi.queryTasks('description regex matches /waiting|blocked/i');
```

## `createTask(destination, description, taskData?): Promise<TaskV1>;`

Creates a task in an existing Markdown file and returns the created task as `TaskV1`.
`taskData` can override fields such as `status`, `priority`, dates, dependencies, `id`, and tags.

If `destination.line` is supplied, `placement` defaults to `after`.
If `placement` is `append`, the task is written at the end of the file.
If neither `line` nor `placement` is supplied, Tasks appends after the last existing task line in that file;
if the file has no task lines, Tasks appends at EOF.

If a global filter is configured and the description does not already include it,
Tasks prepends the global filter before writing the task.
The returned `TaskV1.description` omits the configured global filter; `originalMarkdown` contains the exact written line.

```javascript
const tasksApi = this.app.plugins.plugins['obsidian-tasks-plugin'].apiV2;
const task = await tasksApi.createTask(
    { path: 'Tasks.md', line: 4, placement: 'after' },
    'Book flights',
    { dueDate: '2026-08-01', priority: '1' },
);
```

## `editTask(taskId: string, taskData: Partial<TaskV1>): Promise<TaskV1>;`

Edits the task with the supplied ID and returns the edited task as `TaskV1`.
The task ID must be non-empty and must match exactly one task in the current Tasks cache.

```javascript
const tasksApi = this.app.plugins.plugins['obsidian-tasks-plugin'].apiV2;
const task = await tasksApi.editTask('abc123', {
    description: 'Book flights and hotel',
    dueDate: '2026-08-02',
});
```

## `ensureTaskHasUniqueId(task: TaskV1): TaskV1;`

Returns the same task object if it already has a non-empty ID.
Otherwise, returns a copy with a generated ID that does not collide with current task IDs.

```javascript
const tasksApi = this.app.plugins.plugins['obsidian-tasks-plugin'].apiV2;
const taskWithId = tasksApi.ensureTaskHasUniqueId(task);
```

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
- Ambiguity when `editTaskLineModal()` returns empty string:
  - `editTaskLineModal()` returns an empty string in both these situations:
        1. the user clicked Cancel
        2. the user completed a task like this, which uses  [[On Completion]]'s `delete` facility:
            - `- [ ] Delete me when done 🏁 delete`
  - Fixing this would require introducing `TasksApiV1` .
