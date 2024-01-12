---
publish: true
aliases:
  - Status Type
---

# Status Types

<span class="related-pages">#feature/statuses</span>

## Overview

With the new ability to create a variety of [[Custom Statuses]], Tasks needs to know enough about each status that it can decide:

- how to treat tasks when searching,
- and what to do when tasks with the status are toggled, both for adding or removing Done dates, and for creating new task recurrences.

This was solved by the introduction of 'Status Types', which are simply a set of 5 possible types of status:

- `TODO`
- `IN_PROGRESS`
- `DONE`
- `CANCELLED`
- `NON_TASK`

## The Types

### TODO

Self explanatory, we hope: this can be thought of as 'things not yet started'.

### IN_PROGRESS

Use of this is totally optional. You may find it useful to be able to prioritise completing tasks which have already been started.

### DONE

The `DONE` type is used to determine:

- whether to add or remove the Done date when toggling a task.
- whether to create new instances of recurring tasks, when they are done.

The page [[Recurring Tasks and Custom Statuses]] has several worked examples to explain the above points fully.

### CANCELLED

This is typically used for tasks that you originally thought needed to be done, but have since discovered are not needed for some reason.

Previously, the only option in Tasks for these was to mark them as DONE, but this was misleading. It could also have added a Done date to them, which was even more misleading.

### NON_TASK

Custom checkbox styles are often used for non-task concepts, such as 'Pro' and 'Con' lists.

You may wish to assign this type to some of your statuses, to allow you to write filters to exclude them from your task searches.

When you click on checkboxes for `NON_TASK` statuses, the task line will:

- never acquire a Done date
- never create a new instance, even if the task line has a [[Recurring Tasks|recurrence rule]].

## Status Types-related instructions

- Status types are searchable with `status.type`, for example `status.type is IN_PROGRESS`.
  - You can have any number of statuses with the same status type, and then search them conveniently with `status.type`
- Also available:
  - `sort by status.type`
  - `group by status.type`

The `status.type` filter uses a new pattern in the Tasks code which some refer to as '[write Help messages rather than Error messages](https://twitter.com/travis_simon/status/1069074730211135488)'.

If Tasks does not understand a `status.type` instruction, it reports this kind of message:

```text
Tasks query: Invalid status.type instruction: 'status.type in progress'.
    Allowed options: 'is' and 'is not' (without quotes).
    Allowed values:  TODO DONE IN_PROGRESS CANCELLED NON_TASK
                     Note: values are case-insensitive,
                           so 'in_progress' works too, for example.
    Example:         status.type is not NON_TASK
```

### Status Types in Tasks filters

With all this extra flexibility with Status Types, what effect do they have in Tasks searches.

For example, how are they used by the old `done` and `not done` filters?

If you are interested in detail, this table demonstrates the behaviour of each of the status types in Tasks.
Each column shows a representative example task with the given status type.

The tasks shown are purely examples for context. The `~` column is just an arbitrary example to show `NON_TASK`'s behaviour'. You can assign each of these types to any of your custom statuses.

<!-- placeholder to force blank line before included text --><!-- include: DocsSamplesForStatuses.test.Status_Transitions_status-types.approved.md -->

| Operation and status.type | TODO | IN_PROGRESS | DONE | CANCELLED | NON_TASK |
| ----- | ----- | ----- | ----- | ----- | ----- |
| Example Task | `- [ ] demo` | `- [/] demo` | `- [x] demo` | `- [-] demo` | `- [~] demo` |
| Matches `not done` | YES | YES | no | no | no |
| Matches `done` | no | no | YES | YES | YES |
| Matches `status.type is TODO` | YES | no | no | no | no |
| Matches `status.type is IN_PROGRESS` | no | YES | no | no | no |
| Matches `status.type is DONE` | no | no | YES | no | no |
| Matches `status.type is CANCELLED` | no | no | no | YES | no |
| Matches `status.type is NON_TASK` | no | no | no | no | YES |
| Matches `status.name includes todo` | YES | no | no | no | no |
| Matches `status.name includes in progress` | no | YES | no | no | no |
| Matches `status.name includes done` | no | no | YES | no | no |
| Matches `status.name includes cancelled` | no | no | no | YES | no |
| Name for `group by status` | Todo | Done | Done | Done | Done |
| Name for `group by status.type` | %%2%%TODO | %%1%%IN_PROGRESS | %%3%%DONE | %%4%%CANCELLED | %%5%%NON_TASK |
| Name for `group by status.name` | Todo | In Progress | Done | Cancelled | My custom status |

<!-- placeholder to force blank line after included text --><!-- endInclude -->
