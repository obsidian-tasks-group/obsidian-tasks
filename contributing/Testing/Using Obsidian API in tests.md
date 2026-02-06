---
publish: true
---

# Using Obsidian API in tests

<span class="related-pages">#testing/automated-testing</span>

## Overview

The Tasks plugin uses data created by the Obsidian API. The Obsidian API does not run in any test framework.

So we need a way to access Obsidian-generated data in our tests. This page tries to describe this mechanism.

1. [resources/sample_vaults/Tasks-Demo/Test Data](https://github.com/obsidian-tasks-group/obsidian-tasks/tree/main/resources/sample_vaults/Tasks-Demo/Test%20Data) contains representative samples Markdown files for different scenarios.
2. The process described in [[#Test data creation sequence]] below converts these files to matching JSON files in [tests/Obsidian/\_\_test_data\_\_](https://github.com/obsidian-tasks-group/obsidian-tasks/tree/main/tests/Obsidian/__test_data__).
3. In tests:
    - use [MockDataLoader.get()](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/tests/TestingTools/MockDataLoader.ts) and some related functions, to read in the saved JSON files to memory
    - `MockDataName` in [AllCacheSampleData.ts](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/tests/Obsidian/AllCacheSampleData.ts) shows the names of all the available files, in a type-safe way.
4. See all the [uses of this data so far, in Tasks tests](https://github.com/search?type=code&q=repo%3Aobsidian-tasks-group%2Fobsidian-tasks+%2F%28AllMockDataNames%7Cbuilder.mockData%7CgetMockDataAndReadTasks%7ClistPathAndData%7CMockDataLoader%7CMockDataName%7CreadTasksFromSimulatedFile%7CSimulatedFile%29%2F).

## Examples

- Test data: [as markdown files](https://github.com/obsidian-tasks-group/obsidian-tasks/tree/main/resources/sample_vaults/Tasks-Demo/Test%20Data)
- Test data: [as json files](https://github.com/obsidian-tasks-group/obsidian-tasks/tree/main/tests/Obsidian/__test_data__)

### Using Obsidian's data about an individual test Markdown file

Example of the lowest-level usage, returning a [SimulatedFile](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/tests/Obsidian/SimulatedFile.ts) object:

<!-- snippet: MockDataLoader.get -->
```ts
const data1 = MockDataLoader.get('one_task');
```
<!-- endSnippet -->

Create a `TasksFile` object for one of the Markdown files, for writing tests:

<!-- snippet: getTasksFileFromMockData -->
```ts
const tasksFile = getTasksFileFromMockData('no_yaml');
```
<!-- endSnippet -->

Obtain all the `Task` objects from one of the Markdown files:

<!-- snippet: readTasksFromSimulatedFile -->
```ts
const tasks = readTasksFromSimulatedFile('multiple_headings');
```
<!-- endSnippet -->

Obtain both a `TasksFile` object for one of the Markdown files, and the corresponding `Task` objects:

<!-- snippet: getMockDataAndReadTasks -->
```ts
const { data, tasks } = getMockDataAndReadTasks('callout_labelled');
```
<!-- endSnippet -->

### Using Obsidian's data about some or all the test Markdown files

Obtain all the `Task` objects from all the Markdown files:

<!-- snippet: readAllTasksFromAllSimulatedFiles -->
```ts
const allTasks = readAllTasksFromAllSimulatedFiles();
```
<!-- endSnippet -->

Iterate over all the Markdown files:

<!-- snippet: AllMockDataNames -->
```ts
let output = '';
AllMockDataNames.forEach((file) => {
    const tasksFile = getTasksFileFromMockData(file);
    output += visualiseLinks(tasksFile.outlinksInProperties, file);
});
verifyMarkdown(output);
```
<!-- endSnippet -->

Selectively iterate over data from several of the Markdown files - using `listPathAndData()` to include each test file's `path` in the test name:

<!-- snippet: iterate-over-multiple-SimulatedFiles -->
```ts
it.each(
    listPathAndData([
        'yaml_custom_number_property', // no tags value in frontmatter
        'yaml_tags_field_added_by_obsidian_but_not_populated',
        'yaml_tags_had_value_then_was_emptied_by_obsidian',
        'yaml_tags_is_empty_list',
        'yaml_tags_is_empty',
    ]),
)('should provide empty list if no tags in frontmatter: "%s"', (_path: string, testDataName: MockDataName) => {
    const tasksFile = getTasksFileFromMockData(testDataName);
    expect(tasksFile.frontmatter.tags).toEqual([]);
});
```
<!-- endSnippet -->

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
