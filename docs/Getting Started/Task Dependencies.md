---
publish: true
---

# Task Dependencies

> [!released]
> Introduced in Tasks X.Y.Z.

## Introduction

At a high level, task dependencies define the order in which you want to work on a set of tasks.
This can be useful for mapping out projects, where one part needs to be completed before the other.
By specifying these dependencies, Obsidian Tasks can streamline your workflow by displaying only the tasks that are actionable at any given moment.

> [!NOTE]
> Obsidian tasks exclusively allows for Finish to start (FS) dependencies, meaning Task A needs to be finished before you start on Task B. You can learn more about this concept [on Wikipedia](https://en.wikipedia.org/wiki/Dependency_(project_management)).

## Example

To illustrate the concept of task dependencies, let's consider a scenario where we are outlining the tasks required to develop an application. Two tasks are identified:

```text
- [ ] Build a first draft
- [ ] Test with users
```

In this scenario, testing with users can only occur after the initial draft is completed. To establish this relationship, you can create a dependency between the two tasks using either of the following methods.

1. Open the 'Build a first draft' task in the Edit Task Modal and specify 'Test with users' as a 'Blocking' task
2. Alternatively, open the 'Test with users' task in the Edit Task Modal and add 'Build a first draft' as a 'Blocked By' task
    ![[task-dependencies-blocked-by-example.png]]

By implementing either of these methods, the task list is updated to reflect the dependency relationship:

```text
- [ ] Build a first draft 🆔 4ijuhy
- [ ] Test with users ⛔️ 4ijuhy
```

Then, if the query `is not blocked` is used

    ```tasks
    is not blocked
    ```

We only see 'Build a first draft'

```text
- [ ] Build a first draft 🆔 4ijuhy
```

Until this task is marked as complete, at which time Obsidian Tasks sees that 'Test with users' is no longer blocked, and displays it as well

```text
- [x] Build a first draft 🆔 4ijuhy
- [ ] Test with users ⛔️ 4ijuhyz
```

## Nomenclature

Fields:

- `blockedBy`
- `id`

UI:

- Blocked by [implies an id of another task]
- Blocks

Query

- blocking
- blocked

## Adding Dependencies

## Using Dependencies in Tasks Searches

- [[Filters#Filters for Task Dependencies]]
- [[Sorting#Sort by Task Dependencies]]
- [[Grouping#Group by Task Dependencies]]

`is not blocked`

`is blocking`

![[Pasted image 20231011181837.png]]

## Known Limitations

- It's not yet possible to directly navigate from a task to the tasks it depends on.
- Outside of the edit task modal, it is not possible to see the descriptions of the blocking tasks.
- It is not yet possible to visualise the relationships in a graph viewer.
