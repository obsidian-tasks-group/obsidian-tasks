/**
 * @jest-environment jsdom
 */
import moment from 'moment';
import { GlobalQuery } from '../../../src/Config/GlobalQuery';
import { verifyQuery, verifyTaskBlockExplanation } from '../../TestingTools/ApprovalTestHelpers';
import { resetSettings } from '../../../src/Config/Settings';
window.moment = moment;

function checkExplainPresentAndVerify(blockQuery: string) {
    expect(blockQuery.includes('explain')).toEqual(true);
    verifyQuery(blockQuery);
}

describe('explain', () => {
    beforeAll(() => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date(2022, 9, 21)); // 2022-10-21
    });

    afterAll(() => {
        jest.useRealTimers();
    });

    afterEach(resetSettings);

    it('expands dates', () => {
        // Arrange
        const instructions: string = `
starts after 2 years ago
scheduled after 1 week ago
due before tomorrow
explain`;

        // Act, Assert
        checkExplainPresentAndVerify(instructions);
        verifyTaskBlockExplanation(instructions, new GlobalQuery());
    });

    it('boolean combinations', () => {
        // Arrange
        const instructions: string = `
explain
not done
(due before tomorrow) AND (is recurring)`;

        // Act, Assert
        checkExplainPresentAndVerify(instructions);
        verifyTaskBlockExplanation(instructions, new GlobalQuery());
    });

    it('nested boolean combinations', () => {
        // Arrange
        const instructions: string = `
explain
( (description includes 1) AND (description includes 2) AND (description includes 3) ) OR ( (description includes 5) AND (description includes 6) AND (description includes 7) ) AND NOT (description includes 7)`;

        // Act, Assert
        checkExplainPresentAndVerify(instructions);
        verifyTaskBlockExplanation(instructions, new GlobalQuery());
    });

    it('regular expression', () => {
        // Arrange
        const instructions: string = `
explain
path regex matches /^Root/Sub-Folder/Sample File\\.md/i`;

        // Act, Assert
        checkExplainPresentAndVerify(instructions);
        verifyTaskBlockExplanation(instructions, new GlobalQuery());
    });

    const globalQueryLine = `limit 50
heading includes tasks`;
    it('example global query', () => {
        // Act, Assert
        verifyQuery(globalQueryLine);
    });

    it('explains task block with global query active', () => {
        // Arrange
        const globalQuery = new GlobalQuery(globalQueryLine);
        const blockQuery = `
not done
due next week
explain`;

        // Act, Assert
        checkExplainPresentAndVerify(blockQuery);
        verifyTaskBlockExplanation(blockQuery, globalQuery);
    });
});
