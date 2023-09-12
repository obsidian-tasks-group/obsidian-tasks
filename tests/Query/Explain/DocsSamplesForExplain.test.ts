/**
 * @jest-environment jsdom
 */
import moment from 'moment';
import { verifyQuery, verifyTaskBlockExplanation } from '../../TestingTools/ApprovalTestHelpers';
import { resetSettings, updateSettings } from '../../../src/Config/Settings';
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
        verifyTaskBlockExplanation(instructions);
    });

    it('boolean combinations', () => {
        // Arrange
        const instructions: string = `
explain
not done
(due before tomorrow) AND (is recurring)`;

        // Act, Assert
        checkExplainPresentAndVerify(instructions);
        verifyTaskBlockExplanation(instructions);
    });

    it('nested boolean combinations', () => {
        // Arrange
        const instructions: string = `
explain
( (description includes 1) AND (description includes 2) AND (description includes 3) ) OR ( (description includes 5) AND (description includes 6) AND (description includes 7) ) AND NOT (description includes 7)`;

        // Act, Assert
        checkExplainPresentAndVerify(instructions);
        verifyTaskBlockExplanation(instructions);
    });

    it('regular expression', () => {
        // Arrange
        const instructions: string = `
explain
path regex matches /^Root/Sub-Folder/Sample File\\.md/i`;

        // Act, Assert
        checkExplainPresentAndVerify(instructions);
        verifyTaskBlockExplanation(instructions);
    });

    const globalQuery = `limit 50
heading includes tasks`;
    it('example global query', () => {
        // Act, Assert
        verifyQuery(globalQuery);
    });

    it('explains task block with global query active', () => {
        // Arrange
        updateSettings({ globalQuery });

        const blockQuery = `
not done
due next week
explain`;

        // Act, Assert
        checkExplainPresentAndVerify(blockQuery);
        verifyTaskBlockExplanation(blockQuery);
    });

    it('placeholders', () => {
        // Arrange
        const instructions: string = `
explain
path includes {{query.file.path}}
root includes {{query.file.root}}
folder includes {{query.file.folder}}
filename includes {{query.file.filename}}`;

        // Act, Assert
        checkExplainPresentAndVerify(instructions);
        verifyTaskBlockExplanation(instructions);
    });

    it('placeholders error', () => {
        // Arrange
        const instructions: string = `
# query.file.fileName is invalid, because of the capital N.
# query.file.filename is the correct property name.
filename includes {{query.file.fileName}}`;

        // Act, Assert
        verifyQuery(instructions); // This does not have an explain, so does not call checkExplainPresentAndVerify()
        verifyTaskBlockExplanation(instructions);
    });
});
