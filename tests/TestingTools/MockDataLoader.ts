import fs from 'fs';
import path from 'path';

import type { SimulatedFile } from '../Obsidian/SimulatedFile';
import type { MockDataName } from '../Obsidian/AllCacheSampleData';

// TODO Rename this and its test to MockDataLoader
// TODO Add jsdoc
// TODO Do performance measurements, before and after addition of this class
export class MockDataLoader {
    private static cache = new Map<MockDataName, SimulatedFile>();

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

    public static path(testDataName: MockDataName) {
        return path.resolve(__dirname, `../Obsidian/__test_data__/${testDataName}.json`);
    }

    public static markdownPath(_testDataName: MockDataName) {
        return `Test Data/${_testDataName}.md`;
    }
}
