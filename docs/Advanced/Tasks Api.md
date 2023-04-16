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
