import moment from 'moment';
import { DateRange } from '../../src/Query/DateRange';
import { DateParser } from '../../src/Query/DateParser';
import { TaskRegularExpressions } from '../../src/Task';

function testParsingDateRange(input: string, expectedStart: string, expectedEnd: string) {
    // Act
    const result = DateParser.parseDateRange(input);

    // Assert
    expect(result.start).toBeDefined();
    expect(result.end).toBeDefined();
    const startFmt = result.start.format(TaskRegularExpressions.dateFormat);
    const endFmt = result.end.format(TaskRegularExpressions.dateFormat);
    expect([startFmt, endFmt]).toStrictEqual([expectedStart, expectedEnd]);
}

describe('DateRange - absolute date ranges', () => {
    it('should return date ranges at midnight', () => {
        // Act
        const result = new DateRange(moment('2023-09-28'), moment('2023-10-01'));

        // Assert
        expect(result.start).toBeDefined();
        expect(result.end).toBeDefined();
        expect(result.start.format('YYYY-MM-DD HH:mm')).toStrictEqual('2023-09-28 00:00');
        expect(result.end.format('YYYY-MM-DD HH:mm')).toStrictEqual('2023-10-01 00:00');
    });
});

describe('DateParser - relative date ranges', () => {
    beforeAll(() => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date(2021, 9, 6)); // 2021-10-06
    });

    afterAll(() => {
        jest.useRealTimers();
    });

    it('should return relative date range at midnight (week)', () => {
        const dateRangeToParse = 'this week';
        const parsedDateRange = DateParser.parseDateRange(dateRangeToParse);
        expect(parsedDateRange.start.format('YYYY-MM-DD HH:mm')).toStrictEqual('2021-10-04 00:00');
        expect(parsedDateRange.end.format('YYYY-MM-DD HH:mm')).toStrictEqual('2021-10-10 00:00');
    });
});

describe('Date Parser - correct delta for next & last month & quarter (Today is 2021-04-03)', () => {
    beforeAll(() => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date(2021, 3, 3)); // 2021-04-03
    });

    afterAll(() => {
        jest.useRealTimers();
    });

    it('should return longer range even if the current range is shorter in days', () => {
        testParsingDateRange('last month', '2021-03-01', '2021-03-31');
        testParsingDateRange('next month', '2021-05-01', '2021-05-31');
        testParsingDateRange('last quarter', '2021-01-01', '2021-03-31');
        testParsingDateRange('next quarter', '2021-07-01', '2021-09-30');
        // The latest test case is not representative eg won't fail without the fix
        // because the length of Q2 in days is same as Q3.
    });
});

describe('DateParser - specific date ranges', () => {
    it.each([
        ['2018-W38', '2018-09-17', '2018-09-23'],
        ['2010-11', '2010-11-01', '2010-11-30'],
        ['2019-Q3', '2019-07-01', '2019-09-30'],
        ['2007', '2007-01-01', '2007-12-31'],
    ])(
        'specific range %s: should return %s and %s at midnight',
        (range: string, rangeStart: string, rangeEnd: string) => {
            const parsedDateRange = DateParser.parseDateRange(range);
            expect(parsedDateRange.start.format('YYYY-MM-DD HH:mm')).toStrictEqual(`${rangeStart} 00:00`);
            expect(parsedDateRange.end.format('YYYY-MM-DD HH:mm')).toStrictEqual(`${rangeEnd} 00:00`);
        },
    );
});
