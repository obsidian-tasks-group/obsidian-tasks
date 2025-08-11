---
publish: true
aliases:
    - Advanced/Quickadd
---

# QuickAdd

<span class="related-pages">#plugin/quickadd</span>

## Launching the Create task modal via QuickAdd

This section shows how to use QuickAdd with the [[Create or edit Task]] modal to automatically add tasks to a specific file.

For this you need to enter the following code as the Capture format:

````markdown
```js quickadd
return await this.app.plugins.plugins['obsidian-tasks-plugin'].apiV1.createTaskLineModal();
```
````

Or if you would like a newline character to be added after your new task line, use this as the Capture format instead:

````markdown
```js quickadd
return (await this.app.plugins.plugins['obsidian-tasks-plugin'].apiV1.createTaskLineModal()) + '\n';
```
````

For details refer to [QuickAdd - Inline scripts](https://quickadd.obsidian.guide/docs/InlineScripts).

### Create the QuickAdd Capture

Use these steps to make the following options appear (tested in QuickAdd 0.12.0):

![Screenshot - Create the QuickAdd Capture](../../images/quickadd-settings-create-capture.png)

1. Open the QuickAdd options.
2. Type the name `Add task` in the `Name` box.
3. Click on the `Template` button and select `Capture`.
4. Click `Add Choice`.

### Configure the QuickAdd Capture

![Screenshot - Open the QuickAdd Capture Configuration](../../images/quickadd-settings-configure-capture.png)

1. In the new row that was added, click on the cog (⚙) icon.
2. Now fill in the values below. (See above for the code to enter in to the `Capture format` box.)

Screenshot of QuickAdd capture settings (example)
![Screenshot - Edit the QuickAdd Capture Configuration](../../images/api-create-taskline-modal-quickadd-capture-example.png)

## Creating your own shortcut to build a task

The [QuickAdd](https://github.com/chhoumann/quickadd) plugin can help when creating tasks.
Additional to the official command to create a task, you can set up a QuickAdd command with a custom capture format.

For example:

```markdown
#task {{VALUE:task name}} ⏰ {{VDATE:reminder date and time,YYYY-MM-DD HH:mm}} {{VALUE:⏫,🔼,🔽, }} 🔁 {{VALUE:recurrence}} 🛫 {{VDATE:start date,YYYY-MM-DD}} ⏳ {{VDATE:scheduled date,YYYY-MM-DD}} 📅 {{VDATE:due date,YYYY-MM-DD}}
```

You can remove/leave some fields to make different types of tasks. And each one can have its own command.

### Some Examples

Task with due date only:

`#task {{VALUE:task name}} 📅 {{VDATE:due date,YYYY-MM-DD}}`

<video controls width="100%">
    <source src="https://user-images.githubusercontent.com/38974541/143467768-cf183171-296c-4229-81ca-a8f820b7a66e.mov" />
</video>

---

Task with priority and reminder date and due date:

`#task {{VALUE:task name}} ⏰ {{VDATE:reminder date and time,YYYY-MM-DD HH:mm}} {{VALUE:🔺,⏫,🔼,🔽,⏬️, }} 📅 {{VDATE:due date,YYYY-MM-DD}}`

<video controls width="100%">
    <source src="https://user-images.githubusercontent.com/38974541/143468599-ae598f7d-cc84-4fc9-8293-eae72cf81f8a.mov" />
</video>

---

Task with recurrence and scheduled date and start date:

`#task {{VALUE:task name}} 🔁 {{VALUE:recurrence}} 🛫 {{VDATE:start date,YYYY-MM-DD}} ⏳ {{VDATE:scheduled date,YYYY-MM-DD}}`

<video controls width="100%">
    <source src="https://user-images.githubusercontent.com/38974541/143468440-c83b5f91-c923-4f30-9c52-7c69e64978c9.mov" />
</video>

## How to add QuickAdd command

1. Install [Natural Language Dates](https://github.com/argenos/nldates-obsidian) and [QuickAdd](https://github.com/chhoumann/quickadd)
2. Choose the `capture` choice, then make it visible on the command palette by clicking on the flash emoji
3. Enable the `save as task` option, then enable the `capture format` option and paste your custom format
4. Assign a Hotkey to your new command through the standard Settings -> Hotkeys interface (your new command will appear as `QuickAdd: "name you gave your capture"`)

## Tip for repeated dates (to reduce friction)

If you notice that you are adding the same date multiple times, say for example the due date and the [[Advanced/Notifications|reminder date]] are the same.
Then you can give them the same name, this way you'll write the date only once and QuickAdd will insert it in multiple places.

Here is the format for the current example:

```markdown
#task {{VALUE:task name}} ⏰ {{VDATE:same date,YYYY-MM-DD}} {{VDATE:time,HH:mm}} 📅 {{VDATE:same date,YYYY-MM-DD}}
```
