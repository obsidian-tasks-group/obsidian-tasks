/**
 * @jest-environment jsdom
 */
import moment from 'moment';
import { BooleanField } from '../../../src/Query/Filter/BooleanField';
import type { FilterOrErrorMessage } from '../../../src/Query/Filter/Filter';
import { TaskBuilder } from '../../TestingTools/TaskBuilder';
import { testFilter } from '../../TestingTools/FilterTestHelpers';

window.moment = moment;

function testWithDescription(
    filter: FilterOrErrorMessage,
    description: string,
    expected: boolean,
) {
    const builder = new TaskBuilder();
    testFilter(filter, builder.description(description), expected);
}

describe('boolean query', () => {
    describe('basic operators', () => {
        it('AND', () => {
            // Arrange
            const filter = new BooleanField().createFilterOrErrorMessage(
                '(description includes d1) AND (description includes d2)',
            );

            // Act, Assert
            testWithDescription(filter, 'neither', false);
            testWithDescription(filter, 'd1', false);
            testWithDescription(filter, 'd2', false);
            testWithDescription(filter, 'd1 d2', true);
        });

        it('OR', () => {
            // Arrange
            const filter = new BooleanField().createFilterOrErrorMessage(
                '(description includes d1) OR (description includes d2)',
            );

            // Act, Assert
            testWithDescription(filter, 'neither', false);
            testWithDescription(filter, 'd1', true);
            testWithDescription(filter, 'd2', true);
            testWithDescription(filter, 'd1 d2', true);
        });

        it('XOR', () => {
            // Arrange
            const filter = new BooleanField().createFilterOrErrorMessage(
                '(description includes d1) XOR (description includes d2)',
            );

            // Act, Assert
            testWithDescription(filter, 'neither', false);
            testWithDescription(filter, 'd1', true);
            testWithDescription(filter, 'd2', true);
            testWithDescription(filter, 'd1 d2', false);
        });

        it('NOT', () => {
            // Arrange
            const filter = new BooleanField().createFilterOrErrorMessage(
                'NOT (description includes d1)',
            );

            // Act, Assert
            testWithDescription(filter, 'nothing', true);
            testWithDescription(filter, 'd1', false);
        });

        it('AND NOT', () => {
            // Arrange
            const filter = new BooleanField().createFilterOrErrorMessage(
                '(description includes d1) AND NOT (description includes d2)',
            );

            // Act, Assert
            testWithDescription(filter, 'neither', false);
            testWithDescription(filter, 'd1', true);
            testWithDescription(filter, 'd2', false);
            testWithDescription(filter, 'd1 d2', false);
        });

        it('OR NOT', () => {
            // Arrange
            const filter = new BooleanField().createFilterOrErrorMessage(
                '(description includes d1) OR NOT (description includes d2)',
            );

            // Act, Assert
            testWithDescription(filter, 'neither', true);
            testWithDescription(filter, 'd1', true);
            testWithDescription(filter, 'd2', false);
            testWithDescription(filter, 'd1 d2', true);
        });
    });

    describe('error cases', () => {
        it('Invalid AND', () => {
            const filter = new BooleanField().createFilterOrErrorMessage(
                'AND (description includes d1)',
            );
            expect(filter.error).toStrictEqual(
                'malformed boolean query -- Invalid token (check the documentation for guidelines)',
            );
        });

        it('Invalid OR', () => {
            const filter = new BooleanField().createFilterOrErrorMessage(
                'OR (description includes d1)',
            );
            expect(filter.error).toStrictEqual(
                'malformed boolean query -- Invalid token (check the documentation for guidelines)',
            );
        });

        // TODO Check all error cases are reached - see breakpoints
    });
});
