# How do I enable hidden debugging/visualisation facilities?

<span class="related-pages">#debugging</span>

> [!Released]
> Introduced in Tasks 1.26.0.

## The settings

There are some hidden Tasks settings options to turn on some hidden facilities to aid visualising the behaviour of the plugin.

The default values are:

```json
  "debugSettings": {
    "ignoreSortInstructions": false,
    "showTaskHiddenData": false,
    "recordTimings": false
  }
```

The `data.json` file needs to be edited manually to turn these on: The options are not exposed in the settings UI.

This is what these options do:

## ignoreSortInstructions

- `ignoreSortInstructions`:
  - Turns off all sorting of tasks, that is, it disables both the default sort order and the default sort order.
  - This can be useful if you need a stable order of tasks in order to easily inspect the impact of editing a task line.

## showTaskHiddenData

- `showTaskHiddenData`:
  - This adjusts the rendering of Task objects to display some extra information, to make the plugin's behaviour easier to inspect.
  - The values display are:
    - Line 1:
      - `task.lineNumber`
      - `task.sectionStart`
      - `task.sectionIndex`
      - `task.originalMarkdown`
    - Line 2:
      - `task.path`
      - `task.precedingHeader`
  - Here is an example of the extra output:<br>
  🐛 **11** . 4 . 6 . '`- [ ] #task Feed the baby 🔽 📅 2021-11-21`'<br>'`a/b/c.d`' > '`Previous Heading`'<br>

## recordTimings

- `recordTimings`:
  - See [[Console timing facilities in Tasks]]
