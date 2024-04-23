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

```typescript
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
     * Toggles and updates a task line according to a user's preferences, accounting for recurrance
     * rules and completed status.
     *
     * @param line The markdown string of the task line being toggled
     * @param path The path to the file containing line
     * @returns An {@link EditorInsertion} containing the information necessary to replace the toggled line
     */
    toggleLine: (line: string, path: string) => EditorInsertion;

    /**
     * Retrieves the Tasks Emoji Format task serializer
     * @returns {DefaultTaskSerializer}
     */
    getDefaultTaskSerializer: () => DefaultTaskSerializer;

    /**
     * Retrieves the Dataview Format task serializer
     * @returns {DataviewTaskSerializer}
     */
    getDataviewTaskSerializer: () => DataviewTaskSerializer;
}
```

## `createTaskLineModal(): Promise<string>;`

> [!released]
This method was introduced in Tasks 2.0.0.

This method opens the Tasks [[Create or edit Task|Create or edit task UI]] and returns the Markdown for the task entered.
If data entry is cancelled, an empty string is returned.

### Basic usage

```javascript
const tasksApi = this.app.plugins.plugins['obsidian-tasks-plugin'].apiV1;
let taskLine = await tasksApi.createTaskLineModal();

// Do whatever you want with the returned value.
// It's just a string containing the Markdown for the task.
console.log(taskLine);
```

> [!warning]
> This function is returns a `Promise` - always `await` the result!

### Usage with QuickAdd
One of the most common usage scenarios is probably in combination with the [QuickAdd](https://github.com/chhoumann/quickadd) plugin
to automatically add tasks to a specific file.

For this you need to enter the following code as the Capture format:

<!-- markdownlint-disable code-fence-style -->
~~~markdown
```js quickadd
return await this.app.plugins.plugins['obsidian-tasks-plugin'].apiV1.createTaskLineModal();
```
~~~
<!-- markdownlint-enable code-fence-style -->

Or if you would like a newline character to be added after your new task line, use this as the Capture format instead:

<!-- markdownlint-disable code-fence-style -->
~~~markdown
```js quickadd
return await this.app.plugins.plugins['obsidian-tasks-plugin'].apiV1.createTaskLineModal() + '\n';
```
~~~
<!-- markdownlint-enable code-fence-style -->

For details refer to [QuickAdd - Inline scripts](https://quickadd.obsidian.guide/docs/InlineScripts).

#### Create the QuickAdd Capture

Use these steps to make the following options appear (tested in QuickAdd 0.12.0):

![Screenshot - Create the QuickAdd Capture](../../images/quickadd-settings-create-capture.png)

1. Open the QuickAdd options.
2. Type the name `Add task` in the `Name` box.
3. Click on the `Template` button and select `Capture`.
4. Click `Add Choice`.

#### Configure the QuickAdd Capture

![Screenshot - Open the QuickAdd Capture Configuration](../../images/quickadd-settings-configure-capture.png)

1. In the new row that was added, click on the cog (⚙) icon.
2. Now fill in the values below. (See above for the code to enter in to the `Capture format` box.)

Screenshot of QuickAdd capture settings (example)
![Screenshot - Edit the QuickAdd Capture Configuration](../../images/api-create-taskline-modal-quickadd-capture-example.png)

## Auto-Suggest Integration

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

## `toggleLine: (line: string, path: string) => EditorInsertion;`

> [!released]
This method was introduced in Tasks 7.0.1.

This method toggles and updates a task line according to a user's preferences, accounting for recurrance rules and completed status. It returns an object containing the text to be used to replace the input line, and the recommended position to move the cursor to.

```typescript
const tasksApi = this.app.plugins.plugins['obsidian-tasks-plugin'].apiV1;
const sourceFile: TFile = file;
const taskLine = '- [ ] This is a task 📅 2024-04-24';

const result = tasksApi.toggleLine(taskLine, sourceFile.path);

console.log(result);
/*
{
    "text": "- [x] This is a task 📅 2024-04-24 ✅ 2024-04-23",
    "moveTo": {
        "line": 0
    }
}
*/
```

## `getDefaultTaskSerializer: () => DefaultTaskSerializer;`

> [!released]
This method was introduced in Tasks 7.0.1.

This method retrieves the Tasks Emoji Format task serializer used to serialize and deserialize emoji formatted tasks.

Task serializers adhere to the TaskSerializer interface.

```typescript
/**
 * An abstraction that manages how a {@link Task} is read from and written
 * to a file.
 *
 * A {@link TaskSerializer} is only responsible for the single line of text that follows
 * after the checkbox:
 *
 *        - [ ] This is a task description
 *              ~~~~~~~~~~~~~~~~~~~~~~~~~~
 *
 * {@link TaskSerializer} is not responsible for:
 *
 *        - Retrieving and setting a fallback scheduled date (done in {@link Task.fromLine})
 *
 * @exports
 * @interface TaskSerializer
 */
export interface TaskSerializer {
    /**
     * Parses task details from the string representation of a task
     *
     * @param line The single line of text to parse
     * @returns {TaskDetails} Details parsed from {@link line}
     */
    deserialize(line: string): TaskDetails;

    /**
     * Creates the string representation of a {@link Task}
     *
     * @param task The {@link Task} to stringify
     * @returns {string}
     */
    serialize(task: Task): string;
}
```

`TaskDetails` includes these fields from the `Task` class.

```typescript
'description'
| 'priority'
| 'startDate'
| 'createdDate'
| 'scheduledDate'
| 'dueDate'
| 'doneDate'
| 'cancelledDate'
| 'recurrence'
| 'dependsOn'
| 'id'
| 'tags'
```

```typescript
const tasksApi = this.app.plugins.plugins['obsidian-tasks-plugin'].apiV1;
const defaultSerializer = tasksApi.getDefaultTaskSerializer();
const taskStr = 'This is a task 📅 2024-04-24 ✅ 2024-04-23';

console.log(defaultSerializer.deserialize(taskStr));
/*

{
    "description": "This is a task",
    "priority": "3",
    "startDate": null,
    "createdDate": null,
    "scheduledDate": null,
    "dueDate": moment("2024-04-24T07:00:00.000Z"),
    "doneDate": moment("2024-04-23T07:00:00.000Z"),
    "cancelledDate": null,
    "recurrence": null,
    "id": "",
    "dependsOn": [],
    "tags": []
}

*/
```

## `getDataviewTaskSerializer: () => DataviewTaskSerializer;`

> [!released]
This method was introduced in Tasks 7.0.1.

This method retrieves the Dataview task serializer that can be used to serialize and deserialize dataview formatted tasks.

```typescript
const tasksApi = this.app.plugins.plugins['obsidian-tasks-plugin'].apiV1;
const dataviewSerializer = tasksApi.getDataviewTaskSerializer();
const taskStr = 'This is a task  [due:: 2024-04-24]  [completion:: 2024-04-23]';

console.log(dataviewSerializer.deserialize(taskStr));
/*

{
    "description": "This is a task",
    "priority": "3",
    "startDate": null,
    "createdDate": null,
    "scheduledDate": null,
    "dueDate": moment("2024-04-24T07:00:00.000Z"),
    "doneDate": moment("2024-04-23T07:00:00.000Z"),
    "cancelledDate": null,
    "recurrence": null,
    "id": "",
    "dependsOn": [],
    "tags": []
}

*/
```
