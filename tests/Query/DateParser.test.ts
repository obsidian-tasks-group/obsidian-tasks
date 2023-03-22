/**
 * @jest-environment jsdom
 */
import moment from 'moment';
import { DateParser } from '../../src/Query/DateParser';
import { TaskRegularExpressions } from '../../src/Task';

window.moment = moment;

function testParsingeSingleDate(input: string, result: string) {
    const moment = DateParser.parseDate(input);
    expect(moment.format(TaskRegularExpressions.dateFormat)).toEqual(result);
}

function testParsingDateRange(input: string, expectedStart: string, expectedEnd: string) {
    // Act
    const result = DateParser.parseDateRange(input);

    // Assert
    const start = result[0];
    const end = result[1];
    expect(start).toBeDefined();
    expect(end).toBeDefined();
    const startFmt = start.format(TaskRegularExpressions.dateFormat);
    const endFmt = end.format(TaskRegularExpressions.dateFormat);
    expect([startFmt, endFmt]).toStrictEqual([expectedStart, expectedEnd]);
}

describe('DateParser - single dates', () => {
    it('should parse a valid fixed date correctly', () => {
        const input = '2021-03-17';
        testParsingeSingleDate(input, input);
    });

    it('should recognise an invalid date correctly', () => {
        testParsingeSingleDate('2021-13-17', 'Invalid date');
    });

    it('should return date at midnight', () => {
        const dateToParse = '2023-07-08';
        const parsedDate = DateParser.parseDate(dateToParse);
        expect(parsedDate.format('YYYY-MM-DD HH:mm')).toStrictEqual('2023-07-08 00:00');
    });
});

describe('DateParser - date ranges', () => {
    it('should parse date range from absolute dates, supplied as words', () => {
        // Arrange
        testParsingDateRange('17 August 2013 19 August 2013', '2013-08-17', '2013-08-19');
    });

    it('should parse date range with  multiple spaces', () => {
        testParsingDateRange('2013-08-17   2014-08-19', '2013-08-17', '2014-08-19');
    });

    it('should parse date range with end before start', () => {
        testParsingDateRange('2017-08-17 2014-08-19', '2014-08-19', '2017-08-17');
    });

    it('should parse single date as date range', () => {
        // Arrange
        const input = '2019-12-28';
        testParsingDateRange(input, input, input);
    });

    it('should ignore invalid start date when parsing range', () => {
        testParsingDateRange('2013-99-29 2014-08-19', '2014-08-19', '2014-08-19');
    });

    it('should ignore invalid end date when parsing range', () => {
        testParsingDateRange('2014-08-19 2015-99-29', '2014-08-19', '2014-08-19');
    });

    it('should return 2 invalid dates when both dates are invalid', () => {
        testParsingDateRange('2015-99-29 2015-99-29', 'Invalid date', 'Invalid date');
    });

    it('should return date ranges at midnight', () => {
        const dateRangeToParse = '2023-09-28 2023-10-01';
        const parsedDateRange = DateParser.parseDateRange(dateRangeToParse);
        expect(parsedDateRange[0].format('YYYY-MM-DD HH:mm')).toStrictEqual('2023-09-28 00:00');
        expect(parsedDateRange[1].format('YYYY-MM-DD HH:mm')).toStrictEqual('2023-10-01 00:00');
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
        expect(parsedDateRange[0].format('YYYY-MM-DD HH:mm')).toStrictEqual('2021-10-04 00:00');
        expect(parsedDateRange[1].format('YYYY-MM-DD HH:mm')).toStrictEqual('2021-10-10 00:00');
    });

    it('should return relative date range (week)', () => {
        testParsingDateRange('last week', '2021-09-27', '2021-10-03');
        testParsingDateRange('this week', '2021-10-04', '2021-10-10');
        testParsingDateRange('next week', '2021-10-11', '2021-10-17');
    });

    it('should return relative date range (month)', () => {
        testParsingDateRange('last month', '2021-09-01', '2021-09-30');
        testParsingDateRange('this month', '2021-10-01', '2021-10-31');
        testParsingDateRange('next month', '2021-11-01', '2021-11-30');
    });

    it('should return relative date range (quarter)', () => {
        testParsingDateRange('last quarter', '2021-07-01', '2021-09-30');
        testParsingDateRange('this quarter', '2021-10-01', '2021-12-31');
        testParsingDateRange('next quarter', '2022-01-01', '2022-03-31');
    });

    it('should return relative date range (year)', () => {
        testParsingDateRange('last year', '2020-01-01', '2020-12-31');
        testParsingDateRange('this year', '2021-01-01', '2021-12-31');
        testParsingDateRange('next year', '2022-01-01', '2022-12-31');
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
