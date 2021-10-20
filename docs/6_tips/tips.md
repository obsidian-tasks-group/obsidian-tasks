---
layout: default
title: Tips
nav_order: 6
---

# Tips
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

## Daily Agenda

Using the default `Daily-notes` plugin, **templates** with syntax like
`{{date+14d:YYYY-MM-DD}}` won't load dates properly. Nevertheless, **Liam Cain**,
author of both the [Calendar Plugin](https://github.com/liamcain/obsidian-calendar-plugin)
and [Periodic Notes Plugin](https://github.com/liamcain/obsidian-periodic-notes), has
written code to create new daily notes (using both plugins) using the `date+Xd` format.
Therefore, if you want to use this format instead of the standard `Daily-notes` syntax,
make sure new notes are created via one of these two plugins, and not `Daily-notes`.

- **Calendar Plugin**: Just tap the day on the Calendar UI and a new daily note will be created
- **Periodic Notes Plugin**: Install, migrate from `Daily-notes` if needed, and tap the new `Open Today` ribbon on the left-side dock. Below is an example if today was August 14, 2021.

| | Daily Notes | Calendar | Periodic Notes |
|-|-------------|----------|----------------|
| template syntax | `due on {{date+14d:YYYY-MM-DD}}` | `due on {{date+14d:YYYY-MM-DD}}` | `due on {{date+14d:YYYY-MM-DD}}` |
| output | `due on {{date+14d:YYYY-MM-DD}}` | `due on 2021-08-28` | `due on 2021-08-28` |

#### Example Daily Agenda **template**:

    ## Tasks
    ### Overdue
    ```tasks
    not done
    due before {{date:YYYY-MM-DD}}
    ```

    ### Due today
    ```tasks
    not done
    due on {{date:YYYY-MM-DD}}
    ```

    ### Due in the next two weeks
    ```tasks
    not done
    due after {{date:YYYY-MM-DD}}
    due before {{date+14d:YYYY-MM-DD}}
    ```

    ### No due date
    ```tasks
    not done
    no due date
    ```

    ### Done today
    ```tasks
    done on {{date:YYYY-MM-DD}}
    ```

---

## Styling Tasks

Each task entry has CSS styles that allow you to change the look and feel of how the tasks are displayed. The 
following styles are avliable. 

| Class                    | Usage                                                                                                          |
| ------------------------ | -------------------------------------------------------------------------------------------------------------- |
| plugin-tasks-query-result| This is applied to the UL used to hold all the tasks, each task is stored in a LI.                             |
| plugin-tasks-list-item   | This is applied to the LI that holds each task and the INPUT element for it.                                   |
| tasks-backlink           | This is applied to the SPAN that wraps the backlink if displayed on the task.                                  |
| tasks-edit               | This is applied to the SPAN that wraps the edit button/icon shown next to the task that opens the task edit UI.|
| task-list-item-checkbox  | This is applied to the INPUT element for the task.                                                             |

