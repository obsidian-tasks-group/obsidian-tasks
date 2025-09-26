import fs from 'fs';
import path from 'path';

import type { SimulatedFile } from '../Obsidian/SimulatedFile';
import type { MockDataName } from '../Obsidian/AllCacheSampleData';

/**
 * Utility class for loading and caching test data saved from Obsidian's cache.
 *
 * This class provides access to serialized Obsidian metadata and file content
 * from JSON files in the `tests/Obsidian/__test_data__` directory.
 *
 * Data is cached after first load to:
 *   - improve performance for repeated access,
 *   - (eventually) simplify the implementation of some of the mock functions in
 *     `tests/__mocks__/obsidian.ts`.
 */
export class MockDataLoader {
    private static cache = new Map<MockDataName, SimulatedFile>();

    /**
     * Get test data for the specified mock data name.
     *
     * Data is loaded from the corresponding JSON file and cached for subsequent calls.
     * The same object instance is returned for multiple calls with the same name.
     *
     * @param testDataName - The name of the test data to load (corresponds to filename without extension)
     * @returns The simulated file data including cached metadata, file path, and content
     * @throws Error if the test data file is not found
     */
    static get(testDataName: MockDataName): SimulatedFile {
        if (this.cache.has(testDataName)) {
            return this.cache.get(testDataName)!;
        }

        const filePath = this.path(testDataName);
        if (!fs.existsSync(filePath)) {
            throw new Error(`Test data not found: '${testDataName}'.`);
        }

        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        this.cache.set(testDataName, data);

        return data;
    }

    /**
     * Get the file system path to the JSON pickle file for the given test data name.
     *
     * @param testDataName - The name of the test data
     * @returns Absolute path to the corresponding JSON file in `__test_data__` directory
     */
    public static path(testDataName: MockDataName) {
        return path.resolve(__dirname, `../Obsidian/__test_data__/${testDataName}.json`);
    }

    /**
     * Get the original Markdown file path in the test vault for the given test data name.
     *
     * @param _testDataName - The name of the test data (parameter prefixed with _ to indicate it's used in path construction)
     * @returns Path to the original Markdown file in the `Test Data/` directory
     */
    public static markdownPath(_testDataName: MockDataName) {
        return `Test Data/${_testDataName}.md`;
    }
}
