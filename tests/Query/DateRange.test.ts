import moment from 'moment';
import { DateRange } from '../../src/Query/DateRange';
import { DateParser } from '../../src/Query/DateParser';

function testDateRange(dateRange: DateRange, start: string, end: string) {
    expect(dateRange.start).toBeDefined();
    expect(dateRange.end).toBeDefined();
    expect(dateRange.start.format('YYYY-MM-DD HH:mm')).toStrictEqual(`${start} 00:00`);
    expect(dateRange.end.format('YYYY-MM-DD HH:mm')).toStrictEqual(`${end} 00:00`);
}

describe('DateRange - absolute date ranges', () => {
    it('should return date range', () => {
        const dateRange = new DateRange(moment('2023-09-28'), moment('2023-10-01'));
        testDateRange(dateRange, '2023-09-28', '2023-10-01');
    });
});

describe('DateRange - relative date ranges', () => {
    beforeAll(() => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date(2021, 9, 6)); // 2021-10-06
    });

    afterAll(() => {
        jest.useRealTimers();
    });

    it.each([
        ['week', '2021-10-04', '2021-10-10'],
        ['month', '2021-10-01', '2021-10-31'],
        ['quarter', '2021-10-01', '2021-12-31'],
        ['year', '2021-01-01', '2021-12-31'],
    ])('should build relative date range ("%s")', (range, start, end) => {
        const dateRange = DateRange.buildRelative(range as moment.unitOfTime.StartOf);
        testDateRange(dateRange, start, end);
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
        const lastMonth = DateRange.buildRelative('month');
        lastMonth.subtract('month');
        testDateRange(lastMonth, '2021-03-01', '2021-03-31');

        const nextMonth = DateRange.buildRelative('month');
        nextMonth.add('month');
        testDateRange(nextMonth, '2021-05-01', '2021-05-31');

        const lastQuarter = DateRange.buildRelative('quarter');
        lastQuarter.subtract('quarter');
        testDateRange(lastQuarter, '2021-01-01', '2021-03-31');

        // This test case is not representative eg won't fail without the fix
        // because the length of Q2 in days is same as Q3.
        const nextQuarter = DateRange.buildRelative('quarter');
        nextQuarter.add('quarter');
        testDateRange(nextQuarter, '2021-07-01', '2021-09-30');
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
