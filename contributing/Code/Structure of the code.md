---
publish: true
---

# Structure of the code

See how the [[#src/]] and [[#tests/]] directories are structured.

## Directory structure

### src/

The `src/` directory contains the code that **implements** the Tasks plugin.

- [main.ts](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/src/main.ts)
  - The `TasksPlugin` class.
- [Api/](https://github.com/obsidian-tasks-group/obsidian-tasks/tree/main/src/Api):
  - The [Tasks API](https://publish.obsidian.md/tasks/Advanced/Tasks+Api)
- [Commands/](https://github.com/obsidian-tasks-group/obsidian-tasks/tree/main/src/Commands)
  - Obsidian commands implemented by Tasks.
- [Config/](https://github.com/obsidian-tasks-group/obsidian-tasks/tree/main/src/Config)
  - Storage and UI for [user settings](https://publish.obsidian.md/tasks/Getting+Started/Settings).
  - [Themes/](https://github.com/obsidian-tasks-group/obsidian-tasks/tree/main/src/Config/Themes):
    - The [Supported CSS Snippets and Themes](https://publish.obsidian.md/tasks/Reference/Status+Collections/About+Status+Collections).
    - See [[How do I add one-click support for new themes or snippets for custom statuses]].
- [Layout/](https://github.com/obsidian-tasks-group/obsidian-tasks/tree/main/src/Layout)
  - Related to the types of data that can be [shown and hidden](https://publish.obsidian.md/tasks/Queries/Layout) in searches.
  - Heavily used by:
    - `src/TaskSerializer/`
    - `src/Renderer`
- [Obsidian/](https://github.com/obsidian-tasks-group/obsidian-tasks/tree/main/src/Obsidian)
  - Code which is heavily dependent on Obsidian types such as `App`, `Modal`, `Plugin`, `MarkdownPostProcessorContext`.
  - Has virtually no test coverage, unfortunately, as much of the Obsidian API code requires a graphical environment and is not available outside a vault.
  - However, we are very gradually increasing coverage by mocking little bits of Obsidian in [tests/\__mocks\__/obsidian.ts](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/tests/__mocks__/obsidian.ts).
- [Query/](https://github.com/obsidian-tasks-group/obsidian-tasks/tree/main/src/Query)
  - Code for parsing queries.
  - The main class is [Query](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/src/Query/Query.ts).
  - [Explain/](https://github.com/obsidian-tasks-group/obsidian-tasks/tree/main/src/Query/Explain)
    - Implementation of the [explain](https://publish.obsidian.md/tasks/Queries/Explaining+Queries) instruction.
  - [Filter/](https://github.com/obsidian-tasks-group/obsidian-tasks/tree/main/src/Query/Filter)
    - Contains abstract base class [Field](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/src/Query/Filter/Field.ts)
    - There is one derived `Field` class for each of the task properties that can be searched/filtered, sorted and grouped.
    - Example: [PriorityField.ts](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/src/Query/Filter/PriorityField.ts).
  - [Group/](https://github.com/obsidian-tasks-group/obsidian-tasks/tree/main/src/Query/Group)
    - Implementation of the grouping mechanism.
    - [TaskGroups](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/src/Query/Group/TaskGroups.ts) is the starting point for grouping tasks.
  - [Matchers/](https://github.com/obsidian-tasks-group/obsidian-tasks/tree/main/src/Query/Matchers)
    - Abstraction for the different types of [text filters](https://publish.obsidian.md/tasks/Queries/Filters#Text%20filters):
      - Substring search
      - Regular expression search
  - [Presets](https://github.com/obsidian-tasks-group/obsidian-tasks/tree/main/src/Query/Presets)
    - Implementation details of the [presets](https://publish.obsidian.md/tasks/Queries/Presets) facility, for declaring re-usable, named instruction blocks.
    - See also these in `src/Config/`:
      - [PresetsSettingsUI.ts](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/src/Config/PresetsSettingsUI.ts)
      - [PresetsSettingsUI.scss](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/src/Config/PresetsSettingsUI.scss)
  - [Sort/](https://github.com/obsidian-tasks-group/obsidian-tasks/tree/main/src/Query/Sort)
    - Implementation of the sorting mechanism.
    - [Sort.ts](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/src/Query/Sort/Sort.ts) is the starting point for sorting tasks.
- [Renderer/](https://github.com/obsidian-tasks-group/obsidian-tasks/tree/main/src/Renderer)
  - Convert Query results and Task objects to HTML.
- [Scripting/](https://github.com/obsidian-tasks-group/obsidian-tasks/tree/main/src/Scripting)
  - Implementation of [Scripting](https://publish.obsidian.md/tasks/Scripting/About+Scripting) and [Placeholder](https://publish.obsidian.md/tasks/Scripting/Placeholders)code.
  - This is where the custom filters, sorters and groups are implemented.
- [Statuses/](https://github.com/obsidian-tasks-group/obsidian-tasks/tree/main/src/Statuses)
  - Core and Custom [Statuses](https://publish.obsidian.md/tasks/Getting+Started/Statuses).
- [Suggestor/](https://github.com/obsidian-tasks-group/obsidian-tasks/tree/main/src/Suggestor)
  - Implementation of [Auto-Suggest](https://publish.obsidian.md/tasks/Editing/Auto-Suggest).
- [Task/](https://github.com/obsidian-tasks-group/obsidian-tasks/tree/main/src/Task)
  - [Task](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/src/Task/Task.ts) class and related code.
- [TaskSerializer/](https://github.com/obsidian-tasks-group/obsidian-tasks/tree/main/src/TaskSerializer)
  - Reading and writing of Task objects in supported [Task formats](https://publish.obsidian.md/tasks/Reference/Task+Formats/About+Task+Formats).
- [lib/](https://github.com/obsidian-tasks-group/obsidian-tasks/tree/main/src/lib)
  - Assorted helper code.
- [ui/](https://github.com/obsidian-tasks-group/obsidian-tasks/tree/main/src/ui)
  - The ['Create or edit Task' Modal](https://publish.obsidian.md/tasks/Editing/Create+or+edit+Task).
  - [EditInstructions/](https://github.com/obsidian-tasks-group/obsidian-tasks/tree/main/src/ui/EditInstructions)
    - [TaskEditingInstruction](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/src/ui/EditInstructions/TaskEditingInstruction.ts) is an abstraction for making a single edit to a task.
  - [Menus/](https://github.com/obsidian-tasks-group/obsidian-tasks/tree/main/src/ui/Menus)
    - Various context menus.
    - [TaskEditingMenu](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/src/ui/Menus/TaskEditingMenu.ts) is an abstraction for context menus on a Task instance, based upon `TaskEditingInstruction`.

### tests/

The `tests/` directory contains the code that **tests** the Tasks plugin, using mechanisms described in [[About Testing]]

Most sub-directories here have the same structure and purpose as their counterparts described above in [[#src/]].

The remainder are:

- [\_\_mocks\_\_/obsidian.ts](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/tests/__mocks__/obsidian.ts)
  - Mock implementations of a few types and functions from the Obsidian API.
- [\_\_test_data\_\_/MockDataForTogglingTasks/](https://github.com/obsidian-tasks-group/obsidian-tasks/tree/main/tests/__test_data__/MockDataForTogglingTasks)
  - Some data used by [File.test.ts](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/tests/Obsidian/File.test.ts).
- [global-setup.js](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/tests/global-setup.js)
  - Enforce all tests to run in UTC time.
- [CustomMatchers/](https://github.com/obsidian-tasks-group/obsidian-tasks/tree/main/tests/CustomMatchers)
  - Jest custom matchers for Tasks classes.
- [Obsidian/\_\_test_data\_\_/](https://github.com/obsidian-tasks-group/obsidian-tasks/tree/main/tests/Obsidian/__test_data__)
  - JSON files saved from the Obsidian cache, to enable testing against some of the Obsidian API.
  - See [[Using Obsidian API in tests]].
- [TestingTools/](https://github.com/obsidian-tasks-group/obsidian-tasks/tree/main/tests/TestingTools)
  - Many helper functions to streamling testing.
