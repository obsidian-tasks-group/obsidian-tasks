# Review and check your Statuses

## About this file

This file was created by the Obsidian Tasks plugin (version x.y.z) to help visualise the task statuses in this vault.

If you change the Tasks status settings, you can get an updated report by:

- Going to `Settings` -> `Tasks`.
- Clicking on `Review and check your Statuses`.

You can delete this file any time.

## Status Settings

<!--
Switch to Live Preview or Reading Mode to see the table.
If there are any Markdown formatting characters in status names, such as '*' or '_',
Obsidian may only render the table correctly in Reading Mode.
-->

These are the status values in the Core and Custom statuses sections.

| Status Symbol | Next Status Symbol | Status Name | Status Type | Problems (if any) |
| ----- | ----- | ----- | ----- | ----- |
| `space` | `x` | Todo | `TODO` |  |
| `x` | `space` | Done | `DONE` |  |
| `/` | `x` | In Progress | `IN_PROGRESS` |  |
| `-` | `space` | Cancelled | `CANCELLED` |  |
| `Q` | `A` | Question | `NON_TASK` |  |
| `A` | `Q` | Answer | `NON_TASK` |  |
|  |  |  | `TODO` | Empty symbol: this status will be ignored. |

## Loaded Settings

<!-- Switch to Live Preview or Reading Mode to see the diagram. -->

These are the settings actually used by Tasks.

```mermaid
flowchart LR

classDef TODO        stroke:#f33,stroke-width:3px;
classDef DONE        stroke:#0c0,stroke-width:3px;
classDef IN_PROGRESS stroke:#fa0,stroke-width:3px;
classDef CANCELLED   stroke:#ddd,stroke-width:3px;
classDef NON_TASK    stroke:#99e,stroke-width:3px;

1["'Todo'<br>[ ] -> [x]<br>(TODO)"]:::TODO
2["'Done'<br>[x] -> [ ]<br>(DONE)"]:::DONE
3["'In Progress'<br>[/] -> [x]<br>(IN_PROGRESS)"]:::IN_PROGRESS
4["'Cancelled'<br>[-] -> [ ]<br>(CANCELLED)"]:::CANCELLED
5["'Question'<br>[Q] -> [A]<br>(NON_TASK)"]:::NON_TASK
6["'Answer'<br>[A] -> [Q]<br>(NON_TASK)"]:::NON_TASK
1 --> 2
2 --> 1
3 --> 2
4 --> 1
5 --> 6
6 --> 5

linkStyle default stroke:gray
```


## Sample Tasks

Here is one example task line for each of the statuses actually used by tasks, for you to experiment with.

The status symbols and names in the task descriptions were correct when this file was created.

If you have modified the sample tasks since they were created, you can see the current status types and names in the group headings in the Tasks search below.

> [!Tip] Tip: If all your checkboxes look the same...
> If all the checkboxes look the same in Reading Mode or Live Preview, see [Style custom statuses](https://publish.obsidian.md/tasks/How+To/Style+custom+statuses) for how to select a theme or CSS snippet to style your statuses.

- [ ] Sample task 1: status symbol=`space` status name='Todo'
- [x] Sample task 2: status symbol=`x` status name='Done'
- [/] Sample task 3: status symbol=`/` status name='In Progress'
- [-] Sample task 4: status symbol=`-` status name='Cancelled'
- [Q] Sample task 5: status symbol=`Q` status name='Question'
- [A] Sample task 6: status symbol=`A` status name='Answer'

## Search the Sample Tasks

This Tasks search shows all the tasks in this file, grouped by their status type and status name.

```tasks
path includes {{query.file.path}}
group by status.type
group by status.name
sort by function task.lineNumber
hide postpone button
short mode
```
