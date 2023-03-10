---
layout: default
title: Tasks Api
nav_order: 6
parent: Advanced
has_toc: false
---

# Tasks API

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
This method opens the Tasks UI and returns the Markdown for the task entered.
If data entry is cancelled, an empty string is returned.

### Basic usage

```javascript
const tasksApi = this.app.plugins.plugins['obsidian-tasks-plugin'].apiV1;
let taskLine = await tasksApi.createTaskLineModal();

// Do whatever you want with the returned value.
// It's just a string containing the Markdown for the task.
console.log(taskLine);
```

{: .warning }
> This function is returns a `Promise` - always `await` the result!

### Usage with QuickAdd
One of the most common usage scenarios is probable in combination with the [QuickAdd](https://github.com/chhoumann/quickadd) plugin
to automatically add tasks to a specific file.

For this you need to enter the following code as capture format:

<!-- markdownlint-disable code-fence-style -->
~~~markdown
```js quickadd
return await this.app.plugins.plugins['obsidian-tasks-plugin'].apiV1.createTaskLineModal();
```
~~~
<!-- markdownlint-enable code-fence-style -->

For details refer to [QuickAdd - Inline scripts](https://quickadd.obsidian.guide/docs/InlineScripts).

Screenshot of QuickAdd capture settings (example)
![Screenshot - QuickAdd capture example](../../images/api-create-taskline-modal-quickadd-capture-example.png)
