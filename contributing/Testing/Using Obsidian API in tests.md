---
publish: true
---

# Using Obsidian API in tests

<span class="related-pages">#testing/automated-testing</span>

## Overview

The Tasks plugin uses data created by the Obsidian API. The Obsidian API does not run in any test framework.

So we need a way to access Obsidian-generated data in our tests. This page tries to describe this mechanism.

1. [resources/sample_vaults/Tasks-Demo/Test Data](https://github.com/obsidian-tasks-group/obsidian-tasks/tree/main/resources/sample_vaults/Tasks-Demo/Test%20Data) contains representative samples Markdown files for different scenarios.
2. The process described in [[#Test data creation sequence]] converts these files to matching JSON files in [tests/Obsidian/\_\_test_data\_\_](https://github.com/obsidian-tasks-group/obsidian-tasks/tree/main/tests/Obsidian/__test_data__).
3. See all the [uses of this data so far, in Tasks tests](https://github.com/search?q=repo%3Aobsidian-tasks-group%2Fobsidian-tasks+__test_data__+language%3ATypeScript&type=code&l=TypeScript).

## Test data creation sequence
  
If using this on an Obsidian version newer than the one in saved `tests/Obsidian/__test_data__/*.json`, go to Settings → Files and links → Advanced → Rebuild vault cache.
  
- Create a sample markdown file in Tasks demo vault (root/Test Data/) with the simplest content to represent your test case. Choose a meaningful file name in snake case. See example in `Test Data/one_task.md`.
  - There is a Templater template that may help with creating a new file, for single-tasks cases: `resources/sample_vaults/Tasks-Demo/_meta/templates/Test Data file.md`.
- Open any other note in the vault, just so that Templater will run.
  - The Templater plugin requires a note to be open. The script won't edit the file, so it doesn't matter which file you have open.
- Run the command `Templater: Insert _meta/templates/convert_test_data_markdown_to_js.md`.
  - Or type the short-cut `Ctrl + Cmd + Alt + T` / `Ctrl + Ctrl + Alt + T`.
- This will convert all the files `root/Test Data/*.md` to test functions in `tests/Obsidian/__test_data__/*.json`.
- Use the data in the test with `readTasksFromSimulatedFile()`, the argument is the constant you created in the previous step.
- Remember to commit the markdown file in the demo vault and the file with the simulated data.
