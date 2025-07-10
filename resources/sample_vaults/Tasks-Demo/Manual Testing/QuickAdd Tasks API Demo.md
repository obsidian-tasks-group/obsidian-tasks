# QuickAdd Tasks API Demo

This vault has a command `QuickAdd: Add task`, which is based upon the settings in the Tasks user guide: [Usage with QuickAdd](https://publish.obsidian.md/tasks/Advanced/Tasks+Api#Usage+with+QuickAdd).

It's modified to:

- Add a newline at the end of the new task.
- Enable running the action via this command.
- The command is pinned in the Command Palette.

## New Tasks

- [ ] #task Test task added via the API!

# Smoke Testing the Edit Task API

You can quickly verify that the `editTaskLineModal()` API works as expected using the Obsidian developer console.

You can test the API directly in the Obsidian console

1. Open the developer console in Obsidian (Cmd+Opt+I on Mac).
2. Get access to the Tasks API by typing `this.app.plugins.plugins['obsidian-tasks-plugin'].apiV1` in the console.
3. Use the `editTaskLineModal()` method to open the edit task modal with a sample task text.

## Edit Tasks

Edit Task Command:

```js
const tasksApi = this.app.plugins.plugins['obsidian-tasks-plugin'].apiV1;
let editedTaskLine = await tasksApi.editTaskLineModal('- [ ] #task Do every day 🔼 🔁 every day ➕ 2025-07-06 ⏳ 2025-07-06');
console.log(editedTaskLine);
```

- [ ] #task Test Populated Values in Modal

 1. Open modal with the sample task text above.
 2. Verify that the task properties are populated in the modal.
 3. Mark Task Done
 4. Expected

> - [ ] #task Do every day 🔼 🔁 every day ⏳ 2025-07-07
> - [x] #task Do every day 🔼 🔁 every day ➕ 2025-07-06 ⏳ 2025-07-06 ✅ 2025-07-06

- [ ] #task Reverse the order of Recurring tasks in the Tasks settings

 1. Reverse the order of Recurring tasks in the Tasks settings
 2. Open modal with the sample task text above.
 3. Change the Status to Done
 4. Expected

> - [x] #task Do every day 🔼 🔁 every day ➕ 2025-07-06 ⏳ 2025-07-06 ✅ 2025-07-06
> - [ ] #task Do every day 🔼 🔁 every day ⏳ 2025-07-07
