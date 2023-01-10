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

### Built-in statuses

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

![Initial Task Statuses Options](../images/settings-custom-statuses-initial.png)

There are two sections:

1. **Core Status Types**
    - These are statuses that are built in to Tasks, and cannot be edited or deleted.
2. **Custom Status Types**
    - This is where you can add your own custom statuses.

We also see that each status consists of:

- **Status Symbol** (for example, `x` and  `-`)
- **Status Name** (for example, 'In Progress')
- **Next Status Symbol** (for example, `x` and `space`)

---

## Example: Add a set of high priority statuses

### Goal

Suppose that you wanted to create a set of 3 statuses that cycle between each other:

<!-- placeholder to force blank line before table --> <!-- include: DocsSamplesForStatuses.test.DefaultStatuses_important-cycle.approved.md -->

| Status Character    | Status Name | Next Status Character | Needs Custom Styling |
| ------------------- | ----------- | --------------------- | -------------------- |
| `!` | Important | `D` | Yes |
| `D` | Doing - Important | `X` | Yes |
| `X` | Done - Important | `!` | Yes |

<!-- placeholder to force blank line after table --> <!-- endInclude -->

### The Steps

1. Open the Tasks settings pane
1. Scroll down and click on 'Add New Task Status'
    - This will create a new, empty status:
    - ![Settings after adding a new empty status](../images/settings-custom-statuses-added-1.png)
1. Click on the pencil icon
    - This will open the status edit modal:
    - ![The modal for editing statuses](../images/settings-custom-statuses-dialog-1.png)
1. Enter the desired values:
    - ![Enter the values for our new status](../images/settings-custom-statuses-dialog-2.png)
1. Click on the Check button to save the new status, and view the result:
    - ![After saving the values for the new status](../images/settings-custom-statuses-added.png)
1. Repeat for the other two statuses and you should see:
    - ![After adding the other two new statuses](../images/settings-custom-statuses-important-loop-added.png)

{: .warning }
At the moment the error-checking in the status edit modal is not quite working, and if there is an invalid value such as an empty status symbol, the field can disappear completely. If this happens, the workaround is to close the modal, and click on the pencil to re-open it. We are tracking this as [issue #1498](https://github.com/obsidian-tasks-group/obsidian-tasks/issues/1498).

{: .warning }
Tasks currently allows creation of more than one status with the same symbol. It silently ignores any duplicate symbols: only the first will be used. If in doubt, examine the available statuses in the status dropdown in the [‘Create or edit Task’ Modal]({{ site.baseurl }}{% link getting-started/create-or-edit-task.md %}).

## Test the new statuses

The status changes are applied immediately. You do not need to restart Obsidian.

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
