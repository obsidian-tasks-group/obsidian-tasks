---
layout: default
title: Set up custom statuses
nav_order: 2
parent: How Tos
---

# Set up custom statuses
{: .no_toc }

<details open markdown="block">
  <summary>
    Table of contents
  </summary>
  {: .text-delta }
1. TOC
{:toc}
</details>

---

## Motivation

This page shows you how to customise the statuses used in your Tasks vault.

### Core (Built-in) statuses

As installed, the Tasks plugin supports just two statuses for your tasks:

```text
- [ ] I am a TODO task that is not yet done
- [x] I am a DONE task that has been done
```

- Clicking on a TODO task converts it to DONE
- Clicking on a DONE task converts it to TODO

### Custom statuses

Many users would like to represent other statuses, such as Cancelled, Delegated, Blocked and many more.

{: .released }
Custom statuses were introduced in Tasks X.Y.Z

Tasks now allows you to add custom statuses to your settings, to give you powerful control over what happens next when you click on the task's checkbox.

## Task Statuses Options

This is what you see in the Tasks settings when you first look at the Task Statuses section:

![Initial Task Statuses Options](../images/settings-statuses-initial.png)

There are two sections:

1. **Core Statuses**
    - These are statuses that are built in to Tasks, and cannot be deleted.
    - They are the two task types that are built in to Obsidian and Tasks natively: `[ ]` and `[x]`.
    - Their status symbols cannot be changed.
    - All their other properties can be edited.
2. **Custom Statuses**
    - These statuses are what many themes call 'custom checkboxes'.
    - You will need to choose and install a Theme or CSS Snippet that supports 'custom checkboxes'
    - Tasks automatically adds `[/]` and `[-]`
    - And this is where you can add your own custom statuses.

We also see that each status consists of:

- **Status Symbol** (for example, `x` and  `-`)
- **Status Name** (for example, 'In Progress')
- **Next Status Symbol** (for example, `x` and `space`)
- **Status Type** (one of `TODO`, `DONE`, `IN_PROGRESS` or `CANCELLED`)

---

## Example: Add a set of high priority statuses

### Goal

Suppose that you wanted to create a set of 3 statuses that cycle between each other:

<!-- placeholder to force blank line before included text --> <!-- include: DocsSamplesForStatuses.test.DefaultStatuses_important-cycle.approved.md -->

| Status Character | Status Name<br>`status.name includes...`<br>`sort by status.name`<br>`group by status.name` | Next Status Character | Status Type<br>`status.type is...`<br>`sort by status.type`<br>`group by status.type` | Needs Custom Styling |
| ----- | ----- | ----- | ----- | ----- |
| `!` | Important | `D` | `TODO` | Yes |
| `D` | Doing - Important | `X` | `IN_PROGRESS` | Yes |
| `X` | Done - Important | `!` | `DONE` | Yes |

<!-- placeholder to force blank line after included text --> <!-- endInclude -->

### The Steps

1. Open the Tasks settings pane
1. Scroll down and click on 'Add New Task Status'
    - This will create a new, empty status:
    - ![Settings after adding a new empty status](../images/settings-custom-statuses-added-1.png)
1. Click on the pencil icon
    - This will open the status edit modal.
    - Notice the red colouring, to indicate values which are not yet valid.
    - If you aren't sure why something is invalid, click on the Checkmark button and an explanatory notice will pop up for a few seconds.
    - ![The modal for editing statuses](../images/settings-custom-statuses-dialog-1.png)
1. Enter the desired values (see the table in Goal above):
    - ![Enter the values for our new status](../images/settings-custom-statuses-dialog-2.png)
1. Click on the Checkmark button to save the new status, and view the result:
    - ![After saving the values for the new status](../images/settings-custom-statuses-added.png)
1. Repeat for the other two statuses in Goal above and you should see a clear reflection of the flow of your new statuses
    - `[!]` -> `[D]` -> `[X]` -> `[!]`:
    - ![After adding the other two new statuses](../images/settings-custom-statuses-important-loop-added.png)

{: .info }
> The status changes are applied to newly edited tasks and subsequently opened notes immediately.
>
> Whilst experimenting and setting up your statuses, you do not need to restart Obsidian, unless you want to make Tasks re-read all the tasks in your vault, for example so that searches are aware of the changed statuses.
>
> Once you are happy with your statuses, we recommend restarting Obsidian, to ensure that all tasks and query results use the correct settings.

{: .warning }
Tasks currently allows creation of more than one status with the same symbol. It silently ignores any duplicate symbols: only the first will be used. If in doubt, examine the available statuses in the status dropdown in the [‘Create or edit Task’ Modal]({{ site.baseurl }}{% link getting-started/create-or-edit-task.md %}).

## Test the new statuses

Now you can create use the [‘Create or edit Task’ Modal]({{ site.baseurl }}{% link getting-started/create-or-edit-task.md %}) to create a new task and set its status:

![Task edit modal shows new statuses immediately](../images/modal-showing-new-statuses.png)

Create an important task:

```text
- [!] #task Do important stuff
```

Switch to Reading mode.
Then click the checkbox for the above task.
It becomes:

```text
- [D] #task Do important stuff
```

Repeat - note the capital `X`:

```text
- [X] #task Do important stuff ✅ 2023-01-09
```

Repeat again:

```text
- [!] #task Do important stuff
```
