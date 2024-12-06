import type { CachedMetadata } from 'obsidian';
import { logging } from '../../src/lib/logging';
import { FileParser } from '../../src/Obsidian/FileParser';
import { setCurrentCacheFile } from '../__mocks__/obsidian';

export interface SimulatedFile {
    cachedMetadata: CachedMetadata;
    filePath: string;
    fileContents: string;
}

/**
 For explanations on how to test code that is using Obsidian API
 refer to https://publish.obsidian.md/tasks-contributing/Testing/Using+Obsidian+API+in+tests

 TODO: Make the order of values in the generated code stable.
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
