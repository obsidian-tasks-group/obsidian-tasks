import { TasksFile } from '../../src/Scripting/TasksFile';
import type { SimulatedFile } from '../Obsidian/SimulatedFile';
import type { MockDataName } from '../Obsidian/AllCacheSampleData';
import { MockDataLoader } from './MockDataLoader';

/**
 * @file This file provides functions for testing {@link TasksFile} from data in `tests/Obsidian/__test_data__`.
 *
 * - See [Background information](https://publish.obsidian.md/tasks-contributing/Testing/Using+Obsidian+API+in+tests).
 * - See also {@link SimulatedFile} and {@link readTasksFromSimulatedFile}.
 */

/**
 * Retrieve a {@link TasksFile} instance from the provided mock data.
 *
 * Example use:
 *
 * ```typescript
 *         const tasksFile = getTasksFileFromMockData('example_kanban');
 * ```
 *
 * @param {MockDataName} testDataName - The name of the test data file.
 * @return {TasksFile} An instance of {@link TasksFile} initialized with the file path and cached metadata.
 *
 * For more info, see https://publish.obsidian.md/tasks-contributing/Testing/Using+Obsidian+API+in+tests.
 */
export function getTasksFileFromMockData(testDataName: MockDataName) {
    const data = MockDataLoader.get(testDataName);
    const cachedMetadata = data.cachedMetadata;
    return new TasksFile(data.filePath, cachedMetadata);
}

/**
 * Transform an array of {@link SimulatedFile} objects into an array of tuples containing file paths and data.
 *
 * This function is used to prepare {@link AllMockDataNames} for use with jest's it.each().
 *
 *    it.each(listPathAndData(AllMockDataNames))(
 *         'should be able to read tasks from all mock files: "%s"',
 *         (path: string, testDataName: MockDataName) => {
 *             const tasks = readTasksFromSimulatedFile(testDataName);
 *             const files_without_tasks = [
 *                 'Test Data/docs_sample_for_explain_query_file_defaults.md',
 *                 'Test Data/non_tasks.md',
 *                 'Test Data/numbered_tasks_issue_3481_searches.md',
 *             ];
 *             if (files_without_tasks.includes(path)) {
 *                 expect(tasks.length).toEqual(0);
 *             } else {
 *                 expect(tasks.length).toBeGreaterThan(0);
 *             }
 *         },
 *     );
 * ```
 *
 * It can also be used with specific test files:
 *
 * ```typescript
 *    it.each(
 *         listPathAndData([
 *             'yaml_custom_number_property', // no tags value in frontmatter
 *             'yaml_tags_field_added_by_obsidian_but_not_populated',
 *             'yaml_tags_had_value_then_was_emptied_by_obsidian',
 *             'yaml_tags_is_empty_list',
 *             'yaml_tags_is_empty',
 *         ]),
 *     )('should provide empty list if no tags in frontmatter: "%s"', (_path: string, testDataName: MockDataName) => {
 *         const tasksFile = getTasksFileFromMockData(testDataName);
 *         expect(tasksFile.frontmatter.tags).toEqual([]);
 *     });
 * ```
 *
 * @param {MockDataName[]} inputs - Array of {@link MockDataName} values.
 * @returns {[string, MockDataName][]} Array of tuples, where each tuple contains [filePath, MockDataName]
 *
 * For more info, see https://publish.obsidian.md/tasks-contributing/Testing/Using+Obsidian+API+in+tests.
 */
export function listPathAndData(inputs: MockDataName[]): [string, MockDataName][] {
    // We use map() to extract the path, to use it as a test name in it.each()
    return inputs.map((testDataName) => [MockDataLoader.markdownPath(testDataName), testDataName]);
}
