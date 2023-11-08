---
publish: true
---

# Recurring Tasks and Custom Statuses

<span class="related-pages">#feature/statuses</span>

> [!Note]
> This page assumes basic familiarity with [[Recurring Tasks]].
>
> Also, for examples in this page we adjusted the Tasks settings so that [[Recurring Tasks#Order of the new task|new task recurrences are added *below* the previous one.]]

## Determining the next status

When you click on the checkbox of a task, the Tasks plugin applies the following logic: ^[Except when the task status has type `NON_TASK`. See [[#When the current status type is NON_TASK]] for an example.]

1. When a task line checkbox is clicked, the next status symbol is looked up in the user's Task plugin's [[Status Settings]].
2. If the next status symbol is of type `DONE`:
    - A [[Dates#Done date|Done date]] is added (if enabled in user settings).
    - If the task line has a Recurrence rule, an new task is created, with the next status symbol after the `DONE` symbol.

> [!Important]
> Every time Tasks detects you clicked on a task checkbox, the plugin reads the current status symbol - inside the `[` and `]` - and looks it up in your Tasks status settings, to determine what the next status symbol will be.

## Worked example, with recurring task

### Starting point

Suppose that we have adjusted the default Tasks settings slightly, to give us the **following Tasks status settings**:

<!-- include: DocsSamplesForStatuses.test.DefaultStatuses_todo-in_progress-done.approved.detailed.mermaid.md -->
```mermaid
flowchart LR

classDef TODO        stroke:#f33,stroke-width:3px;
classDef DONE        stroke:#0c0,stroke-width:3px;
classDef IN_PROGRESS stroke:#fa0,stroke-width:3px;
classDef CANCELLED   stroke:#ddd,stroke-width:3px;
classDef NON_TASK    stroke:#99e,stroke-width:3px;

1["'Todo'<br>[ ] -> [/]<br>(TODO)"]:::TODO
2["'In Progress'<br>[/] -> [x]<br>(IN_PROGRESS)"]:::IN_PROGRESS
3["'Done'<br>[x] -> [ ]<br>(DONE)"]:::DONE
1 --> 2
2 --> 3
3 --> 1

linkStyle default stroke:gray
```
<!-- endInclude -->

And we have selected the Tasks setting to put [[#Order of the new task|the new recurrence below the initial one]].

Now imagine we have the **following task line**:

```text
- [ ] Do something 🔁 every day 📅 2023-10-15
```

- It is a recurring task.
- It recurs every day.
- And it is due on `2023-10-15` (today).

### First click - advances to IN_PROGRESS

The **first time we click on the task's checkbox** or run Tasks' **Toggle task done** command, the line becomes:

```text
- [/] Do something 🔁 every day 📅 2023-10-15
```

- Notice that `[ ]` has become `[/]` ...
  - ... because the next status symbol after `space` is `/`.
- From the settings, we see the status type is now `IN_PROGRESS`.

### Second click - advances to DONE and recurs

The **next time we click on the task's checkbox** or run Tasks' **Toggle task done** command we toggle the task, the line becomes **two lines**:

```text
- [x] Do something 🔁 every day 📅 2023-10-15 ✅ 2023-10-15
- [ ] Do something 🔁 every day 📅 2023-10-16
```

Let's look at that in more detail.

### Breaking down the result

Let's look at the **first of those two lines:**

```text
- [x] Do something 🔁 every day 📅 2023-10-15 ✅ 2023-10-15
```

- Notice that `[/]` has become `[x]` ...
  - ... because the next status symbol after `/` is `x`.
- From the settings, we see the status type is now `DONE`.
- So a [[Dates#Done date|Done date]] is added (if enabled in user settings).

Let's look at the **second of those two lines**:

```text
- [ ] Do something 🔁 every day 📅 2023-10-16
```

- This new task line was created because:
  - the original task had a Recurrence rule,
  - and its status type had advanced to `DONE`.
- Notice that in the new task line, the status is `[ ]` ...
  - ... because the next status symbol after `x` is ``.
- And the Due date has advanced a day.

## When DONE is not followed by TODO or IN_PROGRESS

In the following example, `DONE` is followed by `CANCELLED`.

<!-- include: DocsSamplesForStatuses.test.DefaultStatuses_done-toggles-to-cancelled.approved.detailed.mermaid.md -->
```mermaid
flowchart LR

classDef TODO        stroke:#f33,stroke-width:3px;
classDef DONE        stroke:#0c0,stroke-width:3px;
classDef IN_PROGRESS stroke:#fa0,stroke-width:3px;
classDef CANCELLED   stroke:#ddd,stroke-width:3px;
classDef NON_TASK    stroke:#99e,stroke-width:3px;

1["'Todo'<br>[ ] -> [/]<br>(TODO)"]:::TODO
2["'Done'<br>[x] -> [-]<br>(DONE)"]:::DONE
3["'In Progress'<br>[/] -> [x]<br>(IN_PROGRESS)"]:::IN_PROGRESS
4["'Cancelled'<br>[-] -> [ ]<br>(CANCELLED)"]:::CANCELLED
1 --> 3
2 --> 4
3 --> 2
4 --> 1

linkStyle default stroke:gray
```
<!-- endInclude -->

This means that new recurrence of any completed recurring tasks will always be `CANCELLED`.

For example, when the following task is toggled:

```text
- [/] Do something 🔁 every day 📅 2024-10-16
```

... it will become ...

```text
- [x] Do something 🔁 every day 📅 2024-10-16 ✅ 2023-10-16
- [-] Do something 🔁 every day 📅 2024-10-17
```

Note that the new task has `CANCELLED` status, so will not typically show up in standard Tasks searches.

> [!Tip]
> Currently, if you plan to use recurring tasks, you should always ensure that any statuses of type `DONE` are always followed by statuses of type `TODO`.
>
> You can [[Check your Statuses]] for any statuses that do not follow this guideline.

> [!Note]
> When [[Custom Statuses]] were introduced, and we had to figure out how integrate them with recurring tasks, we expected that users would always following `DONE` with `TODO`.
>
> It turns out that (at least) two users have opted to follow `DONE` with `CANCELLED`, with recurring tasks.
>
> At some point we may adjust the Recurrence code so that:
>
> - instead of just taking the next status after the `DONE` task ...
> - ... it will proceed through the statuses until it finds a `TODO` task.
>
> We are tracking this in [issue #2089](https://github.com/obsidian-tasks-group/obsidian-tasks/issues/2089) and [issue #2304](https://github.com/obsidian-tasks-group/obsidian-tasks/issues/2304).

## When the current status type is NON_TASK

[[Status Types#NON_TASK|NON_TASK]] is a special status type to use for checklists that do not represent tasks.

<!-- include: DocsSamplesForStatuses.test.DefaultStatuses_pro-con-cycle.approved.detailed.mermaid.md -->
```mermaid
flowchart LR

classDef TODO        stroke:#f33,stroke-width:3px;
classDef DONE        stroke:#0c0,stroke-width:3px;
classDef IN_PROGRESS stroke:#fa0,stroke-width:3px;
classDef CANCELLED   stroke:#ddd,stroke-width:3px;
classDef NON_TASK    stroke:#99e,stroke-width:3px;

1["'Pro'<br>[P] -> [C]<br>(NON_TASK)"]:::NON_TASK
2["'Con'<br>[C] -> [P]<br>(NON_TASK)"]:::NON_TASK
1 --> 2
2 --> 1

linkStyle default stroke:gray
```
<!-- endInclude -->

With the above custom statuses in Tasks settings, clicking on task lines with checkboxes `[P]` and `[C]` will:

- never add a Done date
- never create a new instance, even if the task line has a recurrence rule.
