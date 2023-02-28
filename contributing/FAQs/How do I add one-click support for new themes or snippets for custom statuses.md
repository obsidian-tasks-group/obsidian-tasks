# How do I add one-click support for new themes or snippets for custom statuses?

## Update tests/

- Add a new test block to generate files for inclusion in docs:
  - See examples in [tests/DocsSamplesForStatuses.test.ts](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/tests/DocsSamplesForStatuses.test.ts)
  - Section = `describe('Theme', () => {`
  - After implementing the code below, run the tests
  - Run the new test and approve all the output files
  - (By adding the tests first, the new code will be consistent with old)

## Update src/

- Add a file that contains the checkbox info
  - Be sure to check for ones which should be IN_PROGRESS, DONE or CANCELLED
  - Example: [src/Config/Themes/MinimalThemeCollection.ts](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/src/Config/Themes/MinimalThemeCollection.ts)
- Add the new source file to [src/Config/Themes/index.ts](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/src/Config/Themes/index.ts)
- Add a button to the Status Settings
  - See examples in [src/Config/SettingsTab.ts](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/src/Config/SettingsTab.ts)
  - See 'Add all Status types supported by Minimal Theme'

## Update sample vault: resources/sample_vaults/Tasks-Demo/

- Open the vault folder in Obsidian
- Install latest version of theme or snippet
- Create a sample note for users to test
- Embed the approved file showing the tasks with supported statuses in it
  - for an example, see [resources/sample_vaults/Tasks-Demo/Styling](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/resources/sample_vaults/Tasks-Demo/Styling) for `Theme - Minimal Theme.md`
    - `include:` then `DocsSamplesForStatuses.test.Theme_Things Tasks.approved.md`

## Update doc/

- Create a reference note
  - for example: [docs/reference/status-collections/minimal-theme.md](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/docs/reference/status-collections/minimal-theme.md)
  - Best to copy and paste an existing one
  - Embed the 2 blocks of text in it, for example:
    - `snippet:` then `DocsSamplesForStatuses.test.Theme_Minimal Text.approved.txt`
    - `include:` then `DocsSamplesForStatuses.test.Theme_Minimal Table.approved.md`
- Save a screenshot of the supported checkboxes, displayed with just the theme or snippet enabled
- Add the theme-specific screenshot to the reference documentation
- Update any images in the screenshots that show all the available 'One Click' buttons

## Finishing off

- Run `mdsnippets` to replace the `include: ....md` lines with embedded text.
- Make sure the sample vault is left with:
  - Default Theme enabled
  - No custom checkbox CSS Snippets enabled
- Create a branch
- Commit the changes to the branch
- Create a pull request
