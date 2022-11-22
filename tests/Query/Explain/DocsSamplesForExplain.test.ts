/**
 * @jest-environment jsdom
 */
import { verify } from 'approvals/lib/Providers/Jest/JestApprovals';
import moment from 'moment';
import { Options } from 'approvals/lib/Core/Options';
import { Query } from '../../../src/Query/Query';

window.moment = moment;

/**
 * Save an instructions block to disc, so that it can be embedded in
 * to documentation, using a 'snippet' line.
 * @todo Figure out how to include the '```tasks' and '```' lines
 * @param instructions
 * @param options
 */
function verifyQuery(instructions: string, options?: Options): void {
    options = options || new Options();
    options = options.forFile().withFileExtention('query.text');
    verify(instructions, options);
}

/**
 * Save an explanation of the instructions block to disk, so that it can be
 * embedded in to documentation, using a 'snippet' line.
 * @param instructions
 * @param options
 */
function verifyExplanation(instructions: string, options?: Options): void {
    const query = new Query({ source: instructions });
    const explanation = query.explainQuery();

    options = options || new Options();
    options = options.forFile().withFileExtention('explanation.text');
    verify(explanation, options);
}

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
        verifyExplanation(instructions);
    });
});
