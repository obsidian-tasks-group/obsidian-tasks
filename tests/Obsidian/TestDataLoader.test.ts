import { TestDataLoader } from './TestDataLoader';

import one_task from './__test_data__/one_task.json';

describe('TestDataLoader', () => {
    it('should return data for a known file', () => {
        const readFromFile = TestDataLoader.get('one_task');

        expect(readFromFile).toStrictEqual(one_task);
    });

    it('should throw Error if unknown file requested', () => {
        const t = () => {
            TestDataLoader.get('i_do_not_exist');
        };
        expect(t).toThrow(Error);
        expect(t).toThrowError("Test data not found: 'i_do_not_exist'.");
    });
});
