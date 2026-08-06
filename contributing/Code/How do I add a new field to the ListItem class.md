# How do I add a new field to the ListItem class?

## Storing the field and testing it

### Store the field

- [ ] Add the field to [src/Task/ListItem.ts](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/src/Task/ListItem.ts)
- [ ] Review all the existing tests in [tests/Task/ListItem.test.ts](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/tests/Task/ListItem.test.ts), to ensure that the new field is as thoroughly tested as the existing fields.

### Detect edits to field value

- In [tests/Task/ListItem.test.ts](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/tests/Task/ListItem.test.ts):
  - [ ] Add and commit a new `it.failing()` block to the `'identicalTo'` section.
  - Here is an existing example: ['should recognise different indentation'](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/eed0af04892c30bea42b877520b64267b3a559c6/tests/Task/ListItem.test.ts#L280-L285).
- In [src/Task/ListItem.ts](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/src/Task/ListItem.ts), update `ListItem.identicalTo()`:
  - [ ] Once you have committed a failing test in [tests/Task/ListItem.test.ts](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/tests/Task/ListItem.test.ts), implement the check for changed value of your new field in `ListItem.identicalTo()` and remove the `.failing` before committing.
  - This important method is used to detect whether any edits of any kind have been made to a task, to detect whether search results need to be updated.
  - Here is the code for the method as of 2026-08-06:
    - [ListItem.identicalTo() in eed0af04892c30bea42b877520b64267b3a559c6](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/eed0af04892c30bea42b877520b64267b3a559c6/src/Task/ListItem.ts#L140-L166)

### Updating testing mechanisms

> [!NOTE]
> We do not yet have a `ListItemBuilder` class, so new `ListItem` fields are added to `TaskBuilder`.

- In [tests/TestingTools/TaskBuilder.ts](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/tests/TestingTools/TaskBuilder.ts):
  - [ ] Add the new field and a corresponding method.
  - Try to keep the same field order as in the `ListItem` class.
  - [ ] Update the `build()` method.
- In [tests/TestingTools/TaskBuilder.test.ts](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/tests/TestingTools/TaskBuilder.test.ts):
  - [ ] If the code in TaskBuilder will be non-trivial, first add and commit a failing test for it, marked as `it.failing(...)`
