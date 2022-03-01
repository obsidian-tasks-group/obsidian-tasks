<h1 align="center">Obsidian Tasks</h1>

<p align="center">Task management for the <a href="https://obsidian.md/">Obsidian</a> knowledge base.</p>

<p align="center"><a href="https://schemar.github.io/obsidian-tasks/">Documentation</a></p>

Track tasks across your entire vault. Query them and mark them as done wherever you want. Supports due dates, recurring tasks (repetition), done dates, sub-set of checklist items, and filtering.

*You can toggle the task status in any view or query and it will update the source file.*

⚠️ **Tasks does not yet support Obsidian's "Live Preview" fully.**

---

For changes in each release, please check the releases page: https://github.com/schemar/obsidian-tasks/releases

---

## Screenshots

- *All screenshots assume the [global filter](#filtering-checklist-items) `#task` which is not set by default (see also [installation](#installation)).*
- *The theme is [Obsidian Atom](https://github.com/kognise/obsidian-atom).*

![ACME Tasks](https://github.com/schemar/obsidian-tasks/raw/main/resources/screenshots/acme.png)
The `ACME` note has some tasks.

![Important Project Tasks](https://github.com/schemar/obsidian-tasks/raw/main/resources/screenshots/important_project.png)
The `Important Project` note also has some tasks.

![Tasks Queries](https://github.com/schemar/obsidian-tasks/raw/main/resources/screenshots/tasks_queries.png)
The `Tasks` note gathers all tasks from the vault and displays them using queries.

![Create or Edit Modal](https://github.com/schemar/obsidian-tasks/raw/main/resources/screenshots/modal.png)
The `Tasks: Create or edit` command helps you when editing a task.

## Installation
Follow the steps below to install Tasks.

1. Search for "Tasks" in Obsidian's community plugins browser
2. Enable the plugin in your Obsidian settings (find "Tasks" under "Community plugins").
3. Check the settings. It makes sense to set the global filter early on (if you want one).
4. Replace the "Toggle checklist status" hotkey with "Tasks: Toggle Done".
    - I recommend you remove the original toggle hotkey and set the "Tasks" toggle to `Ctrl + Enter` (or `Cmd + Enter` on a mac).

## Documentation
For user documentation, please check [https://schemar.github.io/obsidian-tasks/](https://schemar.github.io/obsidian-tasks/).

## Development
Clone the repository, run `yarn` to install the dependencies, and run `yarn dev` to compile the plugin and watch file changes.

## Donations
The plugin is completely free to use. If you love it very much and want to pay it forward, please consider donating to an organization of your choice.
Two example organizations that you could consider donating to are the Wikimedia Foundation and the Electronic Frontiers Foundation:

1. [Support the Wikimedia Foundation](https://wikimediafoundation.org/support/)
2. [Support EFF](https://supporters.eff.org/donate/join-eff-today)
