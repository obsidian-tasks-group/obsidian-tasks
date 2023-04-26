/**
 * @jest-environment jsdom
 */
import moment from 'moment';
import { verifyQuery, verifyTaskBlockExplanation } from '../../TestingTools/ApprovalTestHelpers';

window.moment = moment;

describe('explain', () => {
    beforeAll(() => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date(2022, 9, 21)); // 2022-10-21
    });

    afterAll(() => {
        jest.useRealTimers();
    });

    it('expands dates', () => {
        // Arrange
        const instructions: string = `
starts after 2 years ago
scheduled after 1 week ago
due before tomorrow
explain`;

        // Act, Assert
        verifyQuery(instructions);
        verifyTaskBlockExplanation(instructions);
    });

    it('boolean combinations', () => {
        // Arrange
        const instructions: string = `
explain
not done
(due before tomorrow) AND (is recurring)`;

        // Act, Assert
        verifyQuery(instructions);
        verifyTaskBlockExplanation(instructions);
    });

    it('nested boolean combinations', () => {
        // Arrange
        const instructions: string = `
explain
( (description includes 1) AND (description includes 2) AND (description includes 3) ) OR ( (description includes 5) AND (description includes 6) AND (description includes 7) ) AND NOT (description includes 7)`;

        // Act, Assert
        verifyQuery(instructions);
        verifyTaskBlockExplanation(instructions);
    });
});
