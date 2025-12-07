# issue 1486 - setup and notes

## Context

- [Add 'Set Status' commands \[which will also allow users to set hotkeys for particular statuses\] · Issue #1486](https://github.com/obsidian-tasks-group/obsidian-tasks/issues/1486)

## Tasks Status in this vault

These are the statuses actually used by Tasks in this vault.

```mermaid
flowchart LR

classDef TODO        stroke:#f33,stroke-width:3px;
classDef DONE        stroke:#0c0,stroke-width:3px;
classDef IN_PROGRESS stroke:#fa0,stroke-width:3px;
classDef CANCELLED   stroke:#ddd,stroke-width:3px;
classDef NON_TASK    stroke:#99e,stroke-width:3px;
classDef ON_HOLD     stroke:#00f,stroke-width:3px;

1["'Todo'<br>[ ] -> [x]<br>(TODO)"]:::TODO
2["'Done'<br>[x] -> [ ]<br>(DONE)"]:::DONE
3["'In Progress'<br>[/] -> [x]<br>(IN_PROGRESS)"]:::IN_PROGRESS
4["'Cancelled'<br>[-] -> [ ]<br>(CANCELLED)"]:::CANCELLED
5["'1 TODO'<br>[1] -> [2]<br>(TODO)"]:::TODO
6["'2 IN_PROGRESS'<br>[2] -> [3]<br>(IN_PROGRESS)"]:::IN_PROGRESS
7["'3 DONE'<br>[3] -> [1]<br>(DONE)"]:::DONE
1 --> 2
2 --> 1
3 --> 2
4 --> 1
5 --> 6
6 --> 7
7 --> 5

linkStyle default stroke:gray
```

## Commands and Hotkeys

Use Cmd + Opt + number to invoke these commands:

1. Obsidian: Toggle checkbox status
    - [[issue 1486 - status commands - 1 Obsidian Toggle checkbox status]]
2. Obsidian: Cycle bullet/checkbox
    - [[issue 1486 - status commands - 2 Obsidian Cycle bullet checkbox]]
3. Tasks: Toggle task done
    - [[issue 1486 - status commands - 3 Tasks Toggle task done - no global filter]]
    - [[issue 1486 - status commands - 3 Tasks Toggle task done - with global filter]]
