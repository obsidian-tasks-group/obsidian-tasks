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
});

describe('DateParser - date ranges', () => {
    it('should parse date range from natural dates', () => {
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
