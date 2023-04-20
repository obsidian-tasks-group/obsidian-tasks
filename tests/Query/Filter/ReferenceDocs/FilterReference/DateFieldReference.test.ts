/**
 * @jest-environment jsdom
 */

import { readFileSync } from 'fs';
import moment from 'moment';
import { verifyExplanation } from '../../../../TestingTools/ApprovalTestHelpers';

window.moment = moment;

describe('explain', () => {
    beforeEach(() => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date('2023-04-19'));
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('date reference', () => {
        // Arrange

        const inputFile = 'tests/Query/Filter/ReferenceDocs/FilterReference/last-this-next-weekday.input.query';
        const instructions = readFileSync(inputFile, 'utf-8');

        // Act, Assert
        verifyExplanation(instructions);
    });
});
