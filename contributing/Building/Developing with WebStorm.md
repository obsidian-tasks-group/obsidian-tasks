# Developing with JetBrains WebStorm

Some tips for anyone using the JetBrains WebStorm IDE.

## Make WebStorm ignore non-code directories

When you search for code or use the built-in refactorings, the results can be considerably slower and often incorrect if WebStorm searches machine-generated code.

The solution is to tell WebStorm to ignore all the directories that contain code which is not part of the Task plugin's source code.

The following directories contain code we don't want WebStorm to index:

- `contributing/.obsidian/plugins`
- `docs/.obsidian/plugins`
- `node_modules`
  - after [[Setting up build environment]]
- `coverage`
  - if you have generated [[Test Coverage]] reports.

For each of the above directories:

- Find it in the `Project` view
- Right-click on the directory
- Select `Mark Directory as` -> `Excluded`

## Make WebStorm ignore non-code files

Tell it to ignore `main.js`:

- After you have built the plugin, find `main.js` in the `Project` view
- Right-click on it and select `Override File Type`
- Select `Plain Text`
