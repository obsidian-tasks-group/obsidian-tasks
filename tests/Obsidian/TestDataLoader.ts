import fs from 'fs';
import path from 'path';

import type { SimulatedFile } from './SimulatedFile';
import type { TestDataName } from './AllCacheSampleData';

export class TestDataLoader {
    static get(testDataName: TestDataName): SimulatedFile {
        const filePath = path.resolve(__dirname, `./__test_data__/${testDataName}.json`);
        if (!fs.existsSync(filePath)) {
            throw new Error(`Test data not found: '${testDataName}'.`);
        }

        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
}
