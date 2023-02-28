# How does Tasks handle status changes?

You can toggle a task‘s status by:

1. using the command (may be bound to a hotkey),
2. clicking on a checkbox of an inline task in Reading mode,
3. clicking on a checkbox of an inline task in Live Preview, or
4. clicking on a checkbox in query results (same for Reading mode and Live Preview).

The code is located as follows:

- For 1.: [src/Commands/ToggleDone.ts](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/src/Commands/ToggleDone.ts)
- Numbers 2. and 4. use a checkbox created by `TaskLineRenderer.renderTaskLine`. There, the checkbox gets a click event handler.
- For 3.: [src/LivePreviewExtension.ts](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/src/LivePreviewExtension.ts)

Toggle behavior:

- Number 1. toggles the line directly where the cursor is in the file inside Obsidian's vault.
- The click event listener of 2. and 4. uses `File::replaceTaskWithTasks()`. That, in turn, updates the file in Obsidian‘s Vault (like 1, but it needs to find the correct line).
- Number 3. toggles the line directly where the checkbox is on the "document" of CodeMirror (the library that Obsidian uses to show text on screen). That, in turn, updates the file in Obsidian's Vault.

Obsidian writes the changes to disk at its own pace.
