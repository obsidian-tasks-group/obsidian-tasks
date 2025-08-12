---
publish: true
aliases:
  - What is New?/Changelog
---

# Changelog

See also [[Breaking Changes]]: Tasks releases with version numbers ending `.0.0` indicate that an update to user vaults may be required.

_In recent [Tasks releases](https://github.com/obsidian-tasks-group/obsidian-tasks/releases)..._

## 7.x releases

- 7.21.0:
  - Add support for [[Links]] in custom filters, sorting and grouping.
  - The Tasks API can now edit existing task lines with [[Tasks Api#`editTaskLineModal(taskLine string) Promise<string>;`|editTaskLineModal()]].
  - Documentation: New section: [[Auto-Suggest#Managing Auto-Suggest Conflicts With Other Plugins|Managing Auto-Suggest conflicts with other plugins]].
- 7.20.0:
  - Add [[Presets]] feature to save commonly used task query instructions.
  - Document [[Missing tags, aliases and cssclasses in some Obsidian 1.9.x versions]] - for Insider users of Obsidian 1.9.x.
  - [[Line Continuations]] can now be used in the [[Query File Defaults]] property `TQ_extra_instructions`.
  - [[Check your Statuses]] report now contains samples of each status, and a convenient search to test them.
  - Add German translation of [[Settings]], [[Editing a Status]] and [[Check your Statuses]].
- 7.19.0:
  - New setting to [[Recurring Tasks#Remove scheduled date on recurrence|remove scheduled date on recurrence]].
- 7.17.0:
  - Add Belarusian, Russian, and Ukrainian translations of [[Settings]], [[Editing a Status]] and [[Check your Statuses]].
- 7.16.0:
  - Add `task.lineNumber`.
    - This enables `sort by function task.lineNumber` to override the [[Sorting#Default sort order|default sort order]].
    - See [[Filters#Line Number|filters]], [[Sorting#Line Number|sorting]] and [[Grouping#Line Number|grouping]].
- 7.15.0:
  - Tasks now requires [Obsidian 1.4.0](https://obsidian.md/changelog/2023-08-31-desktop-v1.4.5/) or newer.
  - **Translations**:
    - Add Chinese translation of [[Settings]], [[Editing a Status]] and [[Check your Statuses]].
    - See [contribute translations](https://publish.obsidian.md/tasks-contributing/Translation/Contribute+translationsl) and [related pages](https://publish.obsidian.md/tasks-contributing/Translation/About+Translation) on the [Contributing](https://publish.obsidian.md/tasks-contributing/Welcome) guide.
    - We will gradually translate more parts of Tasks in forthcoming releases.
  - Use **standardised properties** in Query files to customise your searches:
    - New [[Query File Defaults]] facility allows easy customising of all the Tasks searches in a file, by editing properties, for example, to customise the [[layout]].
    - New [[Query File Defaults#Command Add all Query File Defaults properties|'Add all Query File Defaults properties' command]]
    - Use the [[Meta Bind plugin]] to [[make a query user interface]].
  - Use **custom properties** in Query files to customise your searches:
    - Add `query.file.hasProperty()` and `query.file.property()` in custom filters
    - Add `{{query.file.hasProperty()}}` and `{{query.file.property()}}` in placeholders - see [[Obsidian Properties#Using Query Properties in Searches|Using Query Properties in Placeholders]].
  - [[Placeholders]] can now contain functions and contain expressions.
- 7.14.0:
  - Add [[Editing Dates#Date-picker on task dates|date picker]] to Reading mode and Tasks query search results.
- 7.13.0:
  - Add [[Create or edit Task#Date picker|date picker]] to the Edit Task modal.
- 7.12.0:
  - Add [[Layout#Hide and Show Tree|display of nested tasks]] in search results, with `show tree`
- 7.11.0:
  - Add [[Sorting#Random sorting|random sorting]], with `sort by random`
- 7.10.0:
  - Add [[Editing Dates#Context menu on task dates|right-click context menu on dates]] in Reading and Query Results views.
- 7.9.0:
  - Add [[Layout|hide and show]] instructions `hide on completion` and `show on completion`.
  - Add one-click support for the [[Border Theme|Border]] theme.
- 7.8.0.
  - Add [[On Completion]] facility, to tidy up your completed tasks.
- 7.7.0:
  - Queries can now use values in [[Obsidian Properties]] (also known as YAML or frontmatter) for filtering, sorting and grouping.
- 7.6.0:
  - New setting to [[Use Filename as Default Date#Additional date format|recognise extra date format]] in file name as default date.
  - Add page [[Request a Feature]].
- 7.5.0:
  - Add page [[Missing tasks in callouts with some Obsidian 1.6.x versions]].
  - [[Auto-Suggest#How do I see fewer or more suggestions?|Auto-suggest]] now defaults to at most 20 suggestions in new vaults. This is useful when adding dependencies.
- 7.4.0:
  - [[Auto-Suggest#Details|Auto-suggest]] now supports [[Task Dependencies#Option 2 Use the Auto-Suggest feature|task dependencies]].
- 7.3.0:
  - Add 'Remove date' option to the [[Postponing|postpone]] right-click menu in search results.
- 7.2.0:
  - Much improved layout of the [[Create or edit Task]] modal, on mobile devices.
  - Add [[Tasks Api#`executeToggleTaskDoneCommand (line string, path string) => string;`|executeToggleTaskDoneCommand()]] to the Tasks API.
  - Add [[Tasks Api#Auto-Suggest Integration|Auto-Suggest Integration]], to enable other plugins to use Tasks' [[Auto-Suggest]] facility.
- 7.1.0:
  - Much improved layout of the [[Create or edit Task]] modal, on desktop machines.
  - Add access keys for Created, Done and Cancelled dates in [[Create or edit Task]].
- 7.0.0:
  - Major improvements to [[Combining Filters]] with Boolean combinations. See [[Combining Filters#Appendix Changes to Boolean filters in Tasks 7.0.0|the appendix]] for details.
  - Add documentation page (now in [[Useful Links]]), with links to write-ups,  talks and sample vaults from users.

## 6.x releases

- 6.1.0:
  - Add support for [[task dependencies]]:
    - First, [[Create or edit Task#Dependencies|use 'Create or edit Task']] to define the order in which you want to work on a set of tasks, using two new task emojis: 🆔  and ⛔.
    - Then adjust your searches, perhaps to see tasks that are [[Filters#Blocking Tasks|blocking others]], or hide ones that are [[Filters#Blocked Tasks|blocked]] and cannot yet be done.
  - `query.allTasks` is now available in custom searches: see [[Query Properties#Values for Query Search Properties|query search properties]].
  - The [[Create or edit Task]] modal now fully supports editing of statuses, updating done and cancelled dates, and creating new recurrences. See the [[Create or edit Task#Status|section on editing statuses]] for details and tips.
  - Add HTML samples in [[Styling#Sample HTML Full mode|full]] and [[Styling#Sample HTML Short mode|short]] modes to demonstrate custom styling.
- 6.0.0:
  - Add [[Custom Sorting|custom sorting]].
  - Document the [[Sorting#Default sort order|default sort order]].
  - **Warning**: This release contains some **bug-fixes** to **sorting** and to treatment of **invalid dates**.
    - The changes are detailed in [[Breaking Changes#Tasks 6.0.0 (19 January 2024)|breaking changes]], even though they are all improvements to the previous behaviour.
    - You may need to update any CSS snippets for the Edit or Postpone buttons: see [[How to style buttons]].

## 5.x releases

- 5.6.0:
  - The [[Postponing|postpone]] menu now offers `today` and `tomorrow`.
- 5.5.0:
  - The [[Create or edit Task]] modal can now edit Created, Done and Cancelled dates
  - Add support for [[Dates#Cancelled date|cancelled dates]].
- 5.4.0:
  - Add [[Layout#Full Mode|'full mode']] to turn off `short mode`.
  - Add any [[Grouping|'group by']] and [[Sorting|'sort by']] instructions to [[Explaining Queries|explain]] output.
  - Recurrence now works well [[Recurring Tasks and Custom Statuses#When DONE is not followed by TODO or IN_PROGRESS|when DONE is not followed by TODO or IN_PROGRESS]].
- 5.3.0:
  - Add [[Postponing|postpone button]] to Tasks query results.
  - Add [[Toggling and Editing Statuses#'Change task status' context menu|'change task status' menu]] to Reading mode and Tasks query results.
  - Add documentation section about [[About Editing|editing tasks]].
  - Add documentation page about [[toggling and editing statuses]].
- 5.2.0:
  - Most query instructions can now include [[About Queries#Capitals in Query Instructions - Case Insensitivity|capital letters]].
- 5.1.0:
  - Add 'Review and check your Statuses' facility: see [[Check your Statuses|check your statuses]].
  - Enable [[Custom Filters|custom filters]] and [[Custom Grouping|custom grouping]] to use [[Query Properties|query properties]] directly - no placeholders required.
- 5.0.0:
  - Add [[Line Continuations|line continuations]].
    - **Warning**: This is a [[Line Continuations#Appendix Updating pre-5.0.0 searches with trailing backslashes|potentially breaking change]] if you search for backslash (`\`) characters.
  - Document [[Comments#Inline comments|inline comments]]
  - Document [[Recurring Tasks and Custom Statuses|recurring tasks and custom statuses]]
  - Add new Help pages [[Known Limitations]] and [[Breaking Changes]].

## 4.x releases

- 4.9.0:
  - Add [[Task Properties|task properties]] `task.priorityNameGroupText` and `task.status.typeGroupText`, for example:
    - `group by function task.priorityNameGroupText + ': ' + task.status.typeGroupText`
  - Add [[Task Properties#Values in TasksDate Properties|task date properties]] for categorising dates, for example:
    - `group by function task.due.category.groupText`
  - Add [[Task Properties#Values in TasksDate Properties|task date properties]] for grouping dates by [time from now](https://momentjs.com/docs/#/displaying/fromnow/), for example:
    - `group by function task.due.fromNow.groupText`
- 4.8.0:
  - Add [[Query Properties#Values for Query File Properties|query file properties]] `query.file.pathWithoutExtension` and `query.file.filenameWithoutExtension`
  - Add [[Task Properties#Values for File Properties|task file properties]] `task.file.pathWithoutExtension` and `task.file.filenameWithoutExtension`
- 4.7.0:
  - Use [[Query Properties]] and [[Placeholders]] to filter and group with the query's file path, root, folder and name.
- 4.6.0:
  - Add `on or before` and `on or after` to [[Filters#Date search options|date search options]]
  - Add `in or before` and `in or after` to [[Filters#Date range options|date range search options]]
- 4.5.0:
  - Support task in list items starting with [[Getting Started#Finding tasks in your vault|`+` signs]]
- 4.4.0:
  - Support [[Expressions#More complex expressions|variables, if statements, and functions]] in custom filters and groups
- 4.3.0:
  - Bug fixes, usability improvements and `explain` support for [[Regular Expressions|regular expression]] searches
- 4.2.0:
  - Add [[Custom Filters|custom filtering]]
- 4.1.0:
  - Add [[Layout|hide and show tags]]
- 4.0.0:
  - Add [[Custom Grouping|custom grouping]], using [[Task Properties|task properties]] to create [[expressions|expressions]] - the start of a whole new [[About Scripting|scripting]] world in Tasks!

## 3.x releases

- 3.9.0:
  - Add [[Priority#Priorities and Order|lowest and highest]] priorities
- 3.8.0:
  - Add [[Limiting#Limit number of tasks in each group|limiting tasks per group]]
  - Add option to control the [[Recurring Tasks#Order of the new task|order of new recurring tasks]]
- 3.7.0:
  - Add [[Grouping#Reversing groups|reverse sorting of groups]]
- 3.6.0:
  - Add [[Grouping#Urgency|group by urgency]]
  - Add [[Sorting#Recurrence|sort by recurring]]
- 3.5.0:
  - New [[Global Query]] facility.
- 3.4.0:
  - Clicking on a [[Backlinks|Backlink]] jumps to the exact task line.
  - Tasks now requires at least Obsidian 1.1.1.
- 3.3.0:
  - Multiple [[About Task Formats|Task Format]] support - starting with [[Dataview Format]].
