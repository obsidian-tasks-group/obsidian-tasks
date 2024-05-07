# How do I add a new field to the Task class?

## Dividing up the work

The many steps below can be split over several PRs, to make work - and code review - manageable.

> [!Tip]
> Search for `NEW_TASK_FIELD_EDIT_REQUIRED` through the code to find locations that are likely to need edits.

## Releasing a partial implementation

For example, It's fine to have a first release of a feature without `sort by` and `group by`. In this case, add a feature request issue for the missing capabilities, and note in the documentation, for example:

"Sorting and grouping by blah is not yet supported. We are tracking this in [issue #nnnn](https://github.com/obsidian-tasks-group/obsidian-tasks/issues/nnn)."

## Storing the field and testing it

### Store the field

- [ ] Add the field to [src/Task/Task.ts](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/src/Task/Task.ts)

### Read and write the field

- [ ] Update all supported formats in [src/TaskSerializer/](https://github.com/obsidian-tasks-group/obsidian-tasks/tree/main/src/TaskSerializer)

### Detect edits to field value

- In [tests/Task/Task.test.ts](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/tests/Task/Task.test.ts):
  - [ ] Add a new failing block to the `'identicalTo'` section.
  - Here is an existing example: ['should check path'](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/5b0831c36a80c4cde2d64a6cd281bb4b51e9a142/tests/Task.test.ts#L834-L840).
- In [src/Task/Task.ts](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/src/Task/Task.ts), update `Task.identicalTo()`:
  - [ ] Once you have a failing test in [tests/Task/Task.test.ts](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/tests/Task/Task.test.ts), implement the check for changed value of your new field in `Task.identicalTo()`.
  - This important method is used to detect whether any edits of any kind have been made to a task, to detect whether task block results need to be updated.
  - Here is the code for the method as of 2022-11-12:
    - [Task.identicalTo() in 5b0831c36a80c4cde2d64a6cd281bb4b51e9a142](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/5b0831c36a80c4cde2d64a6cd281bb4b51e9a142/src/Task.ts#L732-L802)

### Updating testing mechanisms

- [ ] Review the files in [tests/CustomMatchers](https://github.com/obsidian-tasks-group/obsidian-tasks/tree/main/tests/CustomMatchers/) and update any that list fields to test
- In [tests/TestingTools/TaskBuilder.ts](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/tests/TestingTools/TaskBuilder.ts):
  - [ ] Add the new field and a corresponding method.
  - Keep the same field order as in the `Task` class.
  - [ ] Update the `build()` method.
- In [tests/TestingTools/TaskBuilder.test.ts](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/tests/TestingTools/TaskBuilder.test.ts):
  - [ ] If the code in TaskBuild will be non-trivial, first add a failing test for it.

## Other code areas

In rough order of priority:

Necessary for a first release

- [ ] Add the field to Create or edit Task dialog
- [ ] Add to layout - show/hide
- Add to CSS
- [ ] Add filter(s) - see [[How do I add a new task filter]]

Can be added in later releases

- [ ] Add to sorting
  - May have been done for free when adding the new `Field` class for the filter
- [ ] Add to grouping
  - May have been done for free when adding the new `Field` class for the filter
- [ ] Add the field to Auto Suggest, if appropriate

## Extra steps for fields storing dates

- [ ] Add to [recurrence](https://publish.obsidian.md/tasks/Getting+Started/Recurring+Tasks), if appropriate
- Documentation
  - [ ] Update `dates.md`
- Handling invalid dates
  - [ ] Add the new field to all sections of [resources/sample_vaults/Tasks-Demo/Manual Testing/Invalid Dates.md](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/resources/sample_vaults/Tasks-Demo/Manual%20Testing/Invalid%20Dates.md)
  - [ ] Update the query in the 'invalid dates' section of [docs/Queries/Filters.md](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/docs/Queries/Filters.md)
