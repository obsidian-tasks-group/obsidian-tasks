import { TestDataLoader } from './TestDataLoader';

describe('TestDataLoader', () => {
    it('should throw Error if unknown file requested', () => {
        const t = () => {
            TestDataLoader.get('i_do_not_exist');
        };
        expect(t).toThrow(Error);
        expect(t).toThrowError("Test data not found: 'i_do_not_exist'.");
    });
});
