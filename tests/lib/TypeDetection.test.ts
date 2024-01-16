import { getValueType } from '../../src/lib/TypeDetection';
import { TasksDate } from '../../src/Scripting/TasksDate';

describe('getValueType', () => {
    it('should name values correctly', () => {
        expect(getValueType(5)).toEqual('number');
        expect(getValueType(true)).toEqual('boolean');
        expect(getValueType('stuff')).toEqual('string');

        expect(getValueType([])).toEqual('Array');
        expect(getValueType({})).toEqual('Object');

        expect(getValueType(undefined)).toEqual('undefined');
        expect(getValueType(null)).toEqual('null');

        expect(getValueType(new TasksDate(null))).toEqual('TasksDate');
        // TODO "function"
        // TODO "symbol"
        // TODO "bigint"
        // TODO Number
    });
});
