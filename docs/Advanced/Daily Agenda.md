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

If you want to use the default `Daily-notes` plugin, the workaround is replacing unsupported syntax with [[Custom Filters|custom filtering]] expression.
For example, `due before {{date+14d:YYYY-MM-DD}}` can be replaced with

```markdown
filter by function task.due.moment?.isBefore(moment("{{date:YYYY-MM-DD}}").add(14, 'days'), 'day') || false
```

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

## Troubleshooting Daily Agenda queries

### Instruction contains unexpanded template text

<!-- If the above heading name changes, please update the source code,
so that the new URL is shown in the error message below. -->

To guard against accidental running of Tasks searches on template files, all built-in Tasks date searches check for text that looks like template rules.

If found, they will refuse to run the search, as experience has found that the results are rarely what the user intended.

The error message will then contain this text:

<!-- snippet: TemplatingPluginTools.test.TemplatingPluginTools_date_templating_error_sample_for_docs.approved.text -->
```text
Instruction contains unexpanded template text: "<%" - and cannot be interpreted.

Possible causes:
- The query is an a template file, and is not intended to be searched.
- A command such as "Replace templates in the active file" needs to be run.
- The core "Daily notes" plugin is in use, and the template contained
  date calculations that it does not support.
- Some sample template text was accidentally pasted in to a tasks query,
  instead of in to a template file.

See: https://publish.obsidian.md/tasks/Advanced/Instruction+contains+unexpanded+template+text
```
<!-- endSnippet -->

> [!released]
> The check for unexpanded template text was introduced in Tasks 5.0.0.
