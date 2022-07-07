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
    // These tests are intended to be really simple, so it is easy to reason about the correct behaviour of the code.
    describe('basic operators', () => {
        it('AND', () => {
            // Arrange
            const filter = new BooleanField().createFilterOrErrorMessage(
                '"description includes d1" AND "description includes d2"', // Use "..." instead of (), for completeness
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

        it('input components dirty with whitespaces', () => {
            const filter = new BooleanField().createFilterOrErrorMessage(
                ' (description includes #context/location1) OR (description includes #context/location2 ) OR (  description includes #context/location3 ) OR   (  description includes #context/location4 )',
            );

            testWithDescription(filter, 'none', false);
            testWithDescription(filter, 'xxx #context/location1', true);
            testWithDescription(filter, 'xxx #context/location2', true);
            testWithDescription(filter, 'xxx #context/location3', true);
            testWithDescription(filter, 'xxx #context/location4', true);
        });
    });

    describe('error cases - to show error messages', () => {
        it('empty line', () => {
            const filter = new BooleanField().createFilterOrErrorMessage('');
            expect(filter.error).toStrictEqual('empty line');
        });

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

        it('Invalid sub-expression', () => {
            const filter = new BooleanField().createFilterOrErrorMessage(
                'NOT (description blahblah d1)',
            );
            expect(filter.error).toStrictEqual(
                "couldn't parse sub-expression 'description blahblah d1'",
            );
        });

        it('Invalid sub-expression - gives error', () => {
            const filter = new BooleanField().createFilterOrErrorMessage(
                'NOT (happens before blahblahblah)',
            );
            expect(filter.error).toStrictEqual(
                "couldn't parse sub-expression 'happens before blahblahblah': do not understand happens date",
            );
        });

        // Have not managed to create instructions that trigger these errors:
        //      result.error = 'empty operator in boolean query';
        //      result.error = `unknown boolean operator '${token.value}'`;
    });
});
