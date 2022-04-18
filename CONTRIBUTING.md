# Contribution Guidelines Obsidian Tasks

## FAQs

### How does Tasks handle status changes?

You can toggle a task‘s status by:

1. using the command (may be bound to a hotkey),
2. clicking on a checkbox of an inline task in Reading mode,
3. clicking on a checkbox of an inline task in Live Preview, or
4. clicking on a checkbox in query results (same for Reading mode and Live Preview).

The code is located as follows:

-   For 1.: ``./src/Commands/ToggleDone.ts`
-   2. and 4. use a checkbox created by `Task.toLi()`. There, the checkbox gets a click event handler.
-   For 3.: `./src/LivePreviewExtension.ts`

Toggle behavior:

-   1. toggles the line directly where the cursor is. In the file inside Obsidian‘s vault.
-   The click event listener of 2. and 4. uses File::replaceTaskWithTasks(). That, in turn, updates the file in Obsidian‘s Vault (like 1, but it needs to find the correct line).
-   3. toggles the line directly where the checkbox is. On the „document“ of CodeMirror (the library that Obsidian uses to show text on screen). That, in turn, updates the file in Obsidian‘s Vault, somehow.

Obsidian writes the changes to disk at its own pace.

### How do I make a release?

1. Check out the `main` branch
2. Check for the current version in `package.json` (e.g. `1.4.1`) and decide on a next version
    - Backwards incompatible change: increase major version
    - New functionality: increase minor version
    - Only bug fixes: increase patch version
3. Check the current version of the obsidian dependency in `package.json` (e.g. `0.13.21`)
4. Run `./release.sh <new tasks version> <obsidian version>`
    - Make sure there are no uncommitted changes. Stash them if necessary.
5. Wait for [GitHub Actions](https://github.com/schemar/obsidian-tasks/actions/workflows/release.yml) to create the new release
6. Update the release description with the changes of the release
    - On the release page, GitHub provides a button to auto-generate release notes which works nicely.
    - Also update the attached zip file by adding the version number to the end of the name after the dash (e.g. `obsidian-tasks-1.4.1.zip`)
7. Optional: Post to
    - Obsidian Discord
    - r/ObsidianMD on Reddit
    - etc.
