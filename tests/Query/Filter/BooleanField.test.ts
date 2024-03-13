/**
 * @jest-environment jsdom
 */
import moment from 'moment';
import { BooleanField } from '../../../src/Query/Filter/BooleanField';
import type { FilterOrErrorMessage } from '../../../src/Query/Filter/FilterOrErrorMessage';
import { TaskBuilder } from '../../TestingTools/TaskBuilder';
import { testFilter } from '../../TestingTools/FilterTestHelpers';
import { verifyBooleanExpressionExplanation, verifyBooleanExpressionPreprocessing } from './BooleanFieldVerify';

window.moment = moment;

function testWithDescription(filter: FilterOrErrorMessage, description: string, expected: boolean) {
    const builder = new TaskBuilder();
    testFilter(filter, builder.description(description), expected);
}

function createValidFilter(instruction: string) {
    // First make sure that BooleanField recognises the instruction as valid
    expect(new BooleanField().canCreateFilterForLine(instruction)).toEqual(true);

    return new BooleanField().createFilterOrErrorMessage(instruction);
}

describe('boolean query', () => {
    // These tests are intended to be really simple, so it is easy to reason about the correct behaviour of the code.
    describe('basic operators', () => {
        it('AND', () => {
            // Arrange
            const filter = createValidFilter(
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
            const filter = createValidFilter('(description includes d1) OR (description includes d2)');

            // Act, Assert
            testWithDescription(filter, 'neither', false);
            testWithDescription(filter, 'd1', true);
            testWithDescription(filter, 'd2', true);
            testWithDescription(filter, 'd1 d2', true);
        });

        it('XOR', () => {
            // Arrange
            const filter = createValidFilter('(description includes d1) XOR (description includes d2)');

            // Act, Assert
            testWithDescription(filter, 'neither', false);
            testWithDescription(filter, 'd1', true);
            testWithDescription(filter, 'd2', true);
            testWithDescription(filter, 'd1 d2', false);
        });

        it('NOT', () => {
            // Arrange
            const filter = createValidFilter('NOT (description includes d1)');

            // Act, Assert
            testWithDescription(filter, 'nothing', true);
            testWithDescription(filter, 'd1', false);
        });

        it('AND NOT', () => {
            // Arrange
            const filter = createValidFilter('(description includes d1) AND NOT (description includes d2)');

            // Act, Assert
            testWithDescription(filter, 'neither', false);
            testWithDescription(filter, 'd1', true);
            testWithDescription(filter, 'd2', false);
            testWithDescription(filter, 'd1 d2', false);
        });

        it('OR NOT', () => {
            // Arrange
            const filter = createValidFilter('(description includes d1) OR NOT (description includes d2)');

            // Act, Assert
            testWithDescription(filter, 'neither', true);
            testWithDescription(filter, 'd1', true);
            testWithDescription(filter, 'd2', false);
            testWithDescription(filter, 'd1 d2', true);
        });

        it('input components dirty with whitespaces', () => {
            const filter = createValidFilter(
                ' (description includes #context/location1) OR (description includes #context/location2 ) OR (  description includes #context/location3 ) OR   (  description includes #context/location4 )',
            );

            testWithDescription(filter, 'none', false);
            testWithDescription(filter, 'xxx #context/location1', true);
            testWithDescription(filter, 'xxx #context/location2', true);
            testWithDescription(filter, 'xxx #context/location3', true);
            testWithDescription(filter, 'xxx #context/location4', true);
        });

        it('should work with single filter in parentheses - via BooleanField', () => {
            // This tests the fix for
            //  https://github.com/obsidian-tasks-group/obsidian-tasks/discussions/975
            //  Support single filters surround by parentheses
            const filter = createValidFilter('(description includes #context/location1)');

            testWithDescription(filter, 'xxx #context/location1', true);
            testWithDescription(filter, 'xxx #context/location2', false);
        });

        it('should work with single filter in heavily nested parentheses - via BooleanField', () => {
            // Confirm that redundant () are ignored.
            const filter = createValidFilter('(((((description includes #context/location1)))))');

            testWithDescription(filter, 'xxx #context/location1', true);
            testWithDescription(filter, 'xxx #context/location2', false);
        });
    });

    describe('error cases - to show error messages', () => {
        it.each([
            [
                // force line break
                '',
                'empty line',
            ],

            // Incorrect numbers of filters/sub-expressions
            [
                'AND (description includes d1)',
                'malformed boolean query -- Invalid token (check the documentation for guidelines)',
            ],
            [
                'OR (description includes d1)',
                'malformed boolean query -- Invalid token (check the documentation for guidelines)',
            ],
            [
                // force line break
                'NOT (description blahblah d1)',
                "couldn't parse sub-expression 'description blahblah d1'",
            ],
            [
                'NOT (happens before blahblahblah)',
                "couldn't parse sub-expression 'happens before blahblahblah': do not understand happens date",
            ],

            // Missing spaces before operator
            [
                '(path includes a)AND (path includes b)',
                'malformed boolean query -- Unexpected character: A. A closing parenthesis should be followed by another closing parenthesis or whitespace (check the documentation for guidelines)',
            ],
            [
                '(path includes a)AND NOT(path includes b)',
                'malformed boolean query -- Unexpected character: A. A closing parenthesis should be followed by another closing parenthesis or whitespace (check the documentation for guidelines)',
            ],
            [
                '(path includes a)OR (path includes b)',
                'malformed boolean query -- Unexpected character: O. A closing parenthesis should be followed by another closing parenthesis or whitespace (check the documentation for guidelines)',
            ],
            [
                '(path includes a)OR NOT (path includes b)',
                'malformed boolean query -- Unexpected character: O. A closing parenthesis should be followed by another closing parenthesis or whitespace (check the documentation for guidelines)',
            ],
            [
                '(path includes a)XOR (path includes b)',
                'malformed boolean query -- Unexpected character: X. A closing parenthesis should be followed by another closing parenthesis or whitespace (check the documentation for guidelines)',
            ],

            // Missing spaces after operator
            [
                '(path includes a) AND(path includes b)',
                'malformed boolean query -- Unexpected character: (. Operators should be separated using whitespace (check the documentation for guidelines)',
            ],
            [
                '(path includes a) AND NOT(path includes b)',
                'malformed boolean query -- Unexpected character: (. Operators should be separated using whitespace (check the documentation for guidelines)',
            ],
            [
                '(path includes a) OR(path includes b)',
                'malformed boolean query -- Unexpected character: (. Operators should be separated using whitespace (check the documentation for guidelines)',
            ],
            [
                '(path includes a) OR NOT(path includes b)',
                'malformed boolean query -- Unexpected character: (. Operators should be separated using whitespace (check the documentation for guidelines)',
            ],
            [
                '(path includes a) XOR(path includes b)',
                'malformed boolean query -- Unexpected character: (. Operators should be separated using whitespace (check the documentation for guidelines)',
            ],
            [
                'NOT(path includes b)',
                'malformed boolean query -- Unexpected character: (. Operators should be separated using whitespace (check the documentation for guidelines)',
            ],
        ])(
            'should report expected error message: on "%s" - expected "%s"',
            (instruction: string, expectedError: string) => {
                const filter = new BooleanField().createFilterOrErrorMessage(instruction);
                expect(filter.error).toStrictEqual(expectedError);
            },
        );

        // Have not managed to create instructions that trigger these errors:
        //      result.error = 'empty operator in boolean query';
        //      result.error = `unknown boolean operator '${token.value}'`;
    });
});

describe('boolean query - exhaustive tests', () => {
    it('preprocess', () => {
        verifyBooleanExpressionPreprocessing(BooleanField.preprocessExpression);
    });

    it('explain', () => {
        verifyBooleanExpressionExplanation();
    });
});
