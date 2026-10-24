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

    /**
     * Executes a Tasks query against the vault's tasks cache synchronously.
     *
     * Evaluates `querySource` against cached tasks, honouring user settings (Global Query,
     * Global Filter, and Presets).
     *
     * When the query produces groups, tasks are returned in group-major order (matching
     * rendered results) and deduplicated.
     *
     * @param querySource The Tasks query string (e.g. "not done\ndue before tomorrow").
     * @param queryPath Optional vault path of the file containing the query, used to resolve Placeholders (e.g. {{query.file.folder}}) and file properties.
     * @returns Array of unique matching tasks as frozen ReadOnlyTask objects.
     * @throws Error if `querySource` is not a string, if `queryPath` is not a string (when provided), if the query syntax is invalid, or if placeholders cannot be resolved.
     */
    queryTasks: (querySource: string, queryPath?: string) => ReadOnlyTask[];
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

## `queryTasks: (querySource: string, queryPath?: string) => Array<ReadOnlyTask>;`

> [!released]
> This method was introduced in Tasks X.Y.Z.

Executes a Tasks query against the vault's in-memory tasks cache synchronously and returns an array of frozen, immutable `ReadOnlyTask` objects.

```typescript
const tasksApi = this.app.plugins.plugins['obsidian-tasks-plugin'].apiV1;

// Execute a synchronous query against all cached vault tasks
const tasks = tasksApi.queryTasks('not done\ndue today');

for (const task of tasks) {
    console.log(task.description, task.due.formatAsDate());
}
```

### Parameters

- `querySource` (`string`): The Tasks query instructions (identical to what you write inside a ````tasks```` code block), such as `"not done\ndue before tomorrow"`. Comments, empty lines, line continuations, sorting, grouping, and limits are all supported.
- `queryPath` (`string`, optional): The vault path of the file containing or executing the query (for example, `dv.current().file.path` in DataviewJS or `tp.file.path(true)` in Templater). When provided, it enables resolving:
  - File placeholders such as `{{query.file.path}}`, `{{query.file.folder}}`, and `{{query.file.root}}`.
  - Custom function expressions accessing `query.file` or note frontmatter properties (e.g. `query.file.property('status')`).
  The path is passed as-is to match query rendering in markdown code blocks.

### Return Value

Returns an array of frozen `ReadOnlyTask` objects representing the matching tasks in group-major order. Each object provides read-only properties for all task fields (such as `description`, `status`, `due`, `tags`, `originalMarkdown`, `dependsOn`, etc.) and cannot be mutated.

### The `ReadOnlyTask` Object

`queryTasks` returns an array of `ReadOnlyTask` objects. These are **frozen snapshots** of tasks at the time the query runs. They are immutable (`Object.isFrozen(task) === true`) and are not live views — subsequent edits in files or in Tasks are not reflected in previously returned objects.

#### Key Properties

| Property | Type | Description |
| :--- | :--- | :--- |
| `description` | `string` | The task description, including inline tags. |
| `originalMarkdown` | `string` | The raw markdown task line as read from the note. |
| `status` | `ReadOnlyTaskStatus` | Task status object: `status.symbol`, `status.name`, `status.type` (`'TODO'`, `'DONE'`, `'IN_PROGRESS'`, `'CANCELLED'`, `'NON_TASK'`), and `status.nextStatusSymbol`. |
| `path` | `string` | Vault file path of the containing note. |
| `lineNumber` | `number` | Zero-based line number in the note. |
| `sectionStart` | `number` | Line number where the enclosing section begins. |
| `sectionIndex` | `number` | Index of the task within its section. |
| `precedingHeader` | `string \| null` | Nearest preceding heading text in the file. |
| `priority` | `Priority` | Task priority (`'Highest'`, `'High'`, `'Medium'`, `'None'`, `'Low'`, `'Lowest'`). |
| `tags` | `readonly string[]` | List of tags on the task (e.g. `['#project', '#work']`). |
| `id` | `string` | Task identifier (e.g. `dcf64c` from `🆔 dcf64c`), or empty string. |
| `dependsOn` | `readonly string[]` | Array of dependency task IDs (e.g. from `⛔️ dcf64c`). |
| `recurrenceRule` | `string` | Recurrence rule text (e.g. `'every week'`), or empty string. |
| `created` | `TasksDate` | Creation date (`➕ YYYY-MM-DD`). |
| `start` | `TasksDate` | Start date (`🛫 YYYY-MM-DD`). |
| `scheduled` | `TasksDate` | Scheduled date (`⏳ YYYY-MM-DD`). |
| `due` | `TasksDate` | Due date (`📅 YYYY-MM-DD`). |
| `done` | `TasksDate` | Completion date (`✅ YYYY-MM-DD`). |
| `cancelled` | `TasksDate` | Cancellation date (`❌ YYYY-MM-DD`). |

#### Working with Task Dates

Date properties on `ReadOnlyTask` are `TasksDate` objects (never raw strings or `undefined`). A `TasksDate` provides helper methods for formatting and accessing dates safely:

```typescript
// Format as YYYY-MM-DD (or '' if no date is set)
console.log(task.due.formatAsDate()); // e.g. "2026-10-24" or ""

// Format with custom fallback text
console.log(task.due.formatAsDate('no due date'));

// Format with a custom moment format string
console.log(task.due.format('ddd, MMM D, YYYY', 'N/A')); // e.g. "Sat, Oct 24, 2026"

// Access the underlying Moment instance (or null)
const momentDate = task.due.moment;
if (momentDate && momentDate.isBefore(window.moment())) {
    console.log('Task is overdue!');
}
```

### Code Examples

#### DataviewJS Example

Use `queryTasks` within a `dataviewjs` code block to fetch and display tasks matching a query:

````markdown
```dataviewjs
const tasksApi = app.plugins.plugins['obsidian-tasks-plugin']?.apiV1;
if (!tasksApi) {
    dv.paragraph("Tasks plugin API is not available.");
    return;
}

// Pass dv.current().file.path as queryPath to support file placeholders and properties
const currentPath = dv.current().file.path;
const tasks = tasksApi.queryTasks(`
    not done
    path includes {{query.file.folder}}
    sort by due
    limit 10
`, currentPath);

dv.header(3, `Tasks in folder (${tasks.length})`);
dv.taskList(
    tasks.map(t => ({
        text: `${t.description} (due: ${t.due.formatAsDate('none')})`,
        completed: t.status.type === 'DONE'
    })),
    false
);
```
````

#### Templater Example

Use `queryTasks` in a Templater template to dynamically insert unfinished high-priority tasks when generating a daily note:

````markdown
<%*
const tasksApi = app.plugins.plugins['obsidian-tasks-plugin']?.apiV1;
if (tasksApi) {
    const urgentTasks = tasksApi.queryTasks(`
        not done
        priority is high
        due before tomorrow
    `);

    tR += "### Today's Top Tasks\n\n";
    if (urgentTasks.length === 0) {
        tR += "_No high priority tasks for today._\n";
    } else {
        for (const task of urgentTasks) {
            tR += `${task.originalMarkdown}\n`;
        }
    }
}
%>
````

### Important Caveats & Behavior

> [!warning] Synchronous In-Memory Execution & Cold Cache
> `queryTasks` runs synchronously against the in-memory tasks index maintained by the Tasks plugin. If called immediately upon Obsidian startup or before the plugin has finished scanning the vault (a cold cache), it may return an empty array `[]`.

> [!info] Global Filter Pre-Filtering
> Tasks in the plugin cache have already been filtered by the [[Global Filter]] (if configured in Tasks settings). Any task that does not contain the Global Filter is never indexed by Tasks and will not be returned by `queryTasks`.

> [!info] Group-Major Ordering & Limit Groups Behavior
>
> - **Group-Major Ordering**: When the query produces groups (via `group by` or column layout), the returned array follows group-major order — tasks appear in the order of the rendered groups, sorted within each group, and deduplicated at the first group where each task appears.
> - **`limit groups to N tasks`**: This instruction caps tasks *per group* rather than total groups across the query. As a result, the returned array may contain up to $N \times (\text{number of groups})$ tasks minus any duplicates.

> [!info] Placeholders and `queryPath` Resolution
> If your query contains file placeholders (such as `{{query.file.folder}}`) or accesses `query.file.*` in script filters, you must supply `queryPath`. If the user has configured a [[Global Query]] that contains file placeholders, calling `queryTasks` without `queryPath` will also throw an error because the global query requires file context to resolve. Passing `queryPath` resolves the file against the vault matching how markdown code blocks are rendered.

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

## Support

Before creating a new bug report or feature request about Tasks Api, please check existing items to avoid duplicates.

You do not need to search manually: the links below are already filtered to the label `"scope: for plugin developers"`.

- Check both Open and Closed items.
- If you find an existing item, support it there instead of adding a `+1` comment. See [[About Support and Help#How to support an existing request|How to support an existing request]].

| Type | Open | Closed | Notes |
| --- | --- | --- | --- |
| Issues | [Open](https://github.com/obsidian-tasks-group/obsidian-tasks/issues?q=is%3Aopen%20label%3A%22scope%3A+for+plugin+developers%22%20is%3Aissue%20) | [Closed](https://github.com/obsidian-tasks-group/obsidian-tasks/issues?q=is%3Aclosed%20label%3A%22scope%3A+for+plugin+developers%22%20is%3Aissue%20) | bug reports and feature requests |
| Discussions | [Open](https://github.com/obsidian-tasks-group/obsidian-tasks/discussions/categories/ideas-any-new-feature-requests-go-in-issues-please?discussions_q=is%3Aopen+label%3A%22scope%3A+for+plugin+developers%22+category%3A%22Ideas%3A+Any+New+Feature+Requests+go+in+Issues+please%22+sort%3Atop) | [Closed](https://github.com/obsidian-tasks-group/obsidian-tasks/discussions/categories/ideas-any-new-feature-requests-go-in-issues-please?discussions_q=is%3Aclosed+label%3A%22scope%3A+for+plugin+developers%22+category%3A%22Ideas%3A+Any+New+Feature+Requests+go+in+Issues+please%22+sort%3Atop) | older feature discussions from before late 2022 |

If you do not find an existing item in Issues or Discussions, see [[About Support and Help]] for how to report a bug or request a feature.
