/**
 * @jest-environment jsdom
 */
import moment from 'moment';

import { FunctionField } from '../../../src/Query/Filter/FunctionField';
import { Status } from '../../../src/Status';
import type { Task } from '../../../src/Task';
import { Priority } from '../../../src/Task';
import {
    toGroupTaskFromBuilder,
    toGroupTaskUsingSearchInfo,
    toGroupTaskWithPath,
} from '../../CustomMatchers/CustomMatchersForGrouping';
import { TaskBuilder } from '../../TestingTools/TaskBuilder';
import { SearchInfo } from '../../../src/Query/SearchInfo';
import {
    expectTaskComparesAfter,
    expectTaskComparesBefore,
    expectTaskComparesEqual,
} from '../../CustomMatchers/CustomMatchersForSorting';
import { fromLine } from '../../TestHelpers';
import { Query } from '../../../src/Query/Query';

window.moment = moment;

// -----------------------------------------------------------------------------------------------------------------
// Filtering
// -----------------------------------------------------------------------------------------------------------------

describe('FunctionField - filtering', () => {
    const functionField = new FunctionField();

    it('filter by function - with valid query of Task property', () => {
        const filter = functionField.createFilterOrErrorMessage('filter by function task.description.length > 5');
        expect(filter).toBeValid();
        expect(filter).toMatchTaskWithDescription('123456');
        expect(filter).not.toMatchTaskWithDescription('12345');
        expect(filter).not.toMatchTaskWithDescription('1234');
    });

    it('filter by function - with valid query of Query property', () => {
        const tasksInSameFileAsQuery = functionField.createFilterOrErrorMessage(
            'filter by function task.file.path === query.file.path',
        );
        expect(tasksInSameFileAsQuery).toBeValid();
        const queryFilePath = '/a/b/query.md';

        const taskInQueryFile: Task = new TaskBuilder().path(queryFilePath).build();
        const taskNotInQueryFile: Task = new TaskBuilder().path('some other path.md').build();
        const searchInfo = new SearchInfo(queryFilePath, [taskInQueryFile, taskNotInQueryFile]);

        expect(tasksInSameFileAsQuery.filterFunction!(taskInQueryFile, searchInfo)).toEqual(true);
        expect(tasksInSameFileAsQuery.filterFunction!(taskNotInQueryFile, searchInfo)).toEqual(false);
    });

    it('filter by function - should report syntax errors via FilterOrErrorMessage', () => {
        const instructionWithExtraClosingParen = 'filter by function task.status.name.toUpperCase())';
        const filter = functionField.createFilterOrErrorMessage(instructionWithExtraClosingParen);
        expect(filter).not.toBeValid();
        expect(filter.error).toEqual(
            'Error: Failed parsing expression "task.status.name.toUpperCase())".\nThe error message was:\n    "SyntaxError: Unexpected token \')\'"',
        );
    });

    it('filter by function - should report searching errors via exception', () => {
        // Arrange
        const instructionWithExtraClosingParen = 'filter by function task.wibble';
        const filter = functionField.createFilterOrErrorMessage(instructionWithExtraClosingParen);

        // Assert
        expect(filter).toBeValid();
        const t = () => {
            const task = new TaskBuilder().build();
            filter.filterFunction!(task, SearchInfo.fromAllTasks([task]));
        };
        expect(t).toThrow(Error);
        expect(t).toThrowError('filtering function must return true or false. This returned "undefined".');
    });

    it('filter by function - explanation should honour original case', () => {
        const filter = functionField.createFilterOrErrorMessage('filter by FUNCTION task.isRecurring');
        expect(filter).toHaveExplanation('filter by FUNCTION task.isRecurring');
    });
});

// -----------------------------------------------------------------------------------------------------------------
// Sorting
// -----------------------------------------------------------------------------------------------------------------

describe('FunctionField - sorting', () => {
    describe('basics', () => {
        it('should support sorting', () => {
            const functionField = new FunctionField();
            expect(functionField.supportsSorting()).toEqual(true);
        });

        it('should parse "sort by function" line', () => {
            // Arrange
            const field = new FunctionField();
            const instruction = 'sort by function task.path';

            // Assert
            const sorter = field.createSorterFromLine(instruction);
            expect(sorter).not.toBeNull();
        });

        it('should parse "sort by function reverse" line', () => {
            // Arrange
            const field = new FunctionField();
            const instruction = 'sort by function reverse task.path';

            // Assert
            const sorter = field.createSorterFromLine(instruction);
            expect(sorter).not.toBeNull();
        });
    });

    describe('validation', () => {
        const field = new FunctionField();

        describe('allowed sort key types', () => {
            it('should accept string sort key', () => {
                const key = 'anything';
                expect(Object.is(field.validateTaskSortKey(key, 'group by function "anything"'), key)).toEqual(true);
            });

            it('should accept number sort key', () => {
                expect(field.validateTaskSortKey(42, 'group by function 42')).toEqual(42);
                expect(field.validateTaskSortKey(0.15634, 'group by function 0.15634')).toEqual(0.15634);
            });

            it('should accept boolean sort key', () => {
                expect(field.validateTaskSortKey(true, 'group by function true')).toEqual(true);
                expect(field.validateTaskSortKey(false, 'group by function false')).toEqual(false);
            });

            it('should accept null sort key', () => {
                expect(Object.is(field.validateTaskSortKey(null, 'group by function null'), null)).toEqual(true);
            });
        });

        describe('forbidden sort key types', () => {
            it('should forbid undefined sort key', () => {
                const key = undefined;
                const t = () => {
                    field.validateTaskSortKey(key, 'group by function undefined');
                };
                expect(t).toThrow(Error);
                expect(t).toThrowError(
                    '"undefined" is not a valid sort key, from expression: "group by function undefined"',
                );
            });

            it('should forbid NaN sort key', () => {
                const key = NaN;
                const t = () => {
                    field.validateTaskSortKey(key, 'group by function NaN');
                };
                expect(t).toThrow(Error);
                expect(t).toThrowError(
                    '"NaN (Not a Number)" is not a valid sort key, from expression: "group by function NaN"',
                );
            });
        });
    });

    describe('comparing', () => {
        const field = new FunctionField();

        const SAME = 0;
        const BEFORE = -1;
        const AFTER = 1;

        it('should sort null before any other valid values', () => {
            // Note: once we test sorting by date, we will need extra tests here. See compareByDate()
            expect(field.compareTaskSortKeys(null, null, 'two nulls')).toEqual(SAME);
            expect(field.compareTaskSortKeys(null, 'a string', 'null and "a string"')).toEqual(BEFORE);
            expect(field.compareTaskSortKeys(false, null, 'false and null')).toEqual(AFTER);
        });

        it('should sort numbers in ascending order', () => {
            expect(field.compareTaskSortKeys(1, 1, '1 1')).toEqual(SAME);
            // number comparison is implementing with subtraction of the two values,
            // so we cannot just check for values -1 pr +1.
            expect(field.compareTaskSortKeys(42, 47, '42 and 47')).toBeLessThan(0);
            expect(field.compareTaskSortKeys(3.15634, 1.535436, '3.15634 and 1.535436')).toBeGreaterThan(0);
        });

        it('should sort false boolean before true', () => {
            expect(field.compareTaskSortKeys(1, 1, '1 1')).toEqual(SAME);
            expect(field.compareTaskSortKeys(false, true, 'false and true')).toEqual(BEFORE);
            expect(field.compareTaskSortKeys(true, false, 'true and false')).toEqual(AFTER);
        });

        it('should sort strings case-sensitively and be number-aware', () => {
            expect(field.compareTaskSortKeys('9', '10', 'true and false')).toEqual(BEFORE);
            expect(field.compareTaskSortKeys('ABCDE', 'abcde', 'ABCDE and abcde')).toEqual(AFTER);
        });

        // TODO array
        // TODO TaskDates

        it('should refuse to compare values of different types (other than null)', () => {
            const valueA = 42;
            const valueB = '97';
            const t = () => {
                field.compareTaskSortKeys(valueA, valueB, 'group by function something or other...');
            };
            expect(t).toThrow(Error);
            expect(t).toThrowError(
                "Unable to compare two different types: 'number' and 'string' order for expression 'group by function something or other...'",
            );
        });
    });

    describe('error-handling', () => {
        const field = new FunctionField();

        it('should throw in comparator()', () => {
            // It's not possible to create a Comparator without a line,
            // so comparator() method needs to throw and report it cannot work.
            const t = () => {
                field.comparator();
            };
            expect(t).toThrow(Error);
        });

        it('should throw creating a normal sorter()', () => {
            const t = () => {
                field.createNormalSorter();
            };
            expect(t).toThrow(Error);
        });

        it('should throw creating a reverse sorter()', () => {
            const t = () => {
                field.createReverseSorter();
            };
            expect(t).toThrow(Error);
        });

        it('should give a meaningful error for invalid syntax', () => {
            // Arrange
            const line = 'sort by function hello';
            const query = new Query(line);
            const task = fromLine({ line: '- [ ] stuff' });

            // Act
            const result = query.applyQueryToTasks([task, task]);

            // Assert
            // TODO It would be good to include the instruction line in this error message.
            expect(result.searchErrorMessage).toMatchInlineSnapshot(`
                "Error: Search failed.
                The error message was:
                    "ReferenceError: hello is not defined""
            `);
        });

        it('should give a meaningful error for unknown task field', () => {
            const line = 'sort by function task.nonExistentField';
            const query = new Query(line);
            const task = fromLine({ line: '- [ ] stuff' });

            // Act
            const result = query.applyQueryToTasks([task, task]);

            // Assert
            expect(result.searchErrorMessage).toMatchInlineSnapshot(`
                "Error: Search failed.
                The error message was:
                    "Error: "undefined" is not a valid sort key, from expression: "sort by function task.nonExistentField"""
            `);
        });

        it('should give a meaningful error when sorting by arrays', () => {
            // Arrange
            const line = 'sort by function task.tags';
            const query = new Query(line);
            const task = fromLine({ line: '- [ ] stuff #tag1' });

            // Act
            const result = query.applyQueryToTasks([task, task]);

            // Assert
            expect(result.searchErrorMessage).toMatchInlineSnapshot(`
                "Error: Search failed.
                The error message was:
                    "Error: Unable to determine sort order for expression 'sort by function task.tags'""
            `);
        });
    });

    describe('example functions', () => {
        // Helper function to create a task with a given path
        function with_description(description: string) {
            return new TaskBuilder().description(description).build();
        }

        it('sort by function - integer expression - smaller numbers come before larger ones', () => {
            // Arrange
            const sorter = new FunctionField().createSorterFromLine('sort by function task.description.length');

            // Assert
            expect(sorter).not.toBeNull();
            expectTaskComparesEqual(sorter!, with_description('Aaa'), with_description('Aaa'));
            expectTaskComparesEqual(sorter!, with_description('AAA'), with_description('ZZZ'));

            // Sorts on string length - shorter first
            expectTaskComparesBefore(sorter!, with_description('AAA'), with_description('AAAA'));
            expectTaskComparesBefore(sorter!, with_description(''), with_description('B'));

            // Sorts on string length - longer first
            expectTaskComparesAfter(sorter!, with_description('xxxx'), with_description('x'));
        });

        it('sort by function - integer expression - reverse', () => {
            // Arrange
            const sorter = new FunctionField().createSorterFromLine('sort by function reverse task.description.length');

            // Assert
            expect(sorter).not.toBeNull();
            expectTaskComparesEqual(sorter!, with_description('Aaa'), with_description('Aaa'));

            // Sorts on string length - shorter first
            expectTaskComparesAfter(sorter!, with_description('AAA'), with_description('AAAA'));

            // Sorts on string length - longer first
            expectTaskComparesBefore(sorter!, with_description('xxxx'), with_description('x'));
        });

        it('sort by function - string expression - case-insensitive, number sort', () => {
            // Arrange
            const sorter = new FunctionField().createSorterFromLine('sort by function task.originalMarkdown');

            // Assert
            expect(sorter).not.toBeNull();
            expectTaskComparesBefore(sorter!, fromLine({ line: '- [ ] Hello' }), fromLine({ line: '* [ ] Hello' }));
            expectTaskComparesBefore(sorter!, fromLine({ line: '* [ ] Apple' }), fromLine({ line: '* [ ] Hello' }));
            expectTaskComparesBefore(sorter!, fromLine({ line: '* [ ] Apple' }), fromLine({ line: '* [ ] APPLE' })); // case-insensitive
            expectTaskComparesAfter(sorter!, fromLine({ line: '- [ ] 10 Hello' }), fromLine({ line: '- [ ] 9 Hello' }));
            expectTaskComparesAfter(sorter!, fromLine({ line: '* [ ] Hello' }), fromLine({ line: '- [ ] Hello' }));
        });

        it('sort by function - boolean expression - false sorts before true', () => {
            // Arrange
            const sorter = new FunctionField().createSorterFromLine('sort by function task.isDone');
            const todoTask = fromLine({ line: '- [ ] todo' });
            const doneTask = fromLine({ line: '- [x] done' });

            // Assert
            expect(sorter).not.toBeNull();
            expectTaskComparesBefore(sorter!, todoTask, doneTask);
        });
    });
});

// -----------------------------------------------------------------------------------------------------------------
// Grouping
// -----------------------------------------------------------------------------------------------------------------

afterEach(() => {
    jest.useRealTimers();
});

function createGrouper(line: string) {
    const grouper = new FunctionField().createGrouperFromLine(line);
    expect(grouper).not.toBeNull();
    return grouper;
}

describe('FunctionField - grouping - basics', () => {
    it('should support grouping', () => {
        const field = new FunctionField();
        expect(field.supportsGrouping()).toEqual(true);
    });

    it('should parse "group by function" line', () => {
        // Arrange
        const field = new FunctionField();
        const instruction = 'group by function task.path.startsWith("journal/") ? "journal/" : task.path';

        // Assert
        const grouper = field.createGrouperFromLine(instruction);
        expect(grouper).not.toBeNull();
        expect(grouper?.reverse).toEqual(false);
    });

    it('should parse "group by function reverse" line', () => {
        // Arrange
        const field = new FunctionField();
        const instruction = 'group by function reverse task.path.startsWith("journal/") ? "journal/" : task.path';

        // Assert
        const grouper = field.createGrouperFromLine(instruction);
        expect(grouper).not.toBeNull();
        expect(grouper?.reverse).toEqual(true);
    });
});

describe('FunctionField - grouping - error-handling', () => {
    it('should throw in grouper()', () => {
        // It's not possible to create a GrouperFunction without a line,
        // so grouper() method needs to throw and report it cannot work.
        const field = new FunctionField();
        const t = () => {
            field.grouper();
        };
        expect(t).toThrow(Error);
    });

    it('should give a meaningful error for invalid syntax', () => {
        const line = 'group by function hello';
        const grouper = createGrouper(line);
        toGroupTaskWithPath(grouper, 'journal/a/b.md', [
            'Error: Failed calculating expression "hello".\nThe error message was:\n    "ReferenceError: hello is not defined"',
        ]);
    });

    it('should give a meaningful error for unknown task field', () => {
        const line = 'group by function task.nonExistentField';
        const grouper = createGrouper(line);
        toGroupTaskFromBuilder(grouper, new TaskBuilder(), [
            'Error: Failed calculating expression "task.nonExistentField". The error message was: Cannot read properties of undefined (reading \'toString\')',
        ]);
    });
});

describe('FunctionField - grouping return types', () => {
    const expressionsAndResults = [
        ['"hello"', ['hello']],
        ['""', ['']],
        ['[]', []],
        ['"" || "No value"', ['No value']],
        ['false', ['false']],
        ['true', ['true']],
        ['1', ['1']],
        ['0', ['0']],
        ['0 || "No value"', ['No value']],
        ['1.0765456', ['1.0765456']],
        ['1.0765456.toFixed(3)', ['1.077']],
        ['["heading1", "heading2"]', ['heading1', 'heading2']], // return two headings, indicating that this task should be displayed twice, once in each heading
        ['[1, 2]', ['1', '2']], // return two headings, that need to be converted to strings
        ['null', []],
        ['null || "No value"', ['No value']],
        [
            'undefined',
            [
                'Error: Failed calculating expression "undefined". The error message was: Cannot read properties of undefined (reading \'toString\')',
            ],
        ],
        ['undefined || "No value"', ['No value']],
        [
            // Should allow manual escaping of markdown
            String.raw`"I _am_ not _italic_".replaceAll("_", "\\_")`,
            [String.raw`I \_am\_ not \_italic\_`],
        ],
    ];

    it.each(expressionsAndResults)("expression: '%s'", (expression: any, result: any) => {
        const line = `group by function ${expression}`;
        const grouper = createGrouper(line);
        toGroupTaskFromBuilder(grouper, new TaskBuilder(), result);
    });
});

describe('FunctionField - grouping - example functions', () => {
    it('should display booleans in a meaningful way', () => {
        const line = "group by function task.status.symbol === '/'";
        const grouper = createGrouper(line);
        toGroupTaskWithPath(grouper, 'journal/a/b.md', ['false']);
    });

    it('using root and path', () => {
        // Note: This will change to task.file.path
        const line = 'group by function task.path.startsWith("journal/") ? "journal/" : task.path';
        const grouper = createGrouper(line);

        toGroupTaskWithPath(grouper, 'journal/a/b.md', ['journal/']);
        toGroupTaskWithPath(grouper, 'hello/world/from-me.md', ['hello/world/from-me.md']);
        toGroupTaskWithPath(grouper, 'file-in-root-folder.md', ['file-in-root-folder.md']);
    });

    it('using path stripping folder', () => {
        const line = 'group by function task.path.replace("some/prefix/", "")';
        const grouper = createGrouper(line);

        toGroupTaskWithPath(grouper, 'a/b/c.md', ['a/b/c.md']);
    });

    it('group by priority', () => {
        const line = 'group by function task.priority';
        const grouper = createGrouper(line);
        toGroupTaskFromBuilder(grouper, new TaskBuilder().priority(Priority.Highest), ['0']);
    });

    it('group by status symbol', () => {
        // A single space as the character in a heading is not useful, so replace with something displayable:
        const line = 'group by function task.status.symbol.replace(" ", "space")';
        const grouper = createGrouper(line);
        toGroupTaskFromBuilder(grouper, new TaskBuilder().status(Status.makeCancelled()), ['-']);
        toGroupTaskFromBuilder(grouper, new TaskBuilder().status(Status.makeTodo()), ['space']);
    });

    it('group by status nextStatusSymbol', () => {
        const line = 'group by function task.status.nextStatusSymbol.replace(" ", "space")';
        const grouper = createGrouper(line);
        toGroupTaskFromBuilder(grouper, new TaskBuilder().status(Status.makeInProgress()), ['x']);
        toGroupTaskFromBuilder(grouper, new TaskBuilder().status(Status.makeDone()), ['space']);
    });

    it('group by using number', () => {
        const line = 'group by function task.description.length';
        const grouper = createGrouper(line);
        toGroupTaskFromBuilder(grouper, new TaskBuilder().description('#task Hello'), ['11']);
    });

    it('group by using string literal', () => {
        const line = 'group by function reverse "Description length: " + task.description.length';
        const grouper = createGrouper(line);
        toGroupTaskFromBuilder(grouper, new TaskBuilder().description('#task Hello'), ['Description length: 11']);
    });

    it('group by a selected tag', () => {
        const line = "group by function task.tags.find((tag) => tag.includes('#context/'))";
        const grouper = createGrouper(line);
        toGroupTaskFromBuilder(grouper, new TaskBuilder().tags(['#context/pc_home', '#topic/sys_admin']), [
            '#context/pc_home',
        ]);
    });

    it('group by a query property', () => {
        const line = 'group by function query.file.filename';
        const grouper = createGrouper(line);
        const task = new TaskBuilder().build();
        toGroupTaskUsingSearchInfo(grouper, task, new SearchInfo('queries/query file.md', [task]), ['query file.md']);
    });
});
