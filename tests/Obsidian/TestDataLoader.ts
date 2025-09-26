import fs from 'fs';
import path from 'path';

import type { SimulatedFile } from './SimulatedFile';
import type { TestDataName } from './AllCacheSampleData';

export class TestDataLoader {
    static get(testDataName: TestDataName): SimulatedFile {
        const filePath = this.path(testDataName);
        if (!fs.existsSync(filePath)) {
            throw new Error(`Test data not found: '${testDataName}'.`);
        }

        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }

    public static path(testDataName: TestDataName) {
        return path.resolve(__dirname, `./__test_data__/${testDataName}.json`);
    }

    public static markdownPath(_testDataName: TestDataName) {
        return `Test Data/${_testDataName}.md`;
    }
}
