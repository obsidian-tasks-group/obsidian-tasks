<h1 align="center">Obsidian Tasks</h1>

<p align="center">Task management for the <a href="https://obsidian.md/">Obsidian</a> knowledge base.</p>

<p align="center"><a href="https://publish.obsidian.md/tasks/">Documentation</a></p>

Track tasks across your entire vault. Query them and mark them as done wherever you want. Supports due dates, recurring tasks (repetition), done dates, sub-set of checklist items, and filtering.

_You can toggle the task status in any view or query and it will update the source file._

---

For changes in each release, please check the releases page: <https://github.com/obsidian-tasks-group/obsidian-tasks/releases>

---

## Screenshots

- _All screenshots assume the [global filter](https://publish.obsidian.md/tasks/Getting+Started/Global+Filter) `#task` which is not set by default (see also [installation](https://publish.obsidian.md/tasks/Installation/Installation))._
- _The theme is default Obsidian theme._

![ACME Tasks](https://github.com/obsidian-tasks-group/obsidian-tasks/raw/gh-pages/docs/images/acme.png)
The `ACME` note has some tasks.

![Important Project Tasks](https://github.com/obsidian-tasks-group/obsidian-tasks/raw/gh-pages/docs/images/important_project.png)
The `Important Project` note also has some tasks.

![Tasks Queries](https://github.com/obsidian-tasks-group/obsidian-tasks/raw/gh-pages/docs/images/tasks_queries.png)
The `Tasks` note gathers all tasks from the vault and displays them using queries.

![Create or Edit Modal](https://github.com/obsidian-tasks-group/obsidian-tasks/raw/gh-pages/docs/images/modal.png)
The `Tasks: Create or edit` command helps you when editing a task.

## Installation

Follow the steps below to install Tasks.

1. Search for "Tasks" in Obsidian's community plugins browser
2. Enable the plugin in your Obsidian settings (find "Tasks" under "Community plugins").
3. Check the settings. It makes sense to set the global filter early on (if you want one).
4. Replace the "Toggle checkbox status" hotkey with "Tasks: Toggle Done".
    - I recommend you remove the original toggle hotkey and set the "Tasks" toggle to `Ctrl + Enter` (or `Cmd + Enter` on a mac).

## Getting Started

### Write some tasks

Create a few tasks in a Markdown note in your vault. For example:

```text
- [ ] Something non-important, with no date
- [ ] Remember to do that important thing - with a due date 📅 2022-12-17
- [ ] Send Kate a birthday card - with a scheduled date 🔁 every January on the 4th ⏳ 2023-01-04
```

Find out more in [Getting Started](https://publish.obsidian.md/tasks/Getting+Started/Getting+Started), and its sub-sections.

### Create your first Tasks search

And then write a Tasks search block somewhere in your Obsidian vault, to find the tasks that are interesting.

Here is an example that shows a few different features. View it in Reading or Live Preview modes to see the results.

````text
```tasks
# Only tasks that are not done, that is, which begin like this (but without the quotes):
#   '- [ ] ' or
#   '* [ ] ' or
#   '1. [ ] '
# Indented tasks are supported, but only single-line tasks.
not done

# Tasks due today or earlier:
due before tomorrow

# Restrict to at most 100 tasks.
# If you ask Tasks to display many hundreds or thousands of tasks,
# Obsidian's editing performance really slows down.
limit 100

# Group and sort the output:
group by filename
sort by due reverse
sort by description

# Optionally, ask Tasks to explain how it interpreted this query:
explain
```
````

Find out more in [Queries](https://publish.obsidian.md/tasks/Queries/Queries), and its sub-sections.

## Documentation

For user documentation, please check [https://publish.obsidian.md/tasks/](https://publish.obsidian.md/tasks/).

## Development

Clone the repository, run `yarn` to install the dependencies, and run `yarn dev` to compile the plugin and watch file changes.

Then see [the Contributing Guide](https://publish.obsidian.md/tasks-contributing).

## Donations

The plugin is completely free to use, and very willingly developed and supported by Clare Macrae since May 2022.

If you have particularly been helped by the Tasks plugin and wish to support it, please see the following link.

- <https://github.com/sponsors/claremacrae>

Donations will go towards my computing costs and licenses for development tools that I use for productivity.

Thank you 🙏.
