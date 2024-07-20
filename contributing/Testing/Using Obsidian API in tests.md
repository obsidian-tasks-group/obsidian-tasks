---
publish: true
---

# Using Obsidian API in tests

<span class="related-pages">#testing/automated-testing</span>

## Test data creation sequence
  
If using this on an Obsidian version newer than the one in saved `tests/Obsidian/__test_data__/*.ts`, go to Settings → Files and links → Advanced → Rebuild vault cache.
  
- Create a sample markdown file in Tasks demo vault (root/Test Data/) with the simplest content to represent your test case. Choose a meaningful file name in snake case. See example in `Test Data/one_task.md`.
  - There is a Templater template that may help with creating a new file, for single-tasks cases: `resources/sample_vaults/Tasks-Demo/_meta/templates/Test Data file.md`.
- Open any other note in the vault, just so that Templater will run.
  - The Templater plugin requires a note to be open. The script won't edit the file, so it doesn't matter which file you have open.
- Run the command `Templater: Insert _meta/templates/convert_test_data_markdown_to_js.md`.
  - Or type the short-cut `Ctrl + Cmd + Alt + T` / `Ctrl + Ctrl + Alt + T`.
- This will convert all the files `root/Test Data/*.md` to test functions in `tests/Obsidian/__test_data__/*.ts`.
- Run `yarn lint:test-data` to standardise the formatting in the generated TypeScript files.
- Use the data in the test with `readTasksFromSimulatedFile()`, the argument is the constant you created in the previous step.
- Remember to commit the markdown file in the demo vault and the file with the simulated data.

> TODO: Make the order of values in the generated code stable.
