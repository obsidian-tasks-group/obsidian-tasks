---
publish: true
---

# Sorting

<span class="related-pages">#feature/sorting</span>

<!-- NEW_QUERY_INSTRUCTION_EDIT_REQUIRED -->

## Contents

This page is long. Here are some links to the main sections:

- [[#Default sort order]]
- [[#Custom Sorting]]
- [[#Sort by Task Statuses]]
- [[#Sort by Task Dependencies]]
- [[#Sort by Dates in Tasks]]
- [[#Sort by Other Task Properties]]
- [[#Sort by File Properties]]
- [[#Multiple sort criteria]]
- [[#Notes]]
- [[#Reverse sorting]]
- [[#Examples]]

## Default sort order

The following instructions are the default sort order, and they are **automatically appended to the end of *every* Tasks search**:

<!-- snippet: Sort.test.Sort_save_default_sort_order.approved.text -->
```text
sort by status.type
sort by urgency
sort by due
sort by priority
sort by path
```
<!-- endSnippet -->

It first sorts tasks in the order `IN_PROGRESS`, `TODO`, `DONE`, `CANCELLED` then `NON_TASK` to ensure that actionable tasks appear first, which is important in searches without a filter like `not done`.

Then it sorts by [[Urgency]], which is a calculated score derived from several Task properties.

The above lines are *always* appended to the end of any `sort by` instructions supplied by the user. There is no way to disable this.

However, any `sort by` instructions in queries take precedence over these default ones.

> [!tip]
> To sort the results of a query differently from the default, you must add at least one `sort by` line to the query. The sort instructions you supply will take priority over the appended defaults.
>
> Adding `sort by` lines to the [[Global Query]] provides a way override to the default sort order for **all** searches (except those that [[Global Query#Ignoring the global query|ignore the global query]]).

## Custom Sorting

> [!released]
> `sort by function` was introduced in Tasks 6.0.0.

Tasks provides many built-in sorting options, but sometimes they don't quite do what is wanted by all users.

Now Tasks has a powerful mechanism for you to create your own **custom sort orders**, offering incredible flexibility.

There are many examples of the custom filtering instruction `sort by function` in the documentation below, with explanations, for when the instructions built in to Tasks do not satisfy your preferences.

You can find out more about this very powerful facility in [[Custom Sorting]].

## Sort by Task Statuses

For more information, including adding your own customised statuses, see [[Statuses]].

### Status

- `sort by status` (done or todo)

> [!Tip]
> `sort by status.type` gives a much more useful sort order than `sort by status`. See [[#Status Type]] below.

Since Tasks 6.0.0, **[[Custom Sorting|custom sorting]] by status** is now possible.

<!-- placeholder to force blank line before included text --><!-- include: CustomSortingExamples.test.other_properties_task.isDone_docs.approved.md -->

```javascript
sort by function !task.isDone
```

- `sort by function` sorts `true` before `false`
- Hence, we use `!` to negate `task.isDone`, so tasks with [[Status Types|Status Type]] `TODO` and `IN_PROGRESS` tasks are sorted **before** `DONE`, `CANCELLED` and `NON_TASK`.

<!-- placeholder to force blank line after included text --><!-- endInclude -->

### Status Name

- `sort by status.name` (Done, Todo, Cancelled, In Progress, Unknown, My very important custom status, etc - sorted alphabetically)

> [!released]
`sort by status.name` was introduced in Tasks 1.23.0.

Since Tasks 6.0.0, **[[Custom Sorting|custom sorting]] by status names** is now possible.

<!-- placeholder to force blank line before included text --><!-- include: CustomSortingExamples.test.statuses_task.status.name_docs.approved.md -->

```javascript
sort by function task.status.name
```

- Identical to "Sort by status.name".

<!-- placeholder to force blank line after included text --><!-- endInclude -->

### Status Type

- `sort by status.type` (Sorted in the order `IN_PROGRESS`, `TODO`, `DONE`, `CANCELLED` then `NON_TASK`)

> [!released]
`sort by status.type` was introduced in Tasks 1.23.0.

Since Tasks 6.0.0, **[[Custom Sorting|custom sorting]] by status types** is now possible.

<!-- placeholder to force blank line before included text --><!-- include: CustomSortingExamples.test.statuses_task.status.type_docs.approved.md -->

```javascript
sort by function task.status.type
```

- Unlike "Sort by status.type", this sorts the status types in alphabetical order.

<!-- placeholder to force blank line after included text --><!-- endInclude -->

### Status Symbol

There is no built-in instruction to sort by status symbols.

Since Tasks 6.0.0, **[[Custom Sorting|custom sorting]] by status symbol** is now possible.

<!-- placeholder to force blank line before included text --><!-- include: CustomSortingExamples.test.statuses_task.status.symbol_docs.approved.md -->

```javascript
sort by function task.status.symbol
```

- Sort by the status symbol.

<!-- placeholder to force blank line after included text --><!-- endInclude -->

### Next Status Symbol

There is no built-in instruction to sort by next status symbols.

Since Tasks 6.0.0, **[[Custom Sorting|custom sorting]] by next status symbol** is now possible.

<!-- placeholder to force blank line before included text --><!-- include: CustomSortingExamples.test.statuses_task.status.nextSymbol_docs.approved.md -->

```javascript
sort by function task.status.nextSymbol
```

- Sort by the next status symbol.

<!-- placeholder to force blank line after included text --><!-- endInclude -->

## Sort by Task Dependencies

At a high level, task dependencies define the order in which you want to work on a set of tasks. You can read more about them in [[Task Dependencies]].

> [!released]
> Task Dependencies were introduced in Tasks 6.1.0.

### Id

- `sort by id`

For more information, see [[Task Dependencies]].

> [!released]
>
> - Task Id was introduced in Tasks 6.1.0.

Since Tasks 6.1.0, **[[Custom Sorting|custom sorting]] by Id** is now possible, using `task.id`.

### Depends On

There is no built-in instruction to sort by 'Depends On'.

For more information, see [[Task Dependencies]].

> [!released]
>
> - Task Depends On was introduced in Tasks 6.1.0.

Since Tasks 6.1.0, **[[Custom Sorting|custom sorting]]  by Depends On** is now possible, using `task.dependsOn`.

## Sort by Dates in Tasks

### How dates are sorted

When sorting tasks by date, such as with `sort by due`, tasks are sorted in this order:

1. Tasks with **invalid** `due` dates come first
2. Tasks with valid `due` dates, **earliest** to **latest**
3. Tasks with **no due date** come last.

> [!NOTE]
> Prior to Tasks 6.0.0, tasks with invalid dates were sorted **after** the tasks with valid dates.

### Done Date

- `sort by done` (the date when the task was done)

Since Tasks 6.0.0, **[[Custom Sorting|custom sorting]] by done date** is now possible.

<!-- placeholder to force blank line before included text --><!-- include: CustomSortingExamples.test.dates_task.done_docs.approved.md -->

```javascript
sort by function task.done.format("dddd")
```

- Sort by done date's day of the week, alphabetically.

<!-- placeholder to force blank line after included text --><!-- endInclude -->

### Due Date

- `sort by due` (the date when the task is due)

Since Tasks 6.0.0, **[[Custom Sorting|custom sorting]] by due date** is now possible.

<!-- placeholder to force blank line before included text --><!-- include: CustomSortingExamples.test.dates_task.due_docs.approved.md -->

```javascript
sort by function task.due.format("dddd")
```

- Sort by due date's day of the week, alphabetically.

<!-- placeholder to force blank line after included text --><!-- endInclude -->

<!-- placeholder to force blank line before included text --><!-- include: CustomSortingExamples.test.dates_task.due.advanced_docs.approved.md -->

<!-- placeholder to force blank line after included text --><!-- endInclude -->

### Scheduled Date

- `sort by scheduled` (the date when the task is scheduled)

Since Tasks 6.0.0, **[[Custom Sorting|custom sorting]] by scheduled date** is now possible.

<!-- placeholder to force blank line before included text --><!-- include: CustomSortingExamples.test.dates_task.scheduled_docs.approved.md -->

```javascript
sort by function task.scheduled.format("dddd")
```

- Sort by scheduled date's day of the week, alphabetically.

<!-- placeholder to force blank line after included text --><!-- endInclude -->

### Start Date

- `sort by start` (the date when the task starts)

Since Tasks 6.0.0, **[[Custom Sorting|custom sorting]] by start date** is now possible.

<!-- placeholder to force blank line before included text --><!-- include: CustomSortingExamples.test.dates_task.start_docs.approved.md -->

```javascript
sort by function task.start.format("dddd")
```

- Sort by start date's day of the week, alphabetically.

<!-- placeholder to force blank line after included text --><!-- endInclude -->

### Created Date

- `sort by created` (the date when the task was created)

> [!released]
`sort by created` was introduced in Tasks 2.0.0.

Since Tasks 6.0.0, **[[Custom Sorting|custom sorting]] by created date** is now possible.

<!-- placeholder to force blank line before included text --><!-- include: CustomSortingExamples.test.dates_task.created_docs.approved.md -->

```javascript
sort by function task.created.format("dddd")
```

- Sort by created date's day of the week, alphabetically.

<!-- placeholder to force blank line after included text --><!-- endInclude -->

### Cancelled Date

- `sort by cancelled` (the date when the task was cancelled)

> [!released]
`sort by cancelled` was introduced in Tasks 5.5.0.

Since Tasks 6.0.0, **[[Custom Sorting|custom sorting]] by cancelled date** is now possible, using `task.cancelled`.

<!-- placeholder to force blank line before included text --><!-- include: CustomSortingExamples.test.dates_task.cancelled_docs.approved.md -->

```javascript
sort by function task.cancelled.format("dddd")
```

- Sort by cancelled date's day of the week, alphabetically.

<!-- placeholder to force blank line after included text --><!-- endInclude -->

### Happens

- `sort by happens` (the earliest of start date, scheduled date, and due date)

> [!released]
`sort by happens` was introduced in Tasks 1.21.0.

Since Tasks 6.0.0, **[[Custom Sorting|custom sorting]] by happens date** is now possible.

<!-- placeholder to force blank line before included text --><!-- include: CustomSortingExamples.test.dates_task.happens_docs.approved.md -->

```javascript
sort by function task.happens.format("dddd")
```

- Sort by happens date's day of the week, alphabetically.

<!-- placeholder to force blank line after included text --><!-- endInclude -->

## Sort by Other Task Properties

### Description

- `sort by description` (the description of the task)

Since Tasks 6.0.0, **[[Custom Sorting|custom sorting]] by description** is now possible.

<!-- placeholder to force blank line before included text --><!-- include: CustomSortingExamples.test.other_properties_task.description_docs.approved.md -->

```javascript
sort by function task.description.length
```

- Sort by length of description, shortest first.
- This might be useful for finding tasks that need more information, or could be made less verbose.

```javascript
sort by function \
    const priorities = [...'🟥🟧🟨🟩🟦'];  \
    for (let i = 0; i < priorities.length; i++) {  \
        if (task.description.includes(priorities[i])) return i;  \
    }  \
    return 999;
```

- A user has defined a custom system for their task descriptions, with coloured squares as a home-grown alternative priority system.
- This allows tasks to be sorted in the order of their coloured squares.
- The function returns 0 if the first square is found in the task description, 1 if the second square is found, and so on.
- And it returns `999` if none of the squares are found.
- It is important that we use a consistent value for all the tasks not containing any of the squares, to retain their original order, so that any later `sort by` instructions still work.

<!-- placeholder to force blank line after included text --><!-- endInclude -->

### Description without tags

Since Tasks 6.0.0, **[[Custom Sorting|custom sorting]] by description with tags removed** is now possible.

The value `task.descriptionWithoutTags` returns a copy of the description with all the tags removed, so that you can sort together any tasks whose descriptions differ only by their tags.

<!-- placeholder to force blank line before included text --><!-- include: CustomSortingExamples.test.other_properties_task.descriptionWithoutTags_docs.approved.md -->

```javascript
sort by function task.descriptionWithoutTags
```

- Like `Sort by description`, but it removes any tags from the sort key.
- This might be useful for sorting together completed recurrences of the same task, even if the tags differ in some recurrences.

<!-- placeholder to force blank line after included text --><!-- endInclude -->

### Priority

- `sort by priority` (priority of the task; "low" is below "none": [[Priority|priorities]])

Since Tasks 6.0.0, **[[Custom Sorting|custom sorting]] by priority name and number** is now possible.

<!-- placeholder to force blank line before included text --><!-- include: CustomSortingExamples.test.other_properties_task.priorityName_docs.approved.md -->

```javascript
sort by function task.priorityName
```

- Sort by the task's priority name.
- The priority names are displayed in alphabetical order.
- Note that the default priority is called 'Normal', as opposed to with `Sort by priority` which calls the default 'None'.

<!-- placeholder to force blank line after included text --><!-- endInclude -->

<!-- placeholder to force blank line before included text --><!-- include: CustomSortingExamples.test.other_properties_task.priorityNumber_docs.approved.md -->

```javascript
sort by function task.priorityNumber
```

- Sort by the task's priority number, where Highest is 0 and Lowest is 5.

<!-- placeholder to force blank line after included text --><!-- endInclude -->

### Urgency

- `sort by urgency` ([[Urgency|urgency]])

Since Tasks 6.0.0, **[[Custom Sorting|custom sorting]] by urgency** is now possible.

<!-- placeholder to force blank line before included text --><!-- include: CustomSortingExamples.test.other_properties_task.urgency_docs.approved.md -->

```javascript
sort by function reverse task.urgency
```

- Sort by task urgency values.
- We use `reverse` to put the most urgent tasks first.

<!-- placeholder to force blank line after included text --><!-- endInclude -->

### Recurrence

- `sort by recurring` (recurring tasks sort before non-recurring ones: [[Recurring Tasks]])

Since Tasks 6.0.0, **[[Custom Sorting|custom sorting]] by recurrence** is now possible.

<!-- placeholder to force blank line before included text --><!-- include: CustomSortingExamples.test.other_properties_task.isRecurring_docs.approved.md -->

```javascript
sort by function task.isRecurring
```

- Sort by whether the task is recurring: recurring tasks will be listed before non-recurring ones.

<!-- placeholder to force blank line after included text --><!-- endInclude -->

### Tags

See [[Tags]] for important information about how tags behave in the Tasks plugin.

- `sort by tag` (the description of the task)

If you want to sort by tags, by default it will sort by the first tag found in the description. If you want to sort by a tag that comes after that then you can specify the index at the end of the query. All tasks should have the same amount of tags for optimal sorting and the tags in the same order. The index starts from 1 which is also the default.

For example this query will sort by the second tag found in the description.

    ```tasks
    sort by tag 2
    ```

> [!released]
Tag sorting was introduced in Tasks 1.6.0.

Since Tasks 6.0.0, **[[Custom Sorting|custom sorting]] by tags** is now possible.

<!-- placeholder to force blank line before included text --><!-- include: CustomSortingExamples.test.other_properties_task.tags_docs.approved.md -->

```javascript
sort by function task.tags.filter( (tag) => tag.includes("#context/")).sort().join(",")
```

- Sort by tags that contain "#context/".
- Any tasks without that tag are sorted first.

```javascript
sort by function reverse task.tags.length
```

- Sort by the number of tags on the task.
- The `reverse` option puts tasks with the most tags first.

```javascript
sort by function -task.tags.length
```

- A different way of sorting by the number of tags on the task, still putting tasks with the most tags first.

<!-- placeholder to force blank line after included text --><!-- endInclude -->

<!-- placeholder to force blank line before included text --><!-- include: CustomSortingExamples.test.other_properties_task.tags.advanced_docs.approved.md -->

<!-- placeholder to force blank line after included text --><!-- endInclude -->

### Original Markdown

There is no built-in instruction to sort by the original markdown line.

Since Tasks 6.0.0, **[[Custom Sorting|custom sorting]] by original markdown line** is now possible.

For example, this could be used to extract information from `task.originalMarkdown` that Tasks does not parse, to use for sorting tasks.

<!-- placeholder to force blank line before included text --><!-- include: CustomSortingExamples.test.other_properties_task.originalMarkdown_docs.approved.md -->

```javascript
sort by function task.originalMarkdown
```

- Sort by the raw text of the task's original line in the MarkDown file.

<!-- placeholder to force blank line after included text --><!-- endInclude -->

## Sort by File Properties

### File Path

- `sort by path` (the path to the file that contains the task)

Since Tasks 6.0.0, **[[Custom Sorting|custom sorting]] by file path** is now possible.

<!-- placeholder to force blank line before included text --><!-- include: CustomSortingExamples.test.file_properties_task.file.path_docs.approved.md -->

```javascript
sort by function task.file.path
```

- Like 'Sort by path' but includes the file extension.

```javascript
sort by function task.file.pathWithoutExtension
```

- Like 'Sort by path'.

<!-- placeholder to force blank line after included text --><!-- endInclude -->

### Root

There is no built-in instruction to sort by the top-level folder that contains the task.

Since Tasks 6.0.0, **[[Custom Sorting|custom sorting]] by root folder** is now possible.

<!-- placeholder to force blank line before included text --><!-- include: CustomSortingExamples.test.file_properties_task.file.root_docs.approved.md -->

```javascript
sort by function task.file.root
```

- Enable sorting by the root folder.

<!-- placeholder to force blank line after included text --><!-- endInclude -->

### Folder

There is no built-in instruction to sort by the folder that contains the task.

Since Tasks 6.0.0, **[[Custom Sorting|custom sorting]] by folder** is now possible.

<!-- placeholder to force blank line before included text --><!-- include: CustomSortingExamples.test.file_properties_task.file.folder_docs.approved.md -->

```javascript
sort by function task.file.folder
```

- Enable sorting by the folder containing the task.

```javascript
sort by function task.file.path === query.file.path
```

- Sort tasks in the same file as the query before tasks in other files.
- **Note**: `true` sort keys sort before `false`.

<!-- placeholder to force blank line after included text --><!-- endInclude -->

### File Name

- `sort by filename` (the filename of the file that contains the task, with its extension)
  - Note that tasks from different notes with the same file name will be sorter.

> [!released]
`sort by filename` was introduced in Tasks 1.21.0.

Since Tasks 6.0.0, **[[Custom Sorting|custom sorting]] by file name** is now possible.

<!-- placeholder to force blank line before included text --><!-- include: CustomSortingExamples.test.file_properties_task.file.filename_docs.approved.md -->

```javascript
sort by function task.file.filename
```

- Like 'sort by filename' but includes the file extension.

```javascript
sort by function task.file.filenameWithoutExtension
```

- Like 'sort by filename'.

<!-- placeholder to force blank line after included text --><!-- endInclude -->

### Heading

- `sort by sort by heading` (the heading preceding the task; files with empty headings sort before other tasks)

> [!released]
`sort by heading` was introduced in Tasks 1.21.0.

Since Tasks 6.0.0, **[[Custom Sorting|custom sorting]] by heading** is now possible.

<!-- placeholder to force blank line before included text --><!-- include: CustomSortingExamples.test.file_properties_task.heading_docs.approved.md -->

```javascript
sort by function task.heading
```

- Like 'sort by heading'.
- Any tasks with no preceding heading have `task.heading` values of `null`, and these tasks sort before any tasks with headings.

<!-- placeholder to force blank line after included text --><!-- endInclude -->

## Multiple sort criteria

You can add multiple `sort by` query options, each on an extra line.
The first sort has the highest priority.
Each subsequent `sort` will sort within the existing sorting.

## Notes

> [!info]
> If you want tasks to be sorted the way they were sorted before urgency was introduced,
add the following `sort` expressions to your queries:

    ```tasks
    sort by status
    sort by due
    sort by path
    ```

---

> [!info]
> Sorting by description should take into account `[[Links]]` and `[Links with an|Alias]` (note pipe).
It should also take into account `*italics*` and `==highlights==`.
It sorts by the text that's visible in preview mode.

## Reverse sorting

After the name of the property that you want to sort by, you can add the `reverse` keyword.
If given, the sort order will be reverse for that property.

Note that `reverse` will reverse the entire result set.
For example, when you `sort by done reverse` and your query results contain tasks that do not have a done date, then those tasks without a done date will be listed first.

## Examples

    ```tasks
    not done
    due today
    sort by due
    ```

    ```tasks
    done
    sort by done reverse
    ```

    ```tasks
    not done
    due before next monday
    sort by status
    sort by description reverse
    sort by path
    ```
