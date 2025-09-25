import fs from 'fs';
import path from 'path';

import type { SimulatedFile } from './SimulatedFile';

export class TestDataLoader {
    static get(filename: string): SimulatedFile {
        const filePath = path.resolve(__dirname, `./__test_data__/${filename}.json`);
        if (!fs.existsSync(filePath)) {
            throw new Error(`Test data not found: '${filename}'.`);
        }

        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
}
