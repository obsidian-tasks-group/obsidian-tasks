/**
 * @jest-environment jsdom
 */
import { verify } from 'approvals/lib/Providers/Jest/JestApprovals';
import moment from 'moment';
import { Query } from '../../../src/Query/Query';

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
            "
            scheduled after 2 years ago
            due before tomorrow
            explain
            "
            `;
        const query = new Query({ source: instructions });

        // Act
        const text = query.explainQuery();

        // Assert
        verify(text);
    });
});
