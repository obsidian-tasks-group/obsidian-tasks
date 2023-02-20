/**
 * @jest-environment jsdom
 */
import moment from 'moment';

window.moment = moment;

import { DateParser } from '../../src/Query/DateParser';
import { TaskRegularExpressions } from '../../src/Task';

describe('DateParser', () => {
    it('should parse a valid fixed date correctly', () => {
        // Arrange
        const input = '2021-03-17';

        // Act
        const moment = DateParser.parseDate(input);

        // Assert
        expect(moment.isValid()).toEqual(true);
        expect(moment.format(TaskRegularExpressions.dateFormat)).toEqual(input);
    });

    it('should recognise an invalid date correctly', () => {
        // Arrange
        const input = '2021-13-17';

        // Act
        const moment = DateParser.parseDate(input);

        // Assert
        expect(moment.isValid()).toEqual(false);
        expect(moment.format(TaskRegularExpressions.dateFormat)).toEqual('Invalid date');
    });
});
