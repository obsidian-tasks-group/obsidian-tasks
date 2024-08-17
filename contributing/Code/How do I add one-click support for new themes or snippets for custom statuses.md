# How do I add one-click support for new themes or snippets for custom statuses?

## Update src/

- **Add a file that contains the checkbox data**
  - Be sure to check for ones which should be `IN_PROGRESS`, `DONE` or `CANCELLED`
  - Example: [src/Config/Themes/MinimalThemeCollection.ts](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/src/Config/Themes/MinimalThemeCollection.ts)
- Add the new source file to [src/Config/Themes/index.ts](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/src/Config/Themes/index.ts)
- Add a button to the **Status Settings**
  - Add the new theme to the list of supported themes in [src/Config/SettingsTab.ts](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/src/Config/SettingsTab.ts)
  - Search for `Aura Theme` to find the list.

## Update tests/

- Add a line for the new theme in [tests/DocumentationSamples/DocsSamplesForStatuses.test.ts](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/tests/DocumentationSamples/DocsSamplesForStatuses.test.ts)
- Run the new test and approve all the output files
  - See [[Approval Tests#Running Approval Tests]].

## Update sample vault: resources/sample_vaults/Tasks-Demo/

- **Install the theme or snippet**
  - Open the vault folder in Obsidian
  - Install latest version of the new theme or snippet
- **Create a sample note**
  - Make a copy of [docs/Reference/Status Collections/Aura Theme.md](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/docs/Reference/Status%20Collections/Aura%20Theme.md), named for the new theme
  - Using case-sensitive find-and-replace, update all references from `Aura` and `aura` to the new theme.
  - Update the GitHub URL at the start.
  - So long as the filenames are correct on any commented-out lines containing `include:` and `snippet:`, the boilerplate text will be updated automatically by steps in [[#Finishing off]] below.
- **Update the embedded snippets on the sample vault**
  - Run `mdsnippets` to replace the `include: ....md` lines with embedded text.
    - See [[Embedding code and data in documentation#Running mdsnippets]]
  - This is needed so we have correct status samples in the new sample note.

## Update doc/

- **Create a reference note**
  - Make a copy of [docs/Reference/Status Collections/Aura Theme.md](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/docs/Reference/Status%20Collections/Aura%20Theme.md), named for the new theme
  - Using case-sensitive find-and-replace, update all references from `Aura` and `aura` to the new theme.
  - Update the GitHub URL in the table at the start.
  - So long as the filenames are correct on any commented-out lines containing `include:` and `snippet:`, the boilerplate text will be updated automatically by steps in [[#Finishing off]] below.
- **Make and update Screenshots**
  - Save a screenshot of the supported checkboxes, displayed with just the **new theme or snippet enabled**
    - See [docs/images/theme-aura-reading-view.png](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/docs/images/theme-aura-reading-view.png) for an example.
  - Switch back to the **Default theme**
  - Add the theme-specific screenshot to the reference documentation
  - Update any images in the screenshots that show all the available 'One Click' buttons
- **Links**
  - Add the new page to the list at the bottom of [docs/Reference/Status Collections](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/docs/Reference/Status%20Collections/About%20Status%20Collections.md).
  - Note the new feature in [docs/What is New/Changelog.md](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/docs/What%20is%20New/Changelog.md)

For example:

```text
- X.Y.Z:
  - Add one-click support for the [[Border Theme|Border]] theme.
```

## Finishing off

- **Update the embedded snippets on the docs**
  - Run `mdsnippets` to replace the `include: ....md` lines with embedded text.
    - See [[Embedding code and data in documentation#Running mdsnippets]]
- **Reset the vault**
  - Make sure the sample vault is left with:
    - Default Theme enabled
    - No custom checkbox CSS Snippets enabled
- **Create a pull request**
  - Create a branch
  - Commit the changes to the branch
  - Push to your fork.
  - Create a pull request
