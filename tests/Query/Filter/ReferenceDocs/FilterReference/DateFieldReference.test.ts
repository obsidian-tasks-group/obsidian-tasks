/**
 * @jest-environment jsdom
 */

import { readFileSync } from 'fs';
import moment from 'moment';
import { verifyQueryExplanation } from '../../../../TestingTools/ApprovalTestHelpers';

window.moment = moment;

describe('explain', () => {
    beforeEach(() => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date('2023-04-19'));
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it.each([
        'filters-date-examples', // Alphabetical order by filename
        'last-this-next-week-month-quarter-year',
        'last-this-next-weekday',
    ])('date reference %s', (queryFileBasename: string) => {
        // Arrange
        const inputFile = `tests/Query/Filter/ReferenceDocs/FilterReference/${queryFileBasename}.input.query`;
        const instructions = readFileSync(inputFile, 'utf-8');

        // Act, Assert
        verifyQueryExplanation(instructions);
    });
});
