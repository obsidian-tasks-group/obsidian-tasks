import { renameKeyInRecordPreservingOrder } from '../../src/lib/RecordHelpers';

describe('renameKeyInRecordPreservingOrder', () => {
    it('should rename a key without changing the order of other keys', () => {
        const input = {
            a: 'apple',
            b: 'banana',
            c: 'cherry',
        };

        const result = renameKeyInRecordPreservingOrder(input, 'b', 'blueberry');

        expect(result).toEqual({
            a: 'apple',
            blueberry: 'banana',
            c: 'cherry',
        });

        // Ensure key order is preserved
        expect(Object.keys(result)).toEqual(['a', 'blueberry', 'c']);
    });
});
