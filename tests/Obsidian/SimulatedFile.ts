import type { CachedMetadata } from 'obsidian';
import type { Task } from 'Task/Task';
import { logging } from '../../src/lib/logging';
import { FileParser } from '../../src/Obsidian/FileParser';
import { setCurrentCacheFile } from '../__mocks__/obsidian';
import { MockDataLoader } from '../TestingTools/MockDataLoader';
import type { MockDataName } from './AllCacheSampleData';

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
 * - {@link MockDataLoader}
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
 * @param {MockDataName} filename - Read from a JSON file in `tests/Obsidian/__test_data__`
 * @return {Task[]} The parsed tasks extracted from the file content.
 *
 * Example use:
 * ```typescript
 *         const tasks = readTasksFromSimulatedFile('numbered_list_items_with_paren');
 * ```
 *
 * For more info, see https://publish.obsidian.md/tasks-contributing/Testing/Using+Obsidian+API+in+tests.
 */
export function readTasksFromSimulatedFile(filename: MockDataName): Task[] {
    const testData = MockDataLoader.get(filename);
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
