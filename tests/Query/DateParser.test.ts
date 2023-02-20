/**
 * @jest-environment jsdom
 */
import moment from 'moment';
import * as chrono from 'chrono-node';
import { DateParser } from '../../src/Query/DateParser';
import { TaskRegularExpressions } from '../../src/Task';

window.moment = moment;

function testParsingeSingleDate(input: string, result: string) {
    const moment = DateParser.parseDate(input);
    expect(moment.format(TaskRegularExpressions.dateFormat)).toEqual(result);
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
    it('should parse date range from chrono docs', () => {
        // Arrange
        const input = '17 August 2013 - 19 August 2013';

        // Act
        const result = chrono.parse(input, undefined, {
            forwardDate: true,
        });

        // Assert
        expect(result.length).toEqual(1);
        const start = result[0].start;
        expect(start).toBeDefined();
        expect(window.moment(start.date()).format(TaskRegularExpressions.dateFormat)).toEqual('2013-08-17');

        const end = result[0].end;
        expect(end).toBeDefined();
        expect(window.moment(end!.date()).format(TaskRegularExpressions.dateFormat)).toEqual('2013-08-19');

        console.log(result);
    });
});
