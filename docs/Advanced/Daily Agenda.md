---
publish: true
---

# Daily Agenda

<span class="related-pages">#plugin/calendar #plugin/periodic-notes</span>

Using the default `Daily-notes` plugin, **templates** with syntax like
`{{date+14d:YYYY-MM-DD}}` won't load dates properly. Nevertheless, **Liam Cain**,
author of both the [Calendar Plugin](https://github.com/liamcain/obsidian-calendar-plugin)
and [Periodic Notes Plugin](https://github.com/liamcain/obsidian-periodic-notes), has
written code to create new daily notes (using both plugins) using the `date+Xd` format.
Therefore, if you want to use this format instead of the standard `Daily-notes` syntax,
make sure new notes are created via one of these two plugins, and not `Daily-notes`.

- **Calendar Plugin**: Just tap the day on the Calendar UI and a new daily note will be created
- **Periodic Notes Plugin**: Install, migrate from `Daily-notes` if needed, and tap the new `Open Today` ribbon on the left-side dock. Below is an example if today was August 14, 2021.

|                 | Daily Notes                      | Calendar                         | Periodic Notes                   |
| --------------- | -------------------------------- | -------------------------------- | -------------------------------- |
| template syntax | `due on {{date+14d:YYYY-MM-DD}}` | `due on {{date+14d:YYYY-MM-DD}}` | `due on {{date+14d:YYYY-MM-DD}}` |
| output          | `due on {{date+14d:YYYY-MM-DD}}` | `due on 2021-08-28`              | `due on 2021-08-28`              |

## Example Daily Agenda **template**

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
