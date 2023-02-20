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

describe('DateParser', () => {
    it('should parse a valid fixed date correctly', () => {
        const input = '2021-03-17';
        testParsingeSingleDate(input, input);
    });

    it('should recognise an invalid date correctly', () => {
        testParsingeSingleDate('2021-13-17', 'Invalid date');
    });
});
