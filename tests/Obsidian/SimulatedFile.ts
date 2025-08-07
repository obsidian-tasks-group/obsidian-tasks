import type { CachedMetadata } from 'obsidian';
import { logging } from '../../src/lib/logging';
import { FileParser } from '../../src/Obsidian/FileParser';
import { setCurrentCacheFile } from '../__mocks__/obsidian';

/**
 * @file This file provides functions for creating {@link Task} objects from data in `tests/Obsidian/__test_data__`.
 *
 * - See [Background information](https://publish.obsidian.md/tasks-contributing/Testing/Using+Obsidian+API+in+tests).
 * - See also {@link getTasksFileFromMockData} and {@link listPathAndData}.
 */

/**
 * Represent Obsidian-specific data read from a JSON file in `tests/Obsidian/__test_data__/`
 *
 * See the related functions that uses some or all of this data:
 * - {@link readTasksFromSimulatedFile}
 * - {@link getTasksFileFromMockData}
 * - {@link listPathAndData}
 *
 * @property cachedMetadata - Snapshot of Obsidian's CachedMetadata for the source note.
 * @property filePath - The path of the source note in the test vault.
 * @property fileContents - The complete content of the source note.
 * @property getAllTags - Used for mocking the result of `getAllTags()` in tests.
 * @property parseFrontMatterTags - Used for mocking the result of `parseFrontMatterTags()` in tests.
 * @property resolveLinkToPath - Used for mocking this.app.metadataCache.getFirstLinkpathDest(linkpath, sourcePath).
 *
 * For more info, see https://publish.obsidian.md/tasks-contributing/Testing/Using+Obsidian+API+in+tests.
 */
export interface SimulatedFile {
    cachedMetadata: CachedMetadata;
    filePath: string;
    fileContents: string;
    getAllTags: string[];
    parseFrontMatterTags: string[] | null;
    resolveLinkToPath: { [key: string]: string | null };
}

/**
 * Read tasks from Obsidian-specific data read from a JSON file in `tests/Obsidian/__test_data__`.
 *
 * @param {SimulatedFile} testData - Read from a JSON file in `tests/Obsidian/__test_data__`
 * @return {ParsedTasks} The parsed tasks extracted from the file content.
 *
 * Example use:
 * ```typescript
 * import numbered_list_items_with_paren from './__test_data__/numbered_list_items_with_paren.json';
 * ...
 *         const data = numbered_list_items_with_paren;
 *         const tasks = readTasksFromSimulatedFile(data);
 * ```
 *
 * For more info, see https://publish.obsidian.md/tasks-contributing/Testing/Using+Obsidian+API+in+tests.
 */
export function readTasksFromSimulatedFile(testData: SimulatedFile) {
    const logger = logging.getLogger('testCache');
    setCurrentCacheFile(testData);
    const fileParser = new FileParser(
        testData.filePath,
        testData.fileContents,
        testData.cachedMetadata.listItems!,
        logger,
        testData.cachedMetadata,
        errorReporter,
    );
    return fileParser.parseFileContent();
}

function errorReporter() {
    return;
}
