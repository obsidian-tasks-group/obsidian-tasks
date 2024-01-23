/**
 * @jest-environment jsdom
 */
import moment from 'moment';
import { DateParser } from '../../src/Query/DateParser';

import { TaskRegularExpressions } from '../../src/Task/TaskRegularExpressions';

window.moment = moment;

function testParsingeSingleDate(input: string, result: string) {
    const moment = DateParser.parseDate(input);
    expect(moment.format(TaskRegularExpressions.dateFormat)).toEqual(result);
}

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
});

describe('DateParser - relative date ranges', () => {
    beforeAll(() => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date(2021, 9, 6)); // 2021-10-06
    });

    afterAll(() => {
        jest.useRealTimers();
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

describe('DateParser - numbered date ranges', () => {
    it('should return dates for numbered ranges', () => {
        // Week (53 in a year)
        testParsingDateRange('2020-W53', '2020-12-28', '2021-01-03');
        testParsingDateRange('2021-W01', '2021-01-04', '2021-01-10');

        // Week (52 in a year)
        testParsingDateRange('2018-W52', '2018-12-24', '2018-12-30');
        testParsingDateRange('2019-W01', '2018-12-31', '2019-01-06');
        testParsingDateRange('2019-W02', '2019-01-07', '2019-01-13');

        // Month
        testParsingDateRange('2002-02', '2002-02-01', '2002-02-28');
        testParsingDateRange('2013-06', '2013-06-01', '2013-06-30');
        testParsingDateRange('2017-12', '2017-12-01', '2017-12-31');
        testParsingDateRange('2024-02', '2024-02-01', '2024-02-29');

        // Quarter
        testParsingDateRange('2007-Q1', '2007-01-01', '2007-03-31');

        // Year
        testParsingDateRange('1996', '1996-01-01', '1996-12-31');
        testParsingDateRange('2022', '2022-01-01', '2022-12-31');
    });

    it('should allow the range text to be padded with spaces', () => {
        testParsingDateRange('2022 ', '2022-01-01', '2022-12-31');
        testParsingDateRange(' 2023-Q3', '2023-07-01', '2023-09-30');
        testParsingDateRange('  2021-W30', '2021-07-26', '2021-08-01');
        testParsingDateRange('  2020-03        ', '2020-03-01', '2020-03-31');
    });

    it('should return invalid dates for erroneous numbered ranges', () => {
        // Week
        // Each 4 years a year has 53 weeks (2020). For 2020 the week 54 should be invalid then.
        // For the others it is the week 53 that should be invalid.
        // The correct last week of a year is tested in a previous test
        testParsingDateRange('2020-W54', 'Invalid date', 'Invalid date');
        testParsingDateRange('2018-W53', 'Invalid date', 'Invalid date');

        // Week (Wrong number)
        testParsingDateRange('2021-W0', 'Invalid date', 'Invalid date');
        testParsingDateRange('2021-W00', 'Invalid date', 'Invalid date');

        // Quarter
        testParsingDateRange('2023-Q0', 'Invalid date', 'Invalid date');
        testParsingDateRange('2023-Q5', 'Invalid date', 'Invalid date');

        // Month
        testParsingDateRange('2017-13', 'Invalid date', 'Invalid date');
        testParsingDateRange('2023-14', 'Invalid date', 'Invalid date');
        testParsingDateRange('2023-00', 'Invalid date', 'Invalid date');

        // Year
        testParsingDateRange('20167', 'Invalid date', 'Invalid date');
    });
});
