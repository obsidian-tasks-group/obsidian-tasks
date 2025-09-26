import fs from 'fs';
import path from 'path';

import type { SimulatedFile } from '../Obsidian/SimulatedFile';
import type { MockDataName } from '../Obsidian/AllCacheSampleData';

// TODO Rename this and its test to MockDataLoader
// TODO Add jsdoc
// TODO Do performance measurements, before and after addition of this class
// TODO Cache the loaded data
export class MockDataLoader {
    static get(testDataName: MockDataName): SimulatedFile {
        const filePath = this.path(testDataName);
        if (!fs.existsSync(filePath)) {
            throw new Error(`Test data not found: '${testDataName}'.`);
        }

        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }

    public static path(testDataName: MockDataName) {
        return path.resolve(__dirname, `../Obsidian/__test_data__/${testDataName}.json`);
    }

    public static markdownPath(_testDataName: MockDataName) {
        return `Test Data/${_testDataName}.md`;
    }
}
