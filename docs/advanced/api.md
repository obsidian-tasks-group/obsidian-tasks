---
layout: default
title: Tasks Api
nav_order: 6
parent: Advanced
has_toc: false
---

# Tasks API
{: .no_toc }

<details open markdown="block">
  <summary>
    Table of contents
  </summary>
  {: .text-delta }
1. TOC
{:toc}
</details>

---

## Tasks API Interface

{: .released }
The Tasks API Interface was introduced in Tasks 1.26.0.

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
     * If the optional Markdown string for a task is passed, the form will be
     * populated with that task's properties.
     *
     * @param taskLine - Optional Markdown string of the task to edit.
     *
     * @returns {Promise<string>} A promise that contains the Markdown string for the task or
     * an empty string, if data entry was cancelled.
     */
    createOrEditTaskLineModal(taskLine?: string): Promise<string>;
}
```

## `createOrEditTaskLineModal(): Promise<string>;`

{: .released }
This method was introduced in Tasks 1.26.0.

This method opens the Tasks [Create or edit task UI]({{ site.baseurl }}{% link getting-started/create-or-edit-task.md %})
and returns the Markdown for the task entered.

If the optional parameter `taskLine` is provided, it will be parsed and the [Create or edit task UI]({{ site.baseurl }}{% link getting-started/create-or-edit-task.md %})
is populated with the values of the parsed task.

If data entry is cancelled, an empty string is returned.

{: .warning }
> This function is returns a `Promise` - always `await` the result!

### Basic usage

```javascript
const tasksApi = this.app.plugins.plugins['obsidian-tasks-plugin'].apiV1;
const taskLine = await tasksApi.createOrEditTaskLineModal();

// Do whatever you want with the returned value.
// It's just a string containing the Markdown for the task.
console.log(taskLine);
```

### Editing an existing task

```javascript
const tasksApi = this.app.plugins.plugins['obsidian-tasks-plugin'].apiV1;
const existingTaskLine = '- [ ] some task 🛫 2023-03-22'

// this opens the UI populated with the values for the given taskLine
let taskLine = await tasksApi.createOrEditTaskLineModal(existingTaskLine);

// Do whatever you want with the returned value.
// It's just a string containing the Markdown for the task.
console.log(taskLine);
```

### Usage with QuickAdd
One of the most common usage scenarios is probably in combination with the [QuickAdd](https://github.com/chhoumann/quickadd) plugin
to automatically add tasks to a specific file.

For this you need to enter the following code as the Capture format:

<!-- markdownlint-disable code-fence-style -->
~~~markdown
```js quickadd
return await this.app.plugins.plugins['obsidian-tasks-plugin'].apiV1.createOrEditTaskLineModal();
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
