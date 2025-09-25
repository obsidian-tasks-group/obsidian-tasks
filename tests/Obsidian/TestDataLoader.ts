import type { SimulatedFile } from './SimulatedFile';

export class TestDataLoader {
    static get(filename: string): SimulatedFile {
        throw new Error(`Test data not found: '${filename}'.`);
    }
}
