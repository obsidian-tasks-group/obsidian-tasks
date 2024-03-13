/**
 * @jest-environment jsdom
 */
import moment from 'moment';
import { BooleanField } from '../../../src/Query/Filter/BooleanField';
import type { FilterOrErrorMessage } from '../../../src/Query/Filter/FilterOrErrorMessage';
import { TaskBuilder } from '../../TestingTools/TaskBuilder';
import { testFilter } from '../../TestingTools/FilterTestHelpers';

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
            // force line break
            ['', 'empty line'],
        ])(
            'should report expected error message: on "%s" - expected "%s"',
            (instruction: string, expectedError: string) => {
                const filter = new BooleanField().createFilterOrErrorMessage(instruction);
                expect(filter.error).toStrictEqual(expectedError);
            },
        );

        it('Invalid AND', () => {
            const filter = new BooleanField().createFilterOrErrorMessage('AND (description includes d1)');
            expect(filter.error).toStrictEqual(
                'malformed boolean query -- Invalid token (check the documentation for guidelines)',
            );
        });

        it('Invalid OR', () => {
            const filter = new BooleanField().createFilterOrErrorMessage('OR (description includes d1)');
            expect(filter.error).toStrictEqual(
                'malformed boolean query -- Invalid token (check the documentation for guidelines)',
            );
        });

        it('Invalid sub-expression', () => {
            const filter = new BooleanField().createFilterOrErrorMessage('NOT (description blahblah d1)');
            expect(filter.error).toStrictEqual("couldn't parse sub-expression 'description blahblah d1'");
        });

        it('Invalid sub-expression - gives error', () => {
            const filter = new BooleanField().createFilterOrErrorMessage('NOT (happens before blahblahblah)');
            expect(filter.error).toStrictEqual(
                "couldn't parse sub-expression 'happens before blahblahblah': do not understand happens date",
            );
        });

        describe('Missing spaces before operator', () => {
            it('No space before AND - gives error', () => {
                const filter = new BooleanField().createFilterOrErrorMessage('(path includes a)AND (path includes b)');
                expect(filter.error).toMatchInlineSnapshot(
                    '"malformed boolean query -- Unexpected character: A. A closing parenthesis should be followed by another closing parenthesis or whitespace (check the documentation for guidelines)"',
                );
            });

            it('No space before AND OR - gives error', () => {
                const filter = new BooleanField().createFilterOrErrorMessage(
                    '(path includes a)AND OR(path includes b)',
                );
                expect(filter.error).toMatchInlineSnapshot(
                    '"malformed boolean query -- Unexpected character: A. A closing parenthesis should be followed by another closing parenthesis or whitespace (check the documentation for guidelines)"',
                );
            });

            it('No space before OR - gives error', () => {
                const filter = new BooleanField().createFilterOrErrorMessage('(path includes a)OR (path includes b)');
                expect(filter.error).toMatchInlineSnapshot(
                    '"malformed boolean query -- Unexpected character: O. A closing parenthesis should be followed by another closing parenthesis or whitespace (check the documentation for guidelines)"',
                );
            });

            it('No space before OR NOT - gives error', () => {
                const filter = new BooleanField().createFilterOrErrorMessage(
                    '(path includes a)OR NOT (path includes b)',
                );
                expect(filter.error).toMatchInlineSnapshot(
                    '"malformed boolean query -- Unexpected character: O. A closing parenthesis should be followed by another closing parenthesis or whitespace (check the documentation for guidelines)"',
                );
            });

            it('No space before XOR - gives error', () => {
                const filter = new BooleanField().createFilterOrErrorMessage('(path includes a)XOR (path includes b)');
                expect(filter.error).toMatchInlineSnapshot(
                    '"malformed boolean query -- Unexpected character: X. A closing parenthesis should be followed by another closing parenthesis or whitespace (check the documentation for guidelines)"',
                );
            });
        });

        describe('Missing spaces after operator', () => {
            it('No space after AND - gives error', () => {
                const filter = new BooleanField().createFilterOrErrorMessage('(path includes a) AND(path includes b)');
                expect(filter.error).toMatchInlineSnapshot(
                    '"malformed boolean query -- Unexpected character: (. Operators should be separated using whitespace (check the documentation for guidelines)"',
                );
            });

            it('No space after AND OR - gives error', () => {
                const filter = new BooleanField().createFilterOrErrorMessage(
                    '(path includes a) AND OR(path includes b)',
                );
                expect(filter.error).toMatchInlineSnapshot(
                    '"malformed boolean query -- Unexpected character: (. Operators should be separated using whitespace (check the documentation for guidelines)"',
                );
            });

            it('No space after OR - gives error', () => {
                const filter = new BooleanField().createFilterOrErrorMessage('(path includes a) OR(path includes b)');
                expect(filter.error).toMatchInlineSnapshot(
                    '"malformed boolean query -- Unexpected character: (. Operators should be separated using whitespace (check the documentation for guidelines)"',
                );
            });

            it('No space after OR NOT - gives error', () => {
                const filter = new BooleanField().createFilterOrErrorMessage(
                    '(path includes a) OR NOT(path includes b)',
                );
                expect(filter.error).toMatchInlineSnapshot(
                    '"malformed boolean query -- Unexpected character: (. Operators should be separated using whitespace (check the documentation for guidelines)"',
                );
            });

            it('No space after XOR - gives error', () => {
                const filter = new BooleanField().createFilterOrErrorMessage('(path includes a) XOR(path includes b)');
                expect(filter.error).toMatchInlineSnapshot(
                    '"malformed boolean query -- Unexpected character: (. Operators should be separated using whitespace (check the documentation for guidelines)"',
                );
            });

            it('No space after NOT - gives error', () => {
                const filter = new BooleanField().createFilterOrErrorMessage('NOT(path includes b)');
                expect(filter.error).toMatchInlineSnapshot(
                    '"malformed boolean query -- Unexpected character: (. Operators should be separated using whitespace (check the documentation for guidelines)"',
                );
            });
        });

        // Have not managed to create instructions that trigger these errors:
        //      result.error = 'empty operator in boolean query';
        //      result.error = `unknown boolean operator '${token.value}'`;
    });
});

describe('explain boolean queries', () => {
    it('should explain Boolean AND', () => {
        const instruction = '(description includes d1) AND (priority medium)';
        const filterOrMessage = new BooleanField().createFilterOrErrorMessage(instruction);
        const expected = `AND (All of):
  description includes d1
  priority is medium`;
        expect(filterOrMessage).toHaveExplanation(expected);
    });

    it('should explain Boolean AND NOT', () => {
        const instruction = '(description includes d1) AND NOT (priority medium)';
        const filterOrMessage = new BooleanField().createFilterOrErrorMessage(instruction);
        const expected = `AND (All of):
  description includes d1
  NOT:
    priority is medium`;
        expect(filterOrMessage).toHaveExplanation(expected);
    });

    it('should explain Boolean OR', () => {
        const instruction = '(description includes d1) OR (priority medium)';
        const filterOrMessage = new BooleanField().createFilterOrErrorMessage(instruction);
        const expected = `OR (At least one of):
  description includes d1
  priority is medium`;
        expect(filterOrMessage).toHaveExplanation(expected);
    });

    it('should explain Boolean OR NOT', () => {
        const instruction = '(description includes d1) OR NOT (priority medium)';
        const filterOrMessage = new BooleanField().createFilterOrErrorMessage(instruction);
        const expected = `OR (At least one of):
  description includes d1
  NOT:
    priority is medium`;
        expect(filterOrMessage).toHaveExplanation(expected);
    });

    it('should explain Boolean NOT', () => {
        const instruction = 'NOT (description includes d1)';
        const filterOrMessage = new BooleanField().createFilterOrErrorMessage(instruction);
        expect(filterOrMessage).toHaveExplanation('NOT:\n  description includes d1');
    });

    it('should explain Boolean XOR', () => {
        const instruction = '(description includes d1) XOR (priority medium)';
        const filterOrMessage = new BooleanField().createFilterOrErrorMessage(instruction);
        const expected = `XOR (Exactly one of):
  description includes d1
  priority is medium`;
        expect(filterOrMessage).toHaveExplanation(expected);
    });

    it('should explain 2 Boolean ORs', () => {
        const instruction = '(description includes d1) OR (description includes d2) OR (priority medium)';
        const filterOrMessage = new BooleanField().createFilterOrErrorMessage(instruction);
        const expected = `OR (At least one of):
  description includes d1
  description includes d2
  priority is medium`;
        expect(filterOrMessage).toHaveExplanation(expected);
    });

    it('should explain 3 Boolean ANDs', () => {
        const instruction = '(description includes 1) AND (description includes 2) AND (description includes 3)';
        const filterOrMessage = new BooleanField().createFilterOrErrorMessage(instruction);
        expect(filterOrMessage.filter?.explanation.asString()).toMatchInlineSnapshot(`
            "AND (All of):
              description includes 1
              description includes 2
              description includes 3"
        `);
    });

    it('should explain 9 Boolean ANDs', () => {
        const instruction =
            '(description includes 1) AND (description includes 2) AND (description includes 3) AND (description includes 4) AND (description includes 5) AND (description includes 6) AND (description includes 7) AND (description includes 8) AND (description includes 9)';
        const filterOrMessage = new BooleanField().createFilterOrErrorMessage(instruction);
        expect(filterOrMessage.filter?.explanation.asString()).toMatchInlineSnapshot(`
            "AND (All of):
              description includes 1
              description includes 2
              description includes 3
              description includes 4
              description includes 5
              description includes 6
              description includes 7
              description includes 8
              description includes 9"
        `);
    });

    it('( a && b ) && c', () => {
        const instruction = '( (description includes a) AND (description includes b) ) AND (description includes c)';
        const filterOrMessage = new BooleanField().createFilterOrErrorMessage(instruction);
        expect(filterOrMessage.filter?.explanation.asString()).toMatchInlineSnapshot(`
            "AND (All of):
              description includes a
              description includes b
              description includes c"
        `);
    });

    it('a && ( b && c )', () => {
        const instruction = '( description includes a ) AND ( (description includes b) AND (description includes c) )';
        const filterOrMessage = new BooleanField().createFilterOrErrorMessage(instruction);
        expect(filterOrMessage.filter?.explanation.asString()).toMatchInlineSnapshot(`
            "AND (All of):
              description includes a
              AND (All of):
                description includes b
                description includes c"
        `);
    });

    it('( a || b ) || c', () => {
        const instruction = '( (description includes a) OR (description includes b) ) OR (description includes c)';
        const filterOrMessage = new BooleanField().createFilterOrErrorMessage(instruction);
        expect(filterOrMessage.filter?.explanation.asString()).toMatchInlineSnapshot(`
            "OR (At least one of):
              description includes a
              description includes b
              description includes c"
        `);
    });

    it('a || ( b || c )', () => {
        const instruction = '( description includes a ) OR ( (description includes b) OR (description includes c) )';
        const filterOrMessage = new BooleanField().createFilterOrErrorMessage(instruction);
        expect(filterOrMessage.filter?.explanation.asString()).toMatchInlineSnapshot(`
            "OR (At least one of):
              description includes a
              OR (At least one of):
                description includes b
                description includes c"
        `);
    });

    it('( a && b && c ) || ( d && e && f )', () => {
        const instruction =
            '( (description includes a) AND (description includes b) AND (description includes c) ) OR ( (description includes d) AND (description includes e) AND (description includes f) )';
        const filterOrMessage = new BooleanField().createFilterOrErrorMessage(instruction);
        expect(filterOrMessage.filter?.explanation.asString()).toMatchInlineSnapshot(`
            "OR (At least one of):
              AND (All of):
                description includes a
                description includes b
                description includes c
              AND (All of):
                description includes d
                description includes e
                description includes f"
        `);
    });

    it('( a || b || c ) && ( d || e || f )', () => {
        const instruction =
            '( (description includes a) OR (description includes b) OR (description includes c) ) AND ( (description includes d) OR (description includes e) OR (description includes f) )';
        const filterOrMessage = new BooleanField().createFilterOrErrorMessage(instruction);
        expect(filterOrMessage.filter?.explanation.asString()).toMatchInlineSnapshot(`
            "AND (All of):
              OR (At least one of):
                description includes a
                description includes b
                description includes c
              OR (At least one of):
                description includes d
                description includes e
                description includes f"
        `);
    });
});
