import moment from 'moment';

import { getValueType } from '../../src/lib/TypeDetection';
import { TasksDate } from '../../src/Scripting/TasksDate';

describe('getValueType', () => {
    it('should name values correctly', () => {
        expect(getValueType(5)).toEqual('number');
        expect(getValueType(Number('5'))).toEqual('number');
        expect(getValueType(BigInt(9007199254740991))).toEqual('bigint');

        expect(getValueType(true)).toEqual('boolean');
        expect(getValueType('stuff')).toEqual('string');

        expect(getValueType([])).toEqual('Array');
        expect(getValueType(new Set([1, 2, 3]))).toEqual('Set');
        expect(
            getValueType(
                new Map([
                    [1, 'one'],
                    [2, 'two'],
                    [4, 'four'],
                ]),
            ),
        ).toEqual('Map');
        expect(getValueType({})).toEqual('Object');

        expect(getValueType(undefined)).toEqual('undefined');
        expect(getValueType(null)).toEqual('null');

        expect(getValueType(moment('2021-06-20'))).toEqual('Moment');
        expect(getValueType(new TasksDate(null))).toEqual('TasksDate');

        const squared = (x: number) => x * x;
        expect(squared(3)).toEqual(9);
        expect(getValueType(squared)).toEqual('function');

        // https://www.typescriptlang.org/docs/handbook/symbols.html
        expect(getValueType(Symbol('key'))).toEqual('symbol');
    });
});
