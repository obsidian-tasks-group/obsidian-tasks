---
publish: true
---

# Task Properties

<span class="related-pages">#feature/scripting</span>

> [!released]
> Task Properties were introduced in Tasks 4.0.0.

## Introduction

In a growing number of locations, Tasks allows programmatic/scripting access to values in your Tasks:

- [[Grouping#Custom Groups]]
- [[Sorting#Custom Sorting]]
- [[Filters#Custom Filters]]

This page documents all the available pieces of information in Tasks that you can access.

<!-- NEW_TASK_FIELD_EDIT_REQUIRED - Add a note in the relevant bullet list, to record when the new field was added. (No need to add a new table row manually here.) -->

## Values for Task Statuses

For more information, including adding your own customised statuses, see [[Statuses]].

<!-- placeholder to force blank line before included text --><!-- include: TaskProperties.test.task_status.approved.md -->

| Field | Type 1 | Example 1 | Type 2 | Example 2 |
| ----- | ----- | ----- | ----- | ----- |
| `task.isDone` | `boolean` | `false` | `boolean` | `false` |
| `task.status.name` | `string` | `'Todo'` | `string` | `'In Progress'` |
| `task.status.type` | `string` | `'TODO'` | `string` | `'IN_PROGRESS'` |
| `task.status.typeGroupText` | `string` | `'%%2%%TODO'` [^commented] | `string` | `'%%1%%IN_PROGRESS'` [^commented] |
| `task.status.symbol` | `string` | `' '` | `string` | `'/'` |
| `task.status.nextSymbol` | `string` | `'x'` | `string` | `'x'` |

<!-- placeholder to force blank line after included text --><!-- endInclude -->

1. `task.status.typeGroupText` (added in Tasks 4.9.0) is a convenient way to sort status types in to a natural order in custom grouping functions.

## Values for Dates in Tasks

<!-- placeholder to force blank line before included text --><!-- include: TaskProperties.test.task_dates.approved.md -->

| Field | Type 1 | Example 1 | Type 2 | Example 2 |
| ----- | ----- | ----- | ----- | ----- |
| `task.created` | `TasksDate` | `2023-07-01 00:00` | `TasksDate` | `` |
| `task.start` | `TasksDate` | `2023-07-02 00:00` | `TasksDate` | `` |
| `task.scheduled` | `TasksDate` | `2023-07-03 00:00` | `TasksDate` | `` |
| `task.due` | `TasksDate` | `2023-07-04 00:00` | `TasksDate` | `` |
| `task.cancelled` | `TasksDate` | `2023-07-06 00:00` | `TasksDate` | `` |
| `task.done` | `TasksDate` | `2023-07-05 00:00` | `TasksDate` | `` |
| `task.happens` | `TasksDate` | `2023-07-02 00:00` | `TasksDate` | `` |

<!-- placeholder to force blank line after included text --><!-- endInclude -->

1. Each of these values is a `TasksDate` object. The [[#Values in TasksDate Properties]] section below shows what can be done with them.
1. Note that currently all stored dates have no time, or rather, their time is midnight at the start of the day, local time.
1. For example uses of date properties, see [[Filters#Due Date]] and [[Grouping#Due Date]].
1. `task.happens` is the earlier of `task.due`, `task.scheduled` and `task.start`.
1. `task.cancelled` was added in Tasks 5.5.0.

## Values in TasksDate Properties

<!-- placeholder to force blank line before included text --><!-- include: TaskProperties.test.task_date_fields.approved.md -->

| Field | Type 1 | Example 1 | Type 2 | Example 2 |
| ----- | ----- | ----- | ----- | ----- |
| `task.due` | `TasksDate` | `2023-07-04 00:00` | `TasksDate` | `` |
| `task.due.moment` | `Moment` | `moment('2023-07-04 00:00')` | `null` | `null` |
| `task.due.formatAsDate()` | `string` | `'2023-07-04'` | `string` | `''` |
| `task.due.formatAsDate('no date')` | `string` | `'2023-07-04'` | `string` | `'no date'` |
| `task.due.formatAsDateAndTime()` | `string` | `'2023-07-04 00:00'` | `string` | `''` |
| `task.due.formatAsDateAndTime('no date')` | `string` | `'2023-07-04 00:00'` | `string` | `'no date'` |
| `task.due.format('dddd')` | `string` | `'Tuesday'` | `string` | `''` |
| `task.due.format('dddd', 'no date')` | `string` | `'Tuesday'` | `string` | `'no date'` |
| `task.due.toISOString()` | `string` | `'2023-07-04T00:00:00.000Z'` | `string` | `''` |
| `task.due.toISOString(true)` | `string` | `'2023-07-04T00:00:00.000+00:00'` | `string` | `''` |
| `task.due.category.name` | `string` | `'Future'` | `string` | `'Undated'` |
| `task.due.category.sortOrder` | `number` | `3` | `number` | `4` |
| `task.due.category.groupText` | `string` | `'%%3%% Future'` [^commented] | `string` | `'%%4%% Undated'` [^commented] |
| `task.due.fromNow.name` | `string` | `'in 22 days'` | `string` | `''` |
| `task.due.fromNow.sortOrder` | `number` | `320230704` | `number` | `0` |
| `task.due.fromNow.groupText` | `string` | `'%%320230704%% in 22 days'` [^commented] | `string` | `''` |

<!-- placeholder to force blank line after included text --><!-- endInclude -->

1. These examples refer to `task.due`, but they can be used on any of the date properties show in the section [[#Values for Dates in Tasks]] above.
1. The `TasksDate` formatting methods use the [moment.js format characters](https://momentjs.com/docs/#/displaying/format/).
1. The `TasksDate` formatting methods all take an optional `fallBackText` string value, which is the value to use when there is no date. <br>The `fallBackText` value can be any of:
    - a fixed string, such as `'no date'`,
    - an [[Expressions|expression]], such as `task.priorityName` or `task.priorityNameGroupText`,
    - an empty string `''` or `""`, meaning 'do not add a heading for tasks missing this date property'.
1. You can see the current [TasksDate source code](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/src/DateTime/TasksDate.ts), to explore its implementation.
1. `task.due.toISOString(true)` prevents UTC conversion - see the [moment documentation](https://momentjs.com/docs/#/displaying/as-iso-string/)
1. `category` divides dates in to 5 named groups:
    - `Invalid date`
    - `Overdue`
    - `Today`
    - `Future`
    - `Undated`
    - And they are numbered 0, 1, 2, 3 and 4, in the order listed above.
1. `fromNow` groups dates by the [time from now](https://momentjs.com/docs/#/displaying/fromnow/), for example:
    - `2 months ago`
    - `8 days ago`
    - `in 11 hours`
    - `in 5 days`
    - `in 3 months`
    - `in a year`
1. The `category` properties were added in Tasks 4.9.0.
    - The `Invalid date` category was added in Tasks 6.0.0.
1. The `fromNow` properties were added in Tasks 4.9.0.

## Values for Task Dependencies

<!-- placeholder to force blank line before included text --><!-- include: TaskProperties.test.task_dependency_fields.approved.md -->

| Field | Type 1 | Example 1 | Type 2 | Example 2 |
| ----- | ----- | ----- | ----- | ----- |
| `task.id` | `string` | `'abcdef'` | `string` | `''` |
| `task.dependsOn` | `string[]` | `['123456', 'abc123']` | `any[]` | `[]` |
| `task.isBlocked(query.allTasks)` | `boolean` | `false` | `boolean` | `false` |
| `task.isBlocking(query.allTasks)` | `boolean` | `false` | `boolean` | `false` |

<!-- placeholder to force blank line after included text --><!-- endInclude -->

1. See the page [[Task Dependencies]], which explains the dependencies facility.
1. `Task.isBlocked()` behaves the same as `is blocked`: see [[Filters#Blocked Tasks]].
1. `Task.isBlocking()` behaves the same as `is blocking`: see  [[Filters#Blocking Tasks]].
1. Task Dependencies were released in Tasks 6.1.0.

## Values for Other Task Properties

<!-- placeholder to force blank line before included text --><!-- include: TaskProperties.test.task_other_fields.approved.md -->

| Field | Type 1 | Example 1 | Type 2 | Example 2 |
| ----- | ----- | ----- | ----- | ----- |
| `task.description` | `string` | `'Do exercises #todo #health'` | `string` | `'minimal task'` |
| `task.descriptionWithoutTags` | `string` | `'Do exercises'` | `string` | `'minimal task'` |
| `task.priorityNumber` | `number` | `2` | `number` | `3` |
| `task.priorityName` | `string` | `'Medium'` | `string` | `'Normal'` |
| `task.priorityNameGroupText` | `string` | `'%%2%%Medium priority'` [^commented] | `string` | `'%%3%%Normal priority'` [^commented] |
| `task.urgency` | `number` | `3.3000000000000007` | `number` | `1.9500000000000002` |
| `task.isRecurring` | `boolean` | `true` | `boolean` | `false` |
| `task.recurrenceRule` | `string` | `'every day when done'` | `string` | `''` |
| `task.onCompletion` | `string` | `'delete'` | `string` | `''` |
| `task.tags` | `string[]` | `['#todo', '#health']` | `any[]` | `[]` |
| `task.originalMarkdown` | `string` | `'  - [ ] Do exercises #todo #health 🆔 abcdef ⛔ 123456,abc123 🔼 🔁 every day when done 🏁 delete ➕ 2023-07-01 🛫 2023-07-02 ⏳ 2023-07-03 📅 2023-07-04 ❌ 2023-07-06 ✅ 2023-07-05 ^dcf64c'` | `string` | `'- [/] minimal task'` |
| `task.lineNumber` | `number` | `17` | `number` | `0` |

<!-- placeholder to force blank line after included text --><!-- endInclude -->

1. `task.description` has spaces at the start and end stripped off.
1. `task.description` includes any tags.
1. `task.priorityName` and `task.priorityNumber` values are:
    - 'Highest': 0
    - 'High': 1
    - 'Medium': 2
    - 'Normal': 3
    - 'Low': 4
    - 'Lowest': 5
1. `task.priorityNameGroupText` (added in Tasks 4.9.0) is a convenient way to sort priority names in to a natural order in custom grouping functions.
1. `task.isRecurring` is:
    - `true` if the Task has a **valid** recurrence rule,
    - `false` if:
        - **either** it does not have a recurrence rule
        - **or** the recurrence rule is invalid (such as `🔁  every seven weeks`, for example).
1. `task.recurrenceRule` is:
    - **either** the standardised text of the recurrence rule if the Task has a **valid** recurrence rule
        - An example might be `every 7 weeks`.
        - Note that this text is generated programmatically and standardised, and so may not exactly match the text in any manually typed tasks.
        - For example, a task with `🔁 every Sunday` will have a   `task.recurrenceRule` value of  `every week on Sunday`.
    - **or** an empty string (`''`) if:
        - **either** it does not have a recurrence rule,
        - **or** the recurrence rule is invalid (such as `🔁  every seven weeks`, for example).
1. `task.onCompletion` (added in Tasks 7.8.0) will have one of these values:
    - `delete`
    - `keep`
    - `` (empty string), which is the default, when the task has no [[On Completion]] action specified.
1. Note that if there is a [[Global Filter]] enabled in settings, and the filter is a tag, it will be removed from `task.tags`.

## Values for File Properties

<!-- placeholder to force blank line before included text --><!-- include: TaskProperties.test.task_file_properties.approved.md -->

| Field | Type 1 | Example 1 | Type 2 | Example 2 |
| ----- | ----- | ----- | ----- | ----- |
| `task.file.path` | `string` | `'some/folder/fileName.md'` | `string` | `''` |
| `task.file.pathWithoutExtension` | `string` | `'some/folder/fileName'` | `string` | `''` |
| `task.file.root` | `string` | `'some/'` | `string` | `'/'` |
| `task.file.folder` | `string` | `'some/folder/'` | `string` | `'/'` |
| `task.file.filename` | `string` | `'fileName.md'` | `string` | `''` |
| `task.file.filenameWithoutExtension` | `string` | `'fileName'` | `string` | `''` |
| `task.hasHeading` | `boolean` | `true` | `boolean` | `false` |
| `task.heading` | `string` | `'My Header'` | `null` | `null` |

<!-- placeholder to force blank line after included text --><!-- endInclude -->

1. `task.file` is a `TasksFile` object.
1. You can see the current [TasksFile source code](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/src/Scripting/TasksFile.ts), to explore its capabilities.
1. The presence of `.md` filename extensions is chosen to match the existing conventions in the Tasks filter instructions [[Filters#File Path|path]] and [[Filters#File Name|filename]].
1. `task.file.pathWithoutExtension` was added in Tasks 4.8.0.
1. `task.file.filenameWithoutExtension` was added in Tasks 4.8.0.

[^commented]: Text inside `%% ... %%` comments is hidden from view. It is used to control the order that group headings are sorted in.

## Values for Obsidian Properties

> [!released]
> Access to the Obsidian Properties was introduced in Tasks 7.7.0.

These are described in full in [[Obsidian Properties]].

<!-- placeholder to force blank line before included text --><!-- include: TaskProperties.test.task_frontmatter_properties.approved.md -->

| Field | Type 1 | Example 1 |
| ----- | ----- | ----- |
| `task.file.hasProperty('creation date')` | `boolean` | `true` |
| `task.file.property('creation date')` | `string` | `'2024-05-25T15:17:00'` |
| `task.file.property('sample_checkbox_property')` | `boolean` | `true` |
| `task.file.property('sample_date_property')` | `string` | `'2024-07-21'` |
| `task.file.property('sample_date_and_time_property')` | `string` | `'2024-07-21T12:37:00'` |
| `task.file.property('sample_list_property')` | `string[]` | `['Sample', 'List', 'Value']` |
| `task.file.property('sample_number_property')` | `number` | `246` |
| `task.file.property('sample_text_property')` | `string` | `'Sample Text Value'` |
| `task.file.property('sample_text_multiline_property')` | `string` | `'Sample\nText\nValue\n'` |
| `task.file.property('sample_link_property')` | `string` | `'[[yaml_all_property_types_populated]]'` |
| `task.file.property('sample_link_list_property')` | `string[]` | `['[[yaml_all_property_types_populated]]', '[[yaml_all_property_types_empty]]']` |
| `task.file.property('tags')` | `string[]` | `['#tag-from-file-properties']` |

<!-- placeholder to force blank line after included text --><!-- endInclude -->

1. `task.file.hasProperty()` and `task.file.property()` were added in Tasks 7.7.0
1. `task.file.hasProperty('property name')` returns true if the property `'property name'` is both present in the file and has a non-`null` value.
1. `task.file.property('property name')` returns either the value in the file, or `null` if there is no value.

## Values for Links

> [!released]
> Access to the Links was introduced in Tasks 7.21.0.

These are described in full in [[Links]].

<!-- placeholder to force blank line before included text --><!-- include: TaskProperties.test.task_links.approved.md -->

| Field | Type 1 | Example 1 |
| ----- | ----- | ----- |
| `task.outlinks` | `Link[]` | `['Test Data/link_in_task_wikilink.md']` |
| `task.file.outlinksInProperties` | `Link[]` | `['Test Data/link_in_yaml.md', 'Test Data/links_everywhere.md']` |
| `task.file.outlinksInBody` | `Link[]` | `['Test Data/link_in_file_body.md', 'Test Data/link_in_heading.md', 'Test Data/link_in_task_wikilink.md']` |
| `task.file.outlinks` | `Link[]` | `['Test Data/link_in_yaml.md', 'Test Data/links_everywhere.md', 'Test Data/link_in_file_body.md', 'Test Data/link_in_heading.md', 'Test Data/link_in_task_wikilink.md']` |

<!-- placeholder to force blank line after included text --><!-- endInclude -->

1. These all return an array of `Link` objects.
1. The table above shows the result of `link.destinationPath`
1. `task.outlinks` contains any links in the task description.
    - It does not contain links in any nested tasks or list items.
1. `task.file.outlinksInProperties` returns all the links in the task file's [[Obsidian Properties]].
1. `task.file.outlinksInBody` returns all the links in the body of the note containing the task. Naturally, this includes any links on the task line itself.
1. `task.file.outlinks` returns all this links in both [[Obsidian Properties]] and the body of the note containing the task.
