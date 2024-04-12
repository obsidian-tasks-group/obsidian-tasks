/**
 * @jest-environment jsdom
 */
import moment from 'moment';
import { BooleanField } from '../../../src/Query/Filter/BooleanField';
import type { FilterOrErrorMessage } from '../../../src/Query/Filter/FilterOrErrorMessage';
import { TaskBuilder } from '../../TestingTools/TaskBuilder';
import { testFilter } from '../../TestingTools/FilterTestHelpers';
import { Query } from '../../../src/Query/Query';
import { Explainer } from '../../../src/Query/Explain/Explainer';
import { BooleanPreprocessor } from '../../../src/Query/Filter/BooleanPreprocessor';
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

describe('boolean query - filter', () => {
    // These tests are intended to be really simple, so it is easy to reason about the correct behaviour of the code.
    describe('basic operators', () => {
        it.each([
            '(description includes d1) AND (description includes d2)',
            '(description includes d1)AND(description includes d2)',
            '[description includes d1] AND [description includes d2]',
            '[description includes d1]AND[description includes d2]',
            '{description includes d1} AND {description includes d2}',
            '{description includes d1}AND{description includes d2}',
            '"description includes d1" AND "description includes d2"',
            '"description includes d1"AND"description includes d2"',
        ])('instruction: "%s"', (line: string) => {
            // Arrange
            const filter = createValidFilter(line);

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

    describe('delimiters', () => {
        function explanationOrError(filter: FilterOrErrorMessage) {
            if (filter.filter) {
                return filter.filter.explainFilterIndented('');
            } else {
                return filter.error;
            }
        }

        describe('( and )', () => {
            it('should allow ( and ) as delimiters around 1 filter', () => {
                const filter = createValidFilter('(description includes #context/location1)');
                expect(explanationOrError(filter)).toMatchInlineSnapshot(`
                                    "(description includes #context/location1) =>
                                      description includes #context/location1
                                    "
                            `);
            });

            it('should allow ( and ) as delimiters around 2 filters', () => {
                const filter = createValidFilter(
                    '(description includes #context/location1) OR (description includes #context/location2)',
                );
                expect(explanationOrError(filter)).toMatchInlineSnapshot(`
                                    "(description includes #context/location1) OR (description includes #context/location2) =>
                                      OR (At least one of):
                                        description includes #context/location1
                                        description includes #context/location2
                                    "
                            `);
            });

            it('should allow ( and ) as delimiters around 2 filters - with " inside', () => {
                // This searches for words surrounded by double-quotes:
                const filter = createValidFilter('(description includes "hello world") OR (description includes "42")');
                expect(explanationOrError(filter)).toMatchInlineSnapshot(`
                    "(description includes "hello world") OR (description includes "42") =>
                      OR (At least one of):
                        description includes "hello world"
                        description includes "42"
                    "
                `);
            });
        });

        describe('" and "', () => {
            it('should allow " and " as delimiters around 1 filter', () => {
                const filter = createValidFilter('"description includes #context/location1"');
                expect(explanationOrError(filter)).toMatchInlineSnapshot(`
                    ""description includes #context/location1" =>
                      description includes #context/location1
                    "
                `);
            });

            it('should allow " and " as delimiters around 2 filters', () => {
                const filter = createValidFilter(
                    '"description includes #context/location1" OR "description includes #context/location2"',
                );
                expect(explanationOrError(filter)).toMatchInlineSnapshot(`
                                    ""description includes #context/location1" OR "description includes #context/location2" =>
                                      OR (At least one of):
                                        description includes #context/location1
                                        description includes #context/location2
                                    "
                            `);
            });
        });

        describe('Mixed delimiters', () => {
            it('should not allow a mixture of () and "" delimiters any more - breaking change in 7.0.0', () => {
                const filter = new BooleanField().createFilterOrErrorMessage('(not done) AND "is recurring"');
                expect(filter.error).toBeDefined();
            });
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
        ])(
            'should report expected error message: on "%s" - expected "%s"',
            (instruction: string, expectedError: string) => {
                const filter = new BooleanField().createFilterOrErrorMessage(instruction);
                expect(filter.error).toContain(expectedError);
            },
        );

        // Have not managed to create instructions that trigger these errors:
        //      result.error = 'empty operator in boolean query';
        //      result.error = `unknown boolean operator '${token.value}'`;
    });

    describe('former error cases, that now work', () => {
        it.each([
            // Missing spaces before operator
            ['(path includes a)AND (path includes b)'],
            ['(path includes a)AND NOT(path includes b)'],
            ['(path includes a)OR (path includes b)'],
            ['(path includes a)OR NOT (path includes b)'],
            ['(path includes a)XOR (path includes b)'],

            // Missing spaces after operator
            ['(path includes a) AND(path includes b)'],
            ['(path includes a) AND NOT(path includes b)'],
            ['(path includes a) OR(path includes b)'],
            ['(path includes a) OR NOT(path includes b)'],
            ['(path includes a) XOR(path includes b)'],
            ['NOT(path includes b)'],
        ])('should report expected error message: on "%s" - expected "%s"', (instruction: string) => {
            const filter = new BooleanField().createFilterOrErrorMessage(instruction);
            expect(filter.error).toBeUndefined();
        });
    });
});

describe('boolean query - explain', () => {
    beforeAll(() => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date('2024-04-07'));
    });

    afterAll(() => {
        jest.useRealTimers();
    });

    function explainFilters(indentationLevel: number, source: string) {
        const indentation = ' '.repeat(indentationLevel);
        const path = 'some/sample/note.md';
        const query1 = new Query(source, path);
        return new Explainer(indentation).explainFilters(query1);
    }

    it('should explain [] delimiters', () => {
        const line = '[due this week] AND [description includes I use square brackets]';
        expect(explainFilters(0, line)).toMatchInlineSnapshot(`
            "[due this week] AND [description includes I use square brackets] =>
              AND (All of):
                due this week =>
                  due date is between:
                    2024-04-01 (Monday 1st April 2024) and
                    2024-04-07 (Sunday 7th April 2024) inclusive
                description includes I use square brackets
            "
        `);
    });

    it('should explain {} delimiters', () => {
        const line = '{due this week} AND {description includes I use curly braces}';
        expect(explainFilters(0, line)).toMatchInlineSnapshot(`
            "{due this week} AND {description includes I use curly braces} =>
              AND (All of):
                due this week =>
                  due date is between:
                    2024-04-01 (Monday 1st April 2024) and
                    2024-04-07 (Sunday 7th April 2024) inclusive
                description includes I use curly braces
            "
        `);
    });

    it('should make multi-line explanations consistent in and out of Boolean filter - issue #2707', () => {
        // See https://github.com/obsidian-tasks-group/obsidian-tasks/issues/2707
        const filter = 'description regex matches /buy/i';

        // A second filter, which contains filter1 embedded on a Boolean query:
        const filter2 = `( ${filter} ) AND ( path includes {{query.file.path}} )`;

        const filter1Explanation = explainFilters(4, filter);
        const filter2Explanation = explainFilters(0, filter2);

        // Ensure that the full standalone explanation of filter1 is present in its explanation in the Boolean query:
        expect(filter2Explanation).toContain(filter1Explanation);

        // These inline snapshots are provided for ease of visualising the behaviour:
        expect(filter1Explanation).toMatchInlineSnapshot(`
            "    description regex matches /buy/i =>
                  using regex:            'buy' with flag 'i'
            "
        `);

        expect(filter2Explanation).toMatchInlineSnapshot(`
            "( description regex matches /buy/i ) AND ( path includes {{query.file.path}} ) =>
            ( description regex matches /buy/i ) AND ( path includes some/sample/note.md ) =>
              AND (All of):
                description regex matches /buy/i =>
                  using regex:            'buy' with flag 'i'
                path includes some/sample/note.md
            "
        `);
    });
});

describe('boolean query - exhaustive tests', () => {
    beforeAll(() => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date('2024-03-28'));
    });

    afterAll(() => {
        jest.useRealTimers();
    });

    it('preprocess - split line', () => {
        verifyBooleanExpressionPreprocessing(BooleanPreprocessor.splitLine);
    });

    it('preprocess - rewrite', () => {
        verifyBooleanExpressionPreprocessing(BooleanPreprocessor.preprocessExpression);
    });

    it('explain', () => {
        verifyBooleanExpressionExplanation();
    });
});
