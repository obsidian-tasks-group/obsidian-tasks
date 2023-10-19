# Developing with JetBrains WebStorm

<span class="related-pages">#tools/webstorm</span>

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

## Stop WebStorm complaining about invalid JavaScript in markdown

We have started using JavaScript as the fenced code block language for some documentation, as it makes the published documentation easier to read. The syntax highlighting breaks up an otherwise long wall of text.  

If using WebStorm IDE, it will complain very strongly about invalid JavaScript, as the code samples include things like `group by function` and line continuation characters.

So turn off this checking, follow the steps in [Disable coding assistance in code blocks](https://www.jetbrains.com/help/webstorm/markdown.html#disable-injection-in-code-blocks).
