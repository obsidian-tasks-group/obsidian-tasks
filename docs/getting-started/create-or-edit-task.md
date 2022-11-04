---
layout: default
title: Create or edit Task
nav_order: 7
parent: Getting Started
has_toc: false
---

# 'Create or edit Task' Modal

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

## Introduction

![Create or Edit Modal](../images/modal.png)
<br>The `Tasks: Create or edit` command helps you when adding or editing a task.

## Opening the 'Create or edit Task' Modal

Use the command 'Tasks: Create or edit task' to launch the modal.

- If the cursor was on an existing task, the modal will modify that task's properties.
- If the cursor was on a blank line, the modal will create a brand new task on that line.

## Keyboard shortcuts

> Introduced in Tasks 1.17.0.

All the fields of the form have "access keys", that is, keyboard shortcuts. The access keys are displayed as the underlined letters in the labels.

- On Windows, press the `Alt`-key and the underlined letter at the same time.
- On Mac, press `Ctrl`-key and the `Option`-key and the underlined letter at the same time.

### Turning off keyboard shortcuts

> Introduced in Tasks 1.17.0.

If the access keys (keyboard shortcuts) for any field conflicts with system keyboard shortcuts or interferes with assistive technology functionality that is important for you, you may want to turn them off in the Tasks plugin's settings:

![Create or Edit Modal](../images/settings-provide-access-keys-in-dialogs.png)

This setting takes immediate effect, and does not require restarting of Obsidian.

## Entering values

### Description

This is the text describing your task.

If you have a [global filter]({{ site.baseurl }}{% link getting-started/global-filter.md %}) enabled, the dialog takes care of adding it automatically.

### Priority

See [priority]({{ site.baseurl }}{% link getting-started/priority.md %}).

### Recurrence

Here you can make the task recur, so that when it is marked as done, a new task is created, with newer dates.

See [recurring tasks (repetition)]({{ site.baseurl }}{% link getting-started/recurring-tasks.md %}).

### Dates

Here you can optionally give the task
[due]({{ site.baseurl }}{% link getting-started/dates.md %}#-due),
[scheduled]({{ site.baseurl }}{% link getting-started/dates.md %}#-scheduled) and
[start]({{ site.baseurl }}{% link getting-started/dates.md %}#-start) dates.

There is a lot of flexibility here. For example:

- You can type in exact dates, such as `2022-11-28`.
- You can also enter parts of dates, such as `6 oct`.
- You can enter relative dates, such as `today` or `tomorrow` or `Saturday`.

Note that relative dates will be always interpreted as being in the future, because that is usually what you want. You can change this behavior by unchecking "Only future dates" if you want to enter an overdue task or experiment with the way how relative dates in the past would be interpreted in queries.

> `Only future dates` was introduced in Tasks 1.15.0.

### Date abbreviations

> Introduced in Tasks 1.8.0.

The modal also has a few abbreviations of its own, to speed up entering of common values in the date fields.

Type in the abbreviation and then a space character, and the whole word will be entered for you.

Supported abbreviations:

| Abbreviation | Expanded Text |
| ------------ | ------------- |
| `td`         | `today`       |
| `tm`         | `tomorrow`    |
| `yd`         | `yesterday`   |
| `tw`         | `this week`   |
| `nw`         | `next week`   |
| `weekend`    | `sat`         |
| `we`         | `sat`         |

### Status and Done on

These values cannot currently be edited in this modal.

## Finishing off

To close the modal and save your edits, do one of:

- click `Apply`,
- press `Return` or `Enter`.

To close the modal and cancel your edits, do one of:

- click `Cancel`,
- click or tap outside the modal,
- click the close button at the corner of the modal (if one exists on your operating system),
- hit the `Esc` key.

## Known limitations

### Need to scroll on phone screens

On phone screens the 'Create or edit Task' Modal may be too tall to fit on the screen.
It does support scrolling, and on Android, the scrollbar is visible.

Unfortunately iPhones don't display the scrollbar until you actually start scrolling.
Tap on the screen and drag down, and you will see a scrollbar appear temporarily.
More importantly, the scrolling does then work fine.

We are tracking the iPhone scrollbar issue in [issue #1238](https://github.com/obsidian-tasks-group/obsidian-tasks/issues/1238).
