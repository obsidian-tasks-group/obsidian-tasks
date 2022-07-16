---
layout: default
title: Typing Tasks
nav_order: 5
parent: Getting Started
has_toc: false
---

# Typing Tasks

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

## Intelligent auto-complete

> Introduced in Tasks 1.9.0.

The [Priorities]({{ site.baseurl }}{% link getting-started/priority.md %}), [Dates]({{ site.baseurl }}{% link getting-started/dates.md %}) and [Recurring Tasks]({{ site.baseurl }}{% link getting-started/recurring-tasks.md %}) pages show various emojis and special phrases that the Tasks plugin recognises, when searching for tasks.

If you prefer to type your tasks, instead of using a dialog, there is now an intelligent auto-complete mechanism that does a
lot of the typing of emojis and dates for you!

### Video Demo

It is best understood by watching a [video of it in action](https://user-images.githubusercontent.com/10722656/175102574-78b0f851-cc48-4255-a40e-d3036bec5bb6.gif).

### Walk Through

1. As you are type a task, the auto-complete menu pops up to show some common options:

    ![Auto-suggest task content settings](https://github.com/obsidian-tasks-group/obsidian-tasks/raw/docs-document-typing-tasks/resources/screenshots/auto-suggest-menu-initial-menu.png)

2. You can keep typing, or select one of the menu items in a variety of ways:

    - mouse-click on menu item
    - use the up/down keyboard keys and then type `Return` or `Enter`
    - type a few more characters, to make the menu items more specific. For example, type `pri` to show all the options for setting the task's priority.

3. Here we selected the 'high priority' item, and so now the menu is updated to show the next most likely items you might want to add. We are going to select 'recurring (repeat)' from this menu:

    ![Auto-suggest task content settings](https://github.com/obsidian-tasks-group/obsidian-tasks/raw/docs-document-typing-tasks/resources/screenshots/auto-suggest-menu-after-priority.png)

4. Now the repeat emoji has been added, the menu offers a few common options for recurrences:

    ![Auto-suggest task content settings](https://github.com/obsidian-tasks-group/obsidian-tasks/raw/docs-document-typing-tasks/resources/screenshots/auto-suggest-menu-after-repeat-emoji.png)

5. We chose `every week`, which was added to our task, and now the menu shows the remaining possible emojis:

    ![Auto-suggest task content settings](https://github.com/obsidian-tasks-group/obsidian-tasks/raw/docs-document-typing-tasks/resources/screenshots/auto-suggest-menu-after-repeat-text.png)

6. We selected the 'due date', and so now the menu offers a selection of commonly-used dates, calculated based on the current date:

    ![Auto-suggest task content settings](https://github.com/obsidian-tasks-group/obsidian-tasks/raw/docs-document-typing-tasks/resources/screenshots/auto-suggest-menu-after-due-emoji.png)

7. Now our task is complete:

    ![Auto-suggest task content settings](https://github.com/obsidian-tasks-group/obsidian-tasks/raw/docs-document-typing-tasks/resources/screenshots/auto-suggest-menu-after-due-emoji.png)

## Details

- The auto-suggest menu works in both Source mode and Live Preview.
- It does not yet support Done Date.
- It does not yet offer `when done`.
- There are many more recognized options than are showing in the menus, including many more dates, such as `2 months`, `15 days`.

## Settings

Note that like all Tasks settings, after any changes, Obsidian needs to be restarted for the new settings to take effect.

These are the settings currently available for this feature:

![Auto-suggest task content settings](https://github.com/obsidian-tasks-group/obsidian-tasks/raw/docs-document-typing-tasks/resources/screenshots/settings-auto-suggest-task-content.png)

### Auto-suggest task content

This allows the entire auto-suggest feature to be disabled. It is turned on by default.

### Minimum match length for auto-suggest

By default, the auto-suggest menu pops up before you have even typed any non-space characters.
As you become more familiar with the options it offers, this can get annoying, and you may
find that you prefer to just type a few characters instead.

You can make the menu pop up less often, by increasing this setting from 0 to 1, 2 or 3,
which will mean that the menu will only pop up when you have typed
at least the specified number of characters to find a match.

### Maximum number of auto-suggestions to show

How many suggestions should be shown when an auto-suggest menu pops up (including the "⏎" option).

The default is 6, and you can select any value from 3 to 12.

## Common Questions

### How do I see more suggestions?

Increase the 'Maximum number of auto-suggestions to show' value in settings (and re-start Obsidian) so that the menu will contain more options.

There are many more suggestions available than are first shown in the popup menu. As you type more characters, the suggestions shown will be more specific to what you typed.

### How do I make the menu pop up less?

Increase the 'Minimum match length for auto-suggest' value in settings (and re-start Obsidian) so that the menu will only appear when you have typed a few characters from your chosen menu option.

### How do I check that my Task is formatted correctly for Tasks to find all the important dates?

Open in create or edit task, other strategies if they exist?

### (reword this one probably!) I increased the minimum match length

What keywords do I need to type to make autocomplete write the emoji for me?

## Available Text

Here is the complete set of all available text, with dates that would be generated when used on 11th July 2022.

| Searchable Text         | Text that is added         |
| ----------------------- | -------------------------- |
| ⏎                       | \<new line>                |
| ⏫ high priority        | ⏫                         |
| 🔼 medium priority      | 🔼                         |
| 🔽 low priority         | 🔽                         |
| 🔁 recurring (repeat)   | 🔁                         |
| every                   | 🔁 every                   |
| every day               | 🔁 every day               |
| every week              | 🔁 every week              |
| every month             | 🔁 every month             |
| every month on the      | 🔁 every month on the      |
| every year              | 🔁 every year              |
| every week on Sunday    | 🔁 every week on Sunday    |
| every week on Monday    | 🔁 every week on Monday    |
| every week on Tuesday   | 🔁 every week on Tuesday   |
| every week on Wednesday | 🔁 every week on Wednesday |
| every week on Thursday  | 🔁 every week on Thursday  |
| every week on Friday    | 🔁 every week on Friday    |
| every week on Saturday  | 🔁 every week on Saturday  |
| 📅 due date             | 📅                         |
| ⏳ scheduled date       | ⏳                         |
| 🛫 start date           | 🛫                         |
| today (2022-07-11)      | 2022-07-11                 |
| tomorrow (2022-07-12)   | 2022-07-12                 |
| Sunday (2022-07-17)     | 2022-07-17                 |
| Monday (2022-07-11)     | 2022-07-11                 |
| Tuesday (2022-07-12)    | 2022-07-12                 |
| Wednesday (2022-07-13)  | 2022-07-13                 |
| Thursday (2022-07-14)   | 2022-07-14                 |
| Friday (2022-07-15)     | 2022-07-15                 |
| Saturday (2022-07-16)   | 2022-07-16                 |
| next week (2022-07-18)  | 2022-07-18                 |
| next month (2022-08-11) | 2022-08-11                 |
| next year (2023-07-11)  | 2023-07-11                 |

## Limitations and Known issues

With a link back up to how to check formatting.
