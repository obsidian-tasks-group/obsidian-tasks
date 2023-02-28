# FAQs

<!-- markdownlint-disable MD024 -->
<!--                      MD024/no-duplicate-heading/no-duplicate-header Multiple headings with the same content -->

## How does Tasks handle status changes?

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

## How do I enable hidden debugging/visualisation facilities?

> [!Released]
> Introduced in Tasks 1.26.0.

There are some hidden Tasks settings options to turn on some hidden facilities to aid visualising the behaviour of the plugin.

The default values are:

```json
  "debugSettings": {
    "ignoreSortInstructions": false,
    "showTaskHiddenData": false
  }
```

The `data.json` file needs to be edited manually to turn these on: The options are not exposed in the settings UI.

This is what these options do:

- `ignoreSortInstructions`:
  - Turns off all sorting of tasks, that is, it disables both the default sort order and the default sort order.
  - This can be useful if you need a stable order of tasks in order to easily inspect the impact of editing a task line.
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

## How do I add a new field to the Task class?

- In [tests/Task.test.ts](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/tests/Task.test.ts):
  - Add a new failing block to the `'identicalTo'` section.
  - Here is an existing example: ['should check path'](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/5b0831c36a80c4cde2d64a6cd281bb4b51e9a142/tests/Task.test.ts#L834-L840).
- In [src/Task.ts](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/src/Task.ts), update `Task.identicalTo()`:
  - Once you have a failing test in [tests/Task.test.ts](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/tests/Task.test.ts), implement the check for changed value of your new field in `Task.identicalTo()`.
  - This important method is used to detect whether any edits of any kind have been made to a task, to detect whether task block results need to be updated.
  - Here is the code for the method as of 2022-11-12:
    - [Task.identicalTo() in 5b0831c36a80c4cde2d64a6cd281bb4b51e9a142](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/5b0831c36a80c4cde2d64a6cd281bb4b51e9a142/src/Task.ts#L732-L802)
- In [tests/TestingTools/TaskBuilder.ts](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/tests/TestingTools/TaskBuilder.ts):
  - Add the new field and a corresponding method.
  - Keep the same field order as in the `Task` class.
  - Update the `build()` method.
- In [tests/TestingTools/TaskBuilder.test.ts](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/tests/TestingTools/TaskBuilder.test.ts):
  - If the code in TaskBuild will be non-trivial, first add a failing test for it.

## How do I add a new task filter?

All the following steps would be done in the same branch, for inclusion in the same pull request.

### Update src/

- Implement the search filter:
  - Add to  [src/Query/Filter](https://github.com/obsidian-tasks-group/obsidian-tasks/tree/main/src/Query/Filter) a  new class that inherits [Field](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/src/Query/Filter/DateField.ts)
  - Typically, this can be done by inheriting one of the partial implementations:
    - [DateField.ts](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/src/Query/Filter/DateField.ts)
    - [TextField.ts](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/src/Query/Filter/TextField.ts)
    - [MultiTextField.ts](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/src/Query/Filter/MultiTextField.ts)
    - [FilterInstructionsBasedField.ts](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/src/Query/Filter/FilterInstructionsBasedField.ts)
- Add the new class to [src/Query/FilterParser.ts](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/src/Query/FilterParser.ts)

### Update tests/

Write tests as you go.

Ideally, write a failing test first, and then implement the minimum code for the failing test to pass.

For help on writing and running the tests, see [[Maintaining the tests]]

- Add to [tests/Query/Filter](https://github.com/obsidian-tasks-group/obsidian-tasks/tree/main/tests/Query/Filter) a new test file.
  - This should focus on testing whether or not individual Task objects, with carefully selected sample date, match the filter.
  - Think about edge cases.
- Add the new instruction(s) to  'Query parsing' test in  [tests/Query.test.ts](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/tests/Query.test.ts)
  - This verifies that the new filter instruction has been correctly wired in to the Query class.

### Update doc/

It can be worth writing the documentation first, to ensure that you can explain the new feature clearly before implementing it.

For help on editing the documentation, see [[Updating documentation]]

- Document the new instruction(s) in [docs/queries/filters.md](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/docs/queries/filters.md)
  - Add the placeholder to indicate which version the feature will be released in: see [[Updating documentation#Version numbers in documentation]]
- Add the new instruction(s) to [docs/quick-reference/index.md](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/docs/quick-reference/index.md)

### Examples Pull Requests

- [#1098](https://github.com/obsidian-tasks-group/obsidian-tasks/pull/1098) feat: Add filename filter
  - This shows adding a brand new Field class, so shows all the steps above.
- [#1228](https://github.com/obsidian-tasks-group/obsidian-tasks/pull/1228) feat: Add 4 instructions: '(done|due|date|start) date is invalid'
  - This adds several new instructions via the DateField class, which implements most of the date-based filters.
  - It was sufficient to add tests of the new feature in just one of the instructions implemented via DateField.
  - It also shows adding a file to the sample vault, to demonstrate and test the new feature.

## How do I add one-click support for new themes or snippets for custom statuses?

### Update tests/

- Add a new test block to generate files for inclusion in docs:
  - See examples in [tests/DocsSamplesForStatuses.test.ts](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/tests/DocsSamplesForStatuses.test.ts)
  - Section = `describe('Theme', () => {`
  - After implementing the code below, run the tests
  - Run the new test and approve all the output files
  - (By adding the tests first, the new code will be consistent with old)

### Update src/

- Add a file that contains the checkbox info
  - Be sure to check for ones which should be IN_PROGRESS, DONE or CANCELLED
  - Example: [src/Config/Themes/MinimalThemeCollection.ts](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/src/Config/Themes/MinimalThemeCollection.ts)
- Add the new source file to [src/Config/Themes/index.ts](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/src/Config/Themes/index.ts)
- Add a button to the Status Settings
  - See examples in [src/Config/SettingsTab.ts](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/src/Config/SettingsTab.ts)
  - See 'Add all Status types supported by Minimal Theme'

### Update sample vault: resources/sample_vaults/Tasks-Demo/

- Open the vault folder in Obsidian
- Install latest version of theme or snippet
- Create a sample note for users to test
- Embed the approved file showing the tasks with supported statuses in it
  - for an example, see [resources/sample_vaults/Tasks-Demo/Styling](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/resources/sample_vaults/Tasks-Demo/Styling) for `Theme - Minimal Theme.md`
    - `include:` then `DocsSamplesForStatuses.test.Theme_Things Tasks.approved.md`

### Update doc/

- Create a reference note
  - for example: [docs/reference/status-collections/minimal-theme.md](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/docs/reference/status-collections/minimal-theme.md)
  - Best to copy and paste an existing one
  - Embed the 2 blocks of text in it, for example:
    - `snippet:` then `DocsSamplesForStatuses.test.Theme_Minimal Text.approved.txt`
    - `include:` then `DocsSamplesForStatuses.test.Theme_Minimal Table.approved.md`
- Save a screenshot of the supported checkboxes, displayed with just the theme or snippet enabled
- Add the theme-specific screenshot to the reference documentation
- Update any images in the screenshots that show all the available 'One Click' buttons

### Finishing off

- Run `mdsnippets` to replace the `include: ....md` lines with embedded text.
- Make sure the sample vault is left with:
  - Default Theme enabled
  - No custom checkbox CSS Snippets enabled
- Create a branch
- Commit the changes to the branch
- Create a pull request

## How do I test a GitHub build of the Tasks plugin?

First...

1. Go to the [Verify Commit actions page](https://github.com/obsidian-tasks-group/obsidian-tasks/actions/workflows/verify.yml).
2. Click on the build of the code version you want to test. For example, you might click on the build for a particular pull request, or the most recent build on `main`.

Then do one of the following options...

### Option 1: Download Tasks-Demo test vault with the build's Tasks plugin installed

1. In the Artifacts section at the bottom, click on the link whose name starts with **Tasks-Demo-...**, for example  **Tasks-Demo-VerifyCommit-Build1367-Run1**.
    - This will download a zip file containing a copy of the Tasks-Demo sample vault, including the build of the plugin.
    - The numbers in the file name will vary.
2. Optionally, rename the zip file to give it a meaningful name.
    - For example, you could append 'testing PR 1234 - nicer styling'.
3. Expand the zip file.
    - It will create a folder of the same name.
4. Open the expanded folder in Obsidian:
    - Open Obsidian
    - Click 'Open another vault' button
    - Click 'Open folder as vault' button
    - Navigate to the downloaded folder
    - Click 'Open'

### Option 2: Download the built plugin to add to your vault

You can use these steps to install the built plugin either in to the Tasks-Demo vault inside a clone of the [obsidian-tasks repo](https://github.com/obsidian-tasks-group/obsidian-tasks) or in to one of your own vaults.

1. In the Artifacts section at the bottom, click on **dist-verified** to download a build of the plugin.
2. Optionally, rename the zip file to give it a meaningful name.
    - For example, you could append 'testing PR 1234 - nicer styling'.
3. Expand the downloaded zip file
4. Copy the files in the expanded folder to the `.obsidian/plugins/obsidian-tasks-plugin/` folder in your vault, over-writing the previous files.
5. Restart Obsidian.

## How do I smoke-test the Tasks plugin?

Follow the steps in `resources/sample_vaults/Tasks-Demo/Manual Testing/Smoke Testing the Tasks Plugin.md`.

## How do I make a release?

1. Go to the [CodeQL Actions page](https://github.com/obsidian-tasks-group/obsidian-tasks/actions/workflows/codeql-analysis.yml) and click `Run workflow` to run the CodeQL checks
    - Wait for them to succeed
    - If they fail, put the release on hold and fix any issues first. (Failures are very rare.)
2. Check out the `main` branch
3. Check for the current version in [package.json](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/package.json) (for example, `1.4.1`) and decide on a next version
    - Backwards incompatible change: increase major version
    - New functionality: increase minor version
    - Only bug fixes: increase patch version
4. Having decided on the new version, replace all `X.Y.Z` in the documentation with the new version number.
5. Check the current version of the obsidian dependency in [package.json](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/package.json) (for example, `0.13.21`)
6. Run `./release.sh <new tasks version> <obsidian version>`
    - Make sure there are no uncommitted changes. Stash them if necessary.
7. Wait for [GitHub Actions](https://github.com/obsidian-tasks-group/obsidian-tasks/actions/workflows/release.yml) to create the new release
8. Update the release description with the changes of the release, which will be a Draft.
    - On the release page, GitHub provides a button to auto-generate release notes which works nicely as a good starting point.
9. When you are happy with the release notes, hit the Publish button.
    - At this point, GitHub will send an email automatically to everyone who is subscribed to Tasks releases.
10. Optional: Post to
    - Obsidian Discord
        - Add a post in the `#updates` channel, with detail about the release
        - Add a one-liner in the `#task-management` channel, linking to the first post
    - r/ObsidianMD on Reddit
    - Obsidian Forum Share & Showcase section
    - etc.

## How do I update the Tables of Contents in CONTRIBUTING and similar?

These are markdown files written for contributors, and intended to be viewed on GitHub.
To make it easy to see their structure, they have a machine-generated Table of Contents ("ToC").

The ToCs will eventually be automated automatically via GitHub Actions, but for now, the following needs to be done in order to update them:

1. Install [MarkdownSnippets](https://github.com/SimonCropp/MarkdownSnippets), also known as `mdsnippets`
2. Run:

```bash
mdsnippets && yarn run lint:markdown && git add --renormalize .
```

The background to this is in [PR #1248](https://github.com/obsidian-tasks-group/obsidian-tasks/pull/1248).

<!-- markdownlint-enable MD024 -->
<!--                     MD024/no-duplicate-heading/no-duplicate-header Multiple headings with the same content -->
