/**
 * @jest-environment jsdom
 */
import moment from 'moment';
import { Query } from '../../src/Query/Query';
import { TasksFile } from '../../src/Scripting/TasksFile';
import { Status } from '../../src/Statuses/Status';
import { Task } from '../../src/Task/Task';
import { TaskLocation } from '../../src/Task/TaskLocation';
import { fieldCreators } from '../../src/Query/FilterParser';
import type { Field } from '../../src/Query/Filter/Field';
import type { BooleanField } from '../../src/Query/Filter/BooleanField';
import { SearchInfo } from '../../src/Query/SearchInfo';
import { FilterOrErrorMessage } from '../../src/Query/Filter/FilterOrErrorMessage';
import { Explanation } from '../../src/Query/Explain/Explanation';
import { Filter } from '../../src/Query/Filter/Filter';
import { DescriptionField } from '../../src/Query/Filter/DescriptionField';
import { createTasksFromMarkdown, fromLine } from '../TestingTools/TestHelpers';
import type { FilteringCase } from '../TestingTools/FilterTestHelpers';
import { shouldSupportFiltering } from '../TestingTools/FilterTestHelpers';
import { TaskBuilder } from '../TestingTools/TaskBuilder';
import { Priority } from '../../src/Task/Priority';

window.moment = moment;

interface NamedField {
    name: string;
    field: Field;
}
const namedFields: ReadonlyArray<NamedField> = fieldCreators
    .map((creator) => {
        const field = creator();
        return { name: field.fieldName(), field };
    })
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));

function sortInstructionLines(filters: ReadonlyArray<string>) {
    // Sort a copy of the array of filters.
    return [...filters].sort((a: string, b: string) => a.localeCompare(b, undefined, { numeric: true }));
}

describe('Query parsing', () => {
    // In alphabetical order, please
    const filters: ReadonlyArray<string> = [
        // NEW_QUERY_INSTRUCTION_EDIT_REQUIRED
        '"due this week" AND "description includes Hello World"',
        '(due this week) AND (description includes Hello World)',
        '[due this week] AND [description includes Hello World]',
        '{due this week} AND {description includes Hello World}',
        'cancelled after 2021-12-27',
        'cancelled before 2021-12-27',
        'cancelled date is invalid',
        'cancelled in 2021-12-27 2021-12-29',
        'cancelled on 2021-12-27',
        'cancelled this week',
        'created after 2021-12-27',
        'created before 2021-12-27',
        'created date is invalid',
        'created in 2021-12-27 2021-12-29',
        'created on 2021-12-27',
        'created this week',
        'description does not include wibble',
        'description includes AND', // Verify Query doesn't confuse this with a boolean query
        'description includes wibble',
        'done',
        'done after 2021-12-27',
        'done before 2021-12-27',
        'done date is invalid',
        'done in 2021-12-27 2021-12-29',
        'done on 2021-12-27',
        'done this week',
        'due after 2021-12-27',
        'due before 2021-12-27',
        'due date is invalid',
        'due in 2021-12-27 2021-12-29',
        'due on 2021-12-27',
        'due this week',
        'exclude sub-items',
        'filename includes wibble',
        'filter by function task.isDone', // This cannot contain any () because of issue #1500
        'folder does not include some/path',
        'folder includes AND', // Verify Query doesn't confuse this with a boolean query
        'folder includes some/path',
        'happens after 2021-12-27',
        'happens before 2021-12-27',
        'happens in 2021-12-27 2021-12-29',
        'happens on 2021-12-27',
        'happens this week',
        'has cancelled date',
        'has created date',
        'has depends on',
        'has done date',
        'has due date',
        'has happens date',
        'has id',
        'has scheduled date',
        'has start date',
        'has tag',
        'has tags',
        'heading does not include wibble',
        'heading includes AND', // Verify Query doesn't confuse this with a boolean query
        'heading includes wibble',
        'id does not include abc123',
        'id includes abc123',
        'id includes AND', // Verify Query doesn't confuse this with a boolean query
        'is blocked',
        'is blocking',
        'is not blocked',
        'is not blocking',
        'is not recurring',
        'is recurring',
        'no cancelled date',
        'no created date',
        'no depends on',
        'no due date',
        'no happens date',
        'no id',
        'no scheduled date',
        'no start date',
        'no tag',
        'no tags',
        'not done',
        'path does not include some/path',
        'path includes AND', // Verify Query doesn't confuse this with a boolean query
        'path includes some/path',
        'priority is above none',
        'priority is below none',
        'priority is high',
        'priority is low',
        'priority is medium',
        'priority is none',
        'recurrence does not include wednesday',
        'recurrence includes wednesday',
        'root does not include some',
        'root includes AND', // Verify Query doesn't confuse this with a boolean query
        'root includes some',
        'scheduled after 2021-12-27',
        'scheduled before 2021-12-27',
        'scheduled date is invalid',
        'scheduled in 2021-12-27 2021-12-29',
        'scheduled on 2021-12-27',
        'scheduled this week',
        'start date is invalid',
        'starts after 2021-12-27',
        'starts before 2021-12-27',
        'starts in 2021-12-27 2021-12-29',
        'starts on 2021-12-27',
        'starts this week',
        'status.name includes cancelled',
        'status.type is IN_PROGRESS',
        'tag does not include #sometag',
        'tag does not include sometag',
        'tag includes #sometag',
        'tag includes AND', // Verify Query doesn't confuse this with a boolean query
        'tag includes sometag',
        'tags do not include #sometag',
        'tags do not include sometag',
        'tags include #sometag',
        'tags include sometag',
    ];

    /**
     * As more and more filters are added via the Field class, and tested
     * outside of this test file, there is the chance that someone thinks that
     * they have correctly added a new filter option, but forgotten to register
     * it in the FilterParser.ts file.
     *
     * This set of tests exists as a growing list of sample filters, and purely checks
     * that the Query class parses them successfully.
     *
     * A failure here means that the Query constructor or FilterParser.ts is missing code to
     * recognise one of the supported instructions.
     */
    describe('should recognise every supported filter', () => {
        test.concurrent.each<string>(filters)('recognises %j', (filter) => {
            // Arrange
            const query = new Query(filter);
            const queryUpperCase = new Query(filter.toUpperCase());

            // Assert
            expect(query.error).toBeUndefined();
            expect(query.filters.length).toEqual(1);
            expect(query.filters[0]).toBeDefined();

            // Assert Uppercase
            expect(queryUpperCase.error).toBeUndefined();
            expect(queryUpperCase.filters.length).toEqual(1);
            expect(queryUpperCase.filters[0]).toBeDefined();
        });

        it('sample lines really are in alphabetical order', () => {
            expect(filters).toStrictEqual(sortInstructionLines(filters));
        });

        function linesMatchingField(field: Field | BooleanField) {
            return filters.filter((instruction) => {
                return (
                    field.canCreateFilterForLine(instruction) &&
                    field.createFilterOrErrorMessage(instruction).error === undefined
                );
            });
        }

        describe.each(namedFields)('has sufficient sample "filter" lines for field "%s"', ({ name, field }) => {
            function fieldDoesNotSupportFiltering() {
                return name === 'backlink' || name === 'urgency';
            }

            // This is a bit weaker than the corresponding tests for 'sort by' and 'group by',
            // because so many of the Field classes support multiple different search lines.
            // But it has found a few missing test cases nevertheless.
            it('has at least one sample line for filter', () => {
                const matchingLines = linesMatchingField(field);
                if (fieldDoesNotSupportFiltering()) {
                    expect(matchingLines.length).toEqual(0);
                } else {
                    expect(matchingLines.length).toBeGreaterThan(0);
                }
            });
        });
    });

    describe('should not confuse a boolean query for any other single field', () => {
        test.concurrent.each<string>(filters)('sub-query %j is recognized inside a boolean query', (filter) => {
            // Arrange
            // For every sub-query from the filters list above, compose a boolean query that is always
            // true, in the format (expression) OR NOT (expression)
            const queryString = `(${filter}) OR NOT (${filter})`;
            const query = new Query(queryString);

            const taskLine = '- [ ] this is a task due 📅 2021-09-12 #inside_tag ⏫ #some/tags_with_underscore';
            const task = fromLine({
                line: taskLine,
            });

            // Assert
            expect(query.error).toBeUndefined();
            expect(query.filters.length).toEqual(1);
            expect(query.filters[0]).toBeDefined();
            // If the boolean query and its sub-query are parsed correctly, the expression should always be true
            expect(query.filters[0].filterFunction(task, SearchInfo.fromAllTasks([task]))).toBeTruthy();
        });
    });

    describe('should recognise every sort instruction', () => {
        // In alphabetical order, please
        const filters: ReadonlyArray<string> = [
            // NEW_QUERY_INSTRUCTION_EDIT_REQUIRED
            'sort by cancelled',
            'sort by cancelled reverse',
            'sort by created',
            'sort by created reverse',
            'sort by description',
            'sort by description reverse',
            'sort by done',
            'sort by done reverse',
            'sort by due',
            'sort by due reverse',
            'sort by filename',
            'sort by filename reverse',
            'sort by function reverse task.description.length',
            'sort by function task.description.length',
            'sort by happens',
            'sort by happens reverse',
            'sort by heading',
            'sort by heading reverse',
            'sort by id',
            'sort by id reverse',
            'sort by path',
            'sort by path reverse',
            'sort by priority',
            'sort by priority reverse',
            'sort by recurring',
            'sort by recurring reverse',
            'sort by scheduled',
            'sort by scheduled reverse',
            'sort by start',
            'sort by start reverse',
            'sort by status',
            'sort by status reverse',
            'sort by status.name',
            'sort by status.name reverse',
            'sort by status.type',
            'sort by status.type reverse',
            'sort by tag',
            'sort by tag 5',
            'sort by tag reverse',
            'sort by tag reverse 3',
            'sort by urgency',
            'sort by urgency reverse',
        ];
        test.concurrent.each<string>(filters)('recognises %j', (filter) => {
            // Arrange
            const query = new Query(filter);
            const queryUpperCase = new Query(filter.toUpperCase());

            // Assert
            expect(query.error).toBeUndefined();
            expect(query.sorting.length).toEqual(1);
            expect(query.sorting[0]).toBeDefined();
            expect(query.sorting[0].instruction).toEqual(filter);

            // Assert Uppercase
            expect(queryUpperCase.error).toBeUndefined();
            expect(queryUpperCase.sorting.length).toEqual(1);
            expect(queryUpperCase.sorting[0]).toBeDefined();
        });

        it('sample lines really are in alphabetical order', () => {
            expect(filters).toStrictEqual(sortInstructionLines(filters));
        });

        function linesMatchingField(field: Field | BooleanField) {
            return filters.filter((instruction) => field.createSorterFromLine(instruction) !== null);
        }

        describe.each(namedFields)('has sufficient sample "sort by" lines for field "%s"', ({ field }) => {
            if (!field.supportsSorting()) {
                return;
            }

            const matchingLines = linesMatchingField(field);

            it('has at least one test for normal sorting', () => {
                expect(matchingLines.filter((line) => !line.includes(' reverse')).length).toBeGreaterThan(0);
            });

            it('has at least one test for reverse sorting', () => {
                expect(matchingLines.filter((line) => line.includes(' reverse')).length).toBeGreaterThan(0);
            });
        });
    });

    describe('should recognise every group instruction', () => {
        // In alphabetical order, please
        const filters: ReadonlyArray<string> = [
            // NEW_QUERY_INSTRUCTION_EDIT_REQUIRED
            'group by backlink',
            'group by backlink reverse',
            'group by cancelled',
            'group by cancelled reverse',
            'group by created',
            'group by created reverse',
            'group by done',
            'group by done reverse',
            'group by due',
            'group by due reverse',
            'group by filename',
            'group by filename reverse',
            'group by folder',
            'group by folder reverse',
            'group by function reverse task.status.symbol.replace(" ", "space")',
            'group by function task.file.path.replace(query.file.folder, "")',
            'group by function task.status.symbol.replace(" ", "space")',
            'group by happens',
            'group by happens reverse',
            'group by heading',
            'group by heading reverse',
            'group by id',
            'group by id reverse',
            'group by path',
            'group by path reverse',
            'group by priority',
            'group by priority reverse',
            'group by recurrence',
            'group by recurrence reverse',
            'group by recurring',
            'group by recurring reverse',
            'group by root',
            'group by root reverse',
            'group by scheduled',
            'group by scheduled reverse',
            'group by start',
            'group by start reverse',
            'group by status',
            'group by status reverse',
            'group by status.name',
            'group by status.name reverse',
            'group by status.type',
            'group by status.type reverse',
            'group by tags',
            'group by tags reverse',
            'group by urgency',
            'group by urgency reverse',
        ];
        test.concurrent.each<string>(filters)('recognises %j', (filter) => {
            // Arrange
            const query = new Query(filter);
            const queryUpperCase = new Query(filter.toUpperCase());

            // Assert
            expect(query.error).toBeUndefined();
            expect(query.grouping.length).toEqual(1);
            expect(query.grouping[0]).toBeDefined();
            expect(query.grouping[0].instruction).toEqual(filter);

            // Assert
            expect(queryUpperCase.error).toBeUndefined();
            expect(queryUpperCase.grouping.length).toEqual(1);
            expect(queryUpperCase.grouping[0]).toBeDefined();
        });

        it('sample lines really are in alphabetical order', () => {
            expect(filters).toStrictEqual(sortInstructionLines(filters));
        });

        function linesMatchingField(field: Field | BooleanField) {
            return filters.filter((instruction) => field.createGrouperFromLine(instruction) !== null);
        }

        describe.each(namedFields)('has sufficient sample "group by" lines for field "%s"', ({ field }) => {
            if (!field.supportsGrouping()) {
                return;
            }

            const matchingLines = linesMatchingField(field);

            it('has at least one test for normal grouping', () => {
                expect(matchingLines.filter((line) => !line.includes(' reverse')).length).toBeGreaterThan(0);
            });

            it('has at least one test for reverse grouping', () => {
                expect(matchingLines.filter((line) => line.includes(' reverse')).length).toBeGreaterThan(0);
            });
        });
    });

    describe('should recognise every other instruction', () => {
        // In alphabetical order, please
        const filters: ReadonlyArray<string> = [
            '# Comment lines are ignored',
            'explain',
            'full',
            'full mode',
            'hide backlink',
            'hide cancelled date',
            'hide created date',
            'hide depends on',
            'hide done date',
            'hide due date',
            'hide edit button',
            'hide id',
            'hide priority',
            'hide recurrence rule',
            'hide scheduled date',
            'hide start date',
            'hide tags',
            'hide task count',
            'hide urgency',
            'ignore global query',
            'limit 42',
            'limit groups 31',
            'limit groups to 31 tasks',
            'limit to 42 tasks',
            'short',
            'short mode',
            'show backlink',
            'show cancelled date',
            'show created date',
            'show depends on',
            'show done date',
            'show due date',
            'show edit button',
            'show id',
            'show priority',
            'show recurrence rule',
            'show scheduled date',
            'show start date',
            'show tags',
            'show task count',
            'show urgency',
        ];
        test.concurrent.each<string>(filters)('recognises %j', (filter) => {
            // Arrange
            const query = new Query(filter);
            const queryUpperCase = new Query(filter.toUpperCase());

            // Assert
            expect(query.error).toBeUndefined();
            expect(queryUpperCase.error).toBeUndefined();
        });

        it('sample lines really are in alphabetical order', () => {
            expect(filters).toStrictEqual(sortInstructionLines(filters));
        });
    });

    describe('should recognize boolean queries', () => {
        const filters: ReadonlyArray<string> = [
            '# Comment lines are ignored',
            '(DESCRIPTION INCLUDES wibble) OR (has due date)',
            '(has due date) OR ((HAS START DATE) AND (due after 2021-12-27))',
            '(is not recurring) XOR ((path includes ab/c) OR (happens before 2021-12-27))',
            String.raw`(description includes line 1) OR \
(description includes line 1 continued\
 with \ backslash)`,
        ];
        test.concurrent.each<string>(filters)('recognises %j', (filter) => {
            // Arrange
            const query = new Query(filter);

            // Assert
            expect(query.error).toBeUndefined();
        });
    });

    it('should parse ambiguous sort by queries correctly', () => {
        expect(new Query('sort by status').sorting[0].property).toEqual('status');
        expect(new Query('SORT BY STATUS').sorting[0].property).toEqual('status');

        expect(new Query('sort by status.name').sorting[0].property).toEqual('status.name');
        expect(new Query('SORT BY STATUS.NAME').sorting[0].property).toEqual('status.name');
    });

    it('should parse ambiguous group by queries correctly', () => {
        expect(new Query('group by status').grouping[0].property).toEqual('status');
        expect(new Query('GROUP BY STATUS').grouping[0].property).toEqual('status');

        expect(new Query('group by status.name').grouping[0].property).toEqual('status.name');
        expect(new Query('GROUP BY STATUS.NAME').grouping[0].property).toEqual('status.name');

        expect(new Query('group by status.type').grouping[0].property).toEqual('status.type');
        expect(new Query('GROUP BY STATUS.TYPE').grouping[0].property).toEqual('status.type');
    });

    it('should parse "short mode" and "full mode" correctly', () => {
        // Check 'short' mode is enabled:
        expect(new Query('short').queryLayoutOptions.shortMode).toEqual(true);
        expect(new Query('short mode').queryLayoutOptions.shortMode).toEqual(true);

        // Check that 'full' reverses short mode:
        expect(new Query('short\nfull mode').queryLayoutOptions.shortMode).toEqual(false);
        expect(new Query('short mode\nfull').queryLayoutOptions.shortMode).toEqual(false);
    });

    describe('should include instruction in parsing error messages', () => {
        function getQueryError(source: string) {
            return new Query(source, 'Example Path.md').error;
        }

        it('for invalid regular expression filter', () => {
            const source = 'description regex matches apple sauce';
            expect(getQueryError(source)).toEqual(
                String.raw`Invalid instruction: 'description regex matches apple sauce'

See https://publish.obsidian.md/tasks/Queries/Regular+Expressions

Regular expressions must look like this:
    /pattern/
or this:
    /pattern/flags

Where:
- pattern: The 'regular expression' pattern to search for.
- flags:   Optional characters that modify the search.
           i => make the search case-insensitive
           u => add Unicode support

Examples:  /^Log/
           /^Log/i
           /File Name\.md/
           /waiting|waits|waited/i
           /\d\d:\d\d/

The following characters have special meaning in the pattern:
to find them literally, you must add a \ before them:
    [\^$.|?*+()

CAUTION! Regular expression (or 'regex') searching is a powerful
but advanced feature that requires thorough knowledge in order to
use successfully, and not miss intended search results.

Problem line: "${source}"`,
            );
        });

        it('for invalid sort by', () => {
            const source = 'sort by nonsense';
            const sourceUpperCase = source.toUpperCase();
            expect(getQueryError(source)).toEqual(`do not understand query
Problem line: "${source}"`);
            expect(getQueryError(sourceUpperCase)).toEqual(`do not understand query
Problem line: "${sourceUpperCase}"`);
        });

        it('for invalid group by', () => {
            const source = 'group by nonsense';
            const sourceUpperCase = source.toUpperCase();
            expect(getQueryError(source)).toEqual(`do not understand query
Problem line: "${source}"`);
            expect(getQueryError(sourceUpperCase)).toEqual(`do not understand query
Problem line: "${sourceUpperCase}"`);
        });

        it('for invalid hide', () => {
            const source = 'hide nonsense';
            const sourceUpperCase = source.toUpperCase();
            expect(getQueryError(source)).toEqual(`do not understand query
Problem line: "${source}"`);
            expect(getQueryError(sourceUpperCase)).toEqual(`do not understand query
Problem line: "${sourceUpperCase}"`);
        });

        it('for unknown instruction', () => {
            const source = 'spaghetti';
            const sourceUpperCase = source.toUpperCase();
            expect(getQueryError(source)).toEqual(`do not understand query
Problem line: "${source}"`);
            expect(getQueryError(sourceUpperCase)).toEqual(`do not understand query
Problem line: "${sourceUpperCase}"`);
        });

        it('for instruction with continuation characters and placeholders', () => {
            const source = `spaghetti includes \\
    {{query.file.path}}`;

            expect(getQueryError(source)).toEqual(`do not understand query
Problem statement:
    spaghetti includes \\
        {{query.file.path}}
     =>
    spaghetti includes {{query.file.path}} =>
    spaghetti includes Example Path.md
`);
        });

        it('for boolean with filter-by-function closing ) swallowed by Boolean parsing', () => {
            const source = "( filter by function task.originalMarkdown.includes('hello') )";
            expect(getQueryError(source)).toMatchInlineSnapshot(`
                "Could not interpret the following instruction as a Boolean combination:
                    ( filter by function task.originalMarkdown.includes('hello') )

                The error message is:
                    malformed boolean query -- Invalid token (check the documentation for guidelines)

                The instruction was converted to the following simplified line:
                    ( f1) )

                Where the sub-expressions in the simplified line are:
                    'f1': 'filter by function task.originalMarkdown.includes('hello''
                        => ERROR:
                           Error: Failed parsing expression "task.originalMarkdown.includes('hello'".
                           The error message was:
                           "SyntaxError: missing ) after argument list"

                For help, see:
                    https://publish.obsidian.md/tasks/Queries/Combining+Filters

                Problem line: "( filter by function task.originalMarkdown.includes('hello') )""
            `);
        });

        it('for boolean with unknown instruction', () => {
            const source = '( filename includesx {{query.file.filenameWithoutExtension}} )';
            expect(getQueryError(source)).toMatchInlineSnapshot(`
                "Could not interpret the following instruction as a Boolean combination:
                    ( filename includesx Example Path )

                The error message is:
                    couldn't parse sub-expression 'filename includesx Example Path'

                The instruction was converted to the following simplified line:
                    ( f1 )

                Where the sub-expressions in the simplified line are:
                    'f1': 'filename includesx Example Path'
                        => ERROR:
                           do not understand query

                For help, see:
                    https://publish.obsidian.md/tasks/Queries/Combining+Filters

                Problem statement:
                    ( filename includesx {{query.file.filenameWithoutExtension}} ) =>
                    ( filename includesx Example Path )
                "
            `);
        });
    });

    describe('parsing placeholders', () => {
        it('should expand placeholder values in filters, but not source', () => {
            // Arrange
            const rawQuery = 'path includes {{query.file.path}}';
            const path = 'a/b/path with space.md';

            // Act
            const query = new Query(rawQuery, path);

            // Assert
            expect(query.source).toEqual(rawQuery); // Interesting that query.source still has the placeholder text
            expect(query.filters.length).toEqual(1);
            expect(query.filters[0].instruction).toEqual('path includes a/b/path with space.md');
        });

        it('should report error if placeholders used without query location', () => {
            // Arrange
            const source = 'path includes {{query.file.path}}';

            // Act
            const query = new Query(source);

            // Assert
            expect(query).not.toBeValid();
            expect(query.error).toEqual(
                'The query looks like it contains a placeholder, with "{{" and "}}"\n' +
                    'but no file path has been supplied, so cannot expand placeholder values.\n' +
                    'The query is:\n' +
                    'path includes {{query.file.path}}',
            );
            expect(query.filters.length).toEqual(0);
        });

        it('should report error if non-existent placeholder used', () => {
            // Arrange
            const source = 'path includes {{query.file.noSuchProperty}}';
            const path = 'a/b/path with space.md';

            // Act
            const query = new Query(source, path);

            // Assert
            expect(query).not.toBeValid();
            expect(query.error).toEqual(
                'There was an error expanding one or more placeholders.\n' +
                    '\n' +
                    'The error message was:\n' +
                    '    Unknown property: query.file.noSuchProperty\n' +
                    '\n' +
                    'The problem is in:\n' +
                    '    path includes {{query.file.noSuchProperty}}',
            );
            expect(query.filters.length).toEqual(0);
        });
    });
});

describe('Query', () => {
    describe('filtering', () => {
        it('filters paths case insensitive', () => {
            // Arrange
            const tasks = [
                new Task({
                    status: Status.TODO,
                    description: 'description',
                    taskLocation: TaskLocation.fromUnknownPosition(new TasksFile('Ab/C D')),
                    indentation: '',
                    listMarker: '-',
                    priority: Priority.None,
                    startDate: null,
                    scheduledDate: null,
                    dueDate: null,
                    doneDate: null,
                    cancelledDate: null,
                    recurrence: null,
                    dependsOn: [],
                    id: '',
                    blockLink: '',
                    tags: [],
                    originalMarkdown: '',
                    scheduledDateIsInferred: false,
                    createdDate: null,
                }),
                new Task({
                    status: Status.TODO,
                    description: 'description',
                    taskLocation: TaskLocation.fromUnknownPosition(new TasksFile('FF/C D')),
                    indentation: '',
                    listMarker: '-',
                    priority: Priority.None,
                    startDate: null,
                    scheduledDate: null,
                    dueDate: null,
                    doneDate: null,
                    cancelledDate: null,
                    recurrence: null,
                    dependsOn: [],
                    id: '',
                    blockLink: '',
                    tags: [],
                    originalMarkdown: '',
                    scheduledDateIsInferred: false,
                    createdDate: null,
                }),
            ];
            const source = 'path includes ab/c d';
            const query = new Query(source);

            // Act
            let filteredTasks = [...tasks];
            const searchInfo = SearchInfo.fromAllTasks(tasks);
            query.filters.forEach((filter) => {
                filteredTasks = filteredTasks.filter((task) => filter.filterFunction(task, searchInfo));
            });

            // Assert
            expect(filteredTasks.length).toEqual(1);
            expect(filteredTasks[0]).toEqual(tasks[0]);
        });

        test.concurrent.each<[string, FilteringCase]>([
            [
                'by due date presence',
                {
                    filters: ['has due date'],
                    tasks: [
                        '- [ ] task 1',
                        '- [ ] task 2 🛫 2022-04-20 ⏳ 2022-04-20 📅 2022-04-20',
                        '- [ ] task 3 📅 2022-04-20',
                    ],
                    expectedResult: [
                        '- [ ] task 2 🛫 2022-04-20 ⏳ 2022-04-20 📅 2022-04-20',
                        '- [ ] task 3 📅 2022-04-20',
                    ],
                },
            ],
            [
                'by start date presence',
                {
                    filters: ['has start date'],
                    tasks: [
                        '- [ ] task 1',
                        '- [ ] task 2 🛫 2022-04-20 ⏳ 2022-04-20 📅 2022-04-20',
                        '- [ ] task 3 🛫 2022-04-20',
                    ],
                    expectedResult: [
                        '- [ ] task 2 🛫 2022-04-20 ⏳ 2022-04-20 📅 2022-04-20',
                        '- [ ] task 3 🛫 2022-04-20',
                    ],
                },
            ],
            [
                'by scheduled date presence',
                {
                    filters: ['has scheduled date'],
                    tasks: [
                        '- [ ] task 1',
                        '- [ ] task 2 🛫 2022-04-20 ⏳ 2022-04-20 📅 2022-04-20',
                        '- [ ] task 3 ⏳ 2022-04-20',
                    ],
                    expectedResult: [
                        '- [ ] task 2 🛫 2022-04-20 ⏳ 2022-04-20 📅 2022-04-20',
                        '- [ ] task 3 ⏳ 2022-04-20',
                    ],
                },
            ],
            [
                'by due date absence',
                {
                    filters: ['no due date'],
                    tasks: [
                        '- [ ] task 1',
                        '- [ ] task 2 🛫 2022-04-20 ⏳ 2022-04-20 📅 2022-04-20',
                        '- [ ] task 3 📅 2022-04-20',
                    ],
                    expectedResult: ['- [ ] task 1'],
                },
            ],
            [
                'by start date absence',
                {
                    filters: ['no start date'],
                    tasks: [
                        '- [ ] task 1',
                        '- [ ] task 2 🛫 2022-04-20 ⏳ 2022-04-20 📅 2022-04-20',
                        '- [ ] task 3 🛫 2022-04-20',
                    ],
                    expectedResult: ['- [ ] task 1'],
                },
            ],
            [
                'by scheduled date absence',
                {
                    filters: ['no scheduled date'],
                    tasks: [
                        '- [ ] task 1',
                        '- [ ] task 2 🛫 2022-04-20 ⏳ 2022-04-20 📅 2022-04-20',
                        '- [ ] task 3 ⏳ 2022-04-20',
                    ],
                    expectedResult: ['- [ ] task 1'],
                },
            ],
            [
                'by start date (before)',
                {
                    filters: ['starts before 2022-04-20'],
                    tasks: [
                        '- [ ] task 1',
                        '- [ ] task 2 🛫 2022-04-15',
                        '- [ ] task 3 🛫 2022-04-20',
                        '- [ ] task 4 🛫 2022-04-25',
                    ],
                    expectedResult: [
                        '- [ ] task 1', // reference: https://publish.obsidian.md/tasks/Queries/Filters#Start+Date
                        '- [ ] task 2 🛫 2022-04-15',
                    ],
                },
            ],
            [
                'by scheduled date (before)',
                {
                    filters: ['scheduled before 2022-04-20'],
                    tasks: [
                        '- [ ] task 1',
                        '- [ ] task 2 ⏳ 2022-04-15',
                        '- [ ] task 3 ⏳ 2022-04-20',
                        '- [ ] task 4 ⏳ 2022-04-25',
                    ],
                    expectedResult: ['- [ ] task 2 ⏳ 2022-04-15'],
                },
            ],
            [
                'by done date (before)',
                {
                    filters: ['done before 2022-12-23'],
                    tasks: [
                        '- [ ] I am done before filter, and should pass ✅ 2022-12-01',
                        '- [ ] I have no done date, so should fail',
                    ],
                    expectedResult: ['- [ ] I am done before filter, and should pass ✅ 2022-12-01'],
                },
            ],
        ])('should support filtering %s', (_, { tasks: allTaskLines, filters, expectedResult }) => {
            shouldSupportFiltering(filters, allTaskLines, expectedResult);
            shouldSupportFiltering(
                filters.map((filter) => filter.toUpperCase()),
                allTaskLines,
                expectedResult,
            );
        });
    });

    describe('filtering with "happens"', () => {
        type HappensCase = {
            description: string;
            happensFilter: string;

            due?: string;
            scheduled?: string;
            start?: string;
            done?: string;

            taskShouldMatch: boolean;
        };

        const HappensCases: Array<HappensCase> = [
            // Assumptions made:
            // - That the date-parsing is valid, and we do not need to validate dates

            // ----------------------------------------------------------------
            // Simple date checks - using 'on'
            {
                description: 'on: should match if due matches',
                happensFilter: 'happens on 2012-03-04',
                due: '2012-03-04',
                taskShouldMatch: true,
            },
            {
                description: 'on: should match if scheduled matches',
                happensFilter: 'happens on 2012-03-04',
                scheduled: '2012-03-04',
                taskShouldMatch: true,
            },
            {
                description: 'on: should match if start matches',
                happensFilter: 'happens on 2012-03-04',
                start: '2012-03-04',
                taskShouldMatch: true,
            },
            {
                description: 'on: the on keyword should be optional',
                happensFilter: 'happens 2012-03-04',
                start: '2012-03-04',
                taskShouldMatch: true,
            },

            // ----------------------------------------------------------------
            // Ignores 'done' date
            {
                description: 'on: should not match if only done date matches',
                happensFilter: 'happens on 2012-03-04',
                done: '2012-03-04',
                taskShouldMatch: false,
            },

            // ----------------------------------------------------------------
            // 'before'
            {
                description: 'before: should match if a date is before specified date',
                happensFilter: 'happens before 2012-03-04',
                start: '2012-03-02',
                taskShouldMatch: true,
            },
            {
                description: 'before: should not match if a date is on specified date',
                happensFilter: 'happens before 2012-03-04',
                start: '2012-03-04',
                taskShouldMatch: false,
            },
            {
                description: 'before: should not match if a date is after specified date',
                happensFilter: 'happens before 2012-03-04',
                start: '2012-03-05',
                taskShouldMatch: false,
            },

            // ----------------------------------------------------------------
            // 'after'
            {
                description: 'after: should match if a date is after specified date',
                happensFilter: 'happens after 2012-03-04',
                start: '2012-03-05',
                taskShouldMatch: true,
            },
            {
                description: 'after: should not match if a date is on specified date',
                happensFilter: 'happens after 2012-03-04',
                start: '2012-03-04',
                taskShouldMatch: false,
            },
            {
                description: 'after: should not match if a date is before specified date',
                happensFilter: 'happens after 2012-03-04',
                start: '2012-03-03',
                taskShouldMatch: false,
            },

            // ----------------------------------------------------------------
            // multiple date values
            {
                description: 'multiple dates in task: should match if any date matches',
                happensFilter: 'happens on 2012-03-04',
                due: '2012-03-04',
                scheduled: '2012-03-05',
                start: '2012-03-06',
                taskShouldMatch: true,
            },
        ];

        test.concurrent.each<HappensCase>(HappensCases)(
            'filters via "happens" correctly (%j)',
            ({ happensFilter, due, scheduled, start, done, taskShouldMatch }) => {
                // Arrange
                const line = [
                    '- [ ] this is a task',
                    !!start && `🛫 ${start}`,
                    !!scheduled && `⏳ ${scheduled}`,
                    !!due && `📅 ${due}`,
                    !!done && `✅ ${done}`,
                ]
                    .filter(Boolean)
                    .join(' ');

                const expectedResult: Array<string> = [];
                if (taskShouldMatch) {
                    expectedResult.push(line);
                }

                // Act, Assert
                shouldSupportFiltering([happensFilter], [line], expectedResult);
                shouldSupportFiltering([happensFilter.toUpperCase()], [line], expectedResult);
            },
        );
    });

    describe('filtering with boolean operators', () => {
        test.concurrent.each<[string, FilteringCase]>([
            [
                'simple OR',
                {
                    filters: ['(has due date) OR (description includes special)'],
                    tasks: [
                        '- [ ] task 1',
                        '- [ ] task 2 🛫 2022-04-20 ⏳ 2022-04-20 📅 2022-04-20',
                        '- [ ] task 3 📅 2022-04-20',
                        '- [ ] special task 4',
                    ],
                    expectedResult: [
                        '- [ ] task 2 🛫 2022-04-20 ⏳ 2022-04-20 📅 2022-04-20',
                        '- [ ] task 3 📅 2022-04-20',
                        '- [ ] special task 4',
                    ],
                },
            ],
            [
                'simple AND',
                {
                    filters: ['(has start date) AND (description includes some)'],
                    tasks: [
                        '- [ ] task 1',
                        '- [ ] some task 2 🛫 2022-04-20 ⏳ 2022-04-20 📅 2022-04-20',
                        '- [ ] any task 3 🛫 2022-04-20',
                        '- [ ] special task 4',
                    ],
                    expectedResult: ['- [ ] some task 2 🛫 2022-04-20 ⏳ 2022-04-20 📅 2022-04-20'],
                },
            ],
            [
                'simple AND NOT',
                {
                    filters: ['(has start date) AND NOT (description includes some)'],
                    tasks: [
                        '- [ ] task 1',
                        '- [ ] some task 2 🛫 2022-04-20 ⏳ 2022-04-20 📅 2022-04-20',
                        '- [ ] any task 3 🛫 2022-04-20',
                        '- [ ] special task 4',
                    ],
                    expectedResult: ['- [ ] any task 3 🛫 2022-04-20'],
                },
            ],
            [
                'simple OR NOT',
                {
                    filters: ['(has start date) OR NOT (description includes special)'],
                    tasks: [
                        '- [ ] task 1',
                        '- [ ] some task 2 🛫 2022-04-20 ⏳ 2022-04-20 📅 2022-04-20',
                        '- [ ] any task 3 🛫 2022-04-20',
                        '- [ ] special task 4',
                    ],
                    expectedResult: [
                        '- [ ] task 1',
                        '- [ ] some task 2 🛫 2022-04-20 ⏳ 2022-04-20 📅 2022-04-20',
                        '- [ ] any task 3 🛫 2022-04-20',
                    ],
                },
            ],
            [
                'simple XOR',
                {
                    filters: ['(has start date) XOR (description includes special)'],
                    tasks: [
                        '- [ ] task 1',
                        '- [ ] special task 2 🛫 2022-04-20 ⏳ 2022-04-20 📅 2022-04-20',
                        '- [ ] any task 3 🛫 2022-04-20',
                        '- [ ] special task 4',
                    ],
                    expectedResult: ['- [ ] any task 3 🛫 2022-04-20', '- [ ] special task 4'],
                },
            ],
            [
                'simple NOT',
                {
                    filters: ['NOT (has start date)'],
                    tasks: [
                        '- [ ] task 1',
                        '- [ ] special task 2 🛫 2022-04-20 ⏳ 2022-04-20 📅 2022-04-20',
                        '- [ ] any task 3 🛫 2022-04-20',
                        '- [ ] special task 4',
                    ],
                    expectedResult: ['- [ ] task 1', '- [ ] special task 4'],
                },
            ],
            [
                'AND-first composition',
                {
                    filters: ['(has start date) AND ((description includes some) OR (has due date))'],
                    tasks: [
                        '- [ ] task 1',
                        '- [ ] some task 2 🛫 2022-04-20 ⏳ 2022-04-20 📅 2022-04-20',
                        '- [ ] any task 3 🛫 2022-04-20',
                        '- [ ] any task 4 🛫 2022-04-20 📅 2022-04-20',
                        '- [ ] special task 4',
                    ],
                    expectedResult: [
                        '- [ ] some task 2 🛫 2022-04-20 ⏳ 2022-04-20 📅 2022-04-20',
                        '- [ ] any task 4 🛫 2022-04-20 📅 2022-04-20',
                    ],
                },
            ],
            [
                'OR-first composition',
                {
                    filters: ['(has start date) OR ((description includes special) AND (has due date))'],
                    tasks: [
                        '- [ ] special task 1',
                        '- [ ] some task 2 🛫 2022-04-20 ⏳ 2022-04-20 📅 2022-04-20',
                        '- [ ] any task 3 🛫 2022-04-20',
                        '- [ ] any task 4 🛫 2022-04-20 📅 2022-04-20',
                        '- [ ] special task 4 📅 2022-04-20',
                    ],
                    expectedResult: [
                        '- [ ] some task 2 🛫 2022-04-20 ⏳ 2022-04-20 📅 2022-04-20',
                        '- [ ] any task 3 🛫 2022-04-20',
                        '- [ ] any task 4 🛫 2022-04-20 📅 2022-04-20',
                        '- [ ] special task 4 📅 2022-04-20',
                    ],
                },
            ],
            [
                'NOT-first composition',
                {
                    filters: ['NOT ((has start date) OR (description includes special))'],
                    tasks: [
                        '- [ ] regular task 1',
                        '- [ ] some task 2 🛫 2022-04-20 ⏳ 2022-04-20 📅 2022-04-20',
                        '- [ ] any task 3 🛫 2022-04-20',
                        '- [ ] any task 4 🛫 2022-04-20 📅 2022-04-20',
                        '- [ ] special task 4 📅 2022-04-20',
                    ],
                    expectedResult: ['- [ ] regular task 1'],
                },
            ],
        ])('should support boolean filtering %s', (_, { tasks: allTaskLines, filters, expectedResult }) => {
            shouldSupportFiltering(filters, allTaskLines, expectedResult);
            shouldSupportFiltering(
                filters.map((filter) => filter.toUpperCase()),
                allTaskLines,
                expectedResult,
            );
        });
    });

    describe('filtering with code-based custom filters', () => {
        it('should allow a Filter to be added', () => {
            // Arrange
            const filterOrErrorMessage = new DescriptionField().createFilterOrErrorMessage('description includes xxx');
            expect(filterOrErrorMessage).toBeValid();
            const query = new Query('');
            expect(query.filters.length).toEqual(0);

            // Act
            query.addFilter(filterOrErrorMessage.filter!);

            // Assert
            expect(query.filters.length).toEqual(1);
        });
    });

    describe('SearchInfo', () => {
        it('should pass SearchInfo through to filter functions', () => {
            // Arrange
            const same1 = new TaskBuilder().description('duplicate').build();
            const same2 = new TaskBuilder().description('duplicate').build();
            const different = new TaskBuilder().description('different').build();
            const allTasks = [same1, same2, different];

            const moreThanOneTaskHasThisDescription = (task: Task, searchInfo: SearchInfo) => {
                return searchInfo.allTasks.filter((t) => t.description === task.description).length > 1;
            };
            const filter = FilterOrErrorMessage.fromFilter(
                new Filter('stuff', moreThanOneTaskHasThisDescription, new Explanation('explanation of stuff')),
            );

            // Act, Assert
            const searchInfo = SearchInfo.fromAllTasks(allTasks);
            expect(filter).toMatchTaskWithSearchInfo(same1, searchInfo);
            expect(filter).toMatchTaskWithSearchInfo(same2, searchInfo);
            expect(filter).not.toMatchTaskWithSearchInfo(different, searchInfo);
        });

        it('should pass the query path through to filter functions', () => {
            // Arrange
            const queryPath = 'this/was/passed/in/correctly.md';
            const query = new Query('', queryPath);

            const matchesIfSearchInfoHasCorrectPath = (_task: Task, searchInfo: SearchInfo) => {
                return searchInfo.queryPath === queryPath;
            };
            query.addFilter(
                new Filter('instruction', matchesIfSearchInfoHasCorrectPath, new Explanation('explanation')),
            );

            // Act
            const task = new TaskBuilder().build();
            const results = query.applyQueryToTasks([task]);

            // Assert
            // The task will match if the correct path.
            expect(results.totalTasksCount).toEqual(1);
        });
    });

    describe('sorting', () => {
        const doneTask = new TaskBuilder().status(Status.DONE).build();
        const todoTask = new TaskBuilder().status(Status.TODO).build();

        it('sort reverse returns -0 for equal tasks', () => {
            // This test was added when I discovered that reverse sort returns
            // -0 for equivalent tasks.
            // This is a test to demonstrate that current behevaiour,
            // rather than a test of the **required** behaviour.
            // If the behaviour changes and '0' is returned instead of '-0',
            // that is absolutely fine.
            const query = new Query('sort by status reverse');
            const sorter = query.sorting[0];

            const searchInfo = SearchInfo.fromAllTasks([todoTask, doneTask]);

            expect(sorter!.comparator(todoTask, doneTask, searchInfo)).toEqual(1);
            expect(sorter!.comparator(doneTask, doneTask, searchInfo)).toEqual(-0); // Note the minus sign. It's a consequence of
            expect(sorter!.comparator(doneTask, todoTask, searchInfo)).toEqual(-1);
        });
    });

    describe('comments', () => {
        it('ignores comments', () => {
            // Arrange
            const source = '# I am a comment, which will be ignored';
            const query = new Query(source);

            // Assert
            expect(query.error).toBeUndefined();
        });
    });

    describe('explanations', () => {
        // Most tests of explanations are in Explainer.test.ts
        it('should explain 1 filter', () => {
            const source = 'description includes hello';
            const query = new Query(source);
            expect(query.explainQuery()).toMatchInlineSnapshot(`
                "description includes hello

                No grouping instructions supplied.

                No sorting instructions supplied.
                "
            `);
        });
    });

    // This tests the parsing of 'group by' instructions.
    // Group.test.ts tests the actual grouping code.
    describe('grouping instructions', () => {
        it('should default to ungrouped', () => {
            // Arrange
            const source = '';
            const query = new Query(source);

            // Assert
            expect(query.grouping.length).toEqual(0);
        });

        it('should parse a supported group command without error', () => {
            // Arrange
            const source = 'group by path';
            const query = new Query(source);
            const queryUpper = new Query(source.toUpperCase());

            // Assert
            expect(query.error).toBeUndefined();
            expect(queryUpper.error).toBeUndefined();

            expect(query.grouping.length).toEqual(1);
            expect(queryUpper.grouping.length).toEqual(1);
        });

        it('should work with a custom group that uses query information', () => {
            // Arrange
            const source = 'group by function query.file.path';
            const sourceUpper = 'GROUP BY FUNCTION query.file.path';

            const query = new Query(source, 'hello.md');
            const queryUpper = new Query(sourceUpper, 'hello.md');

            // Act
            const results = query.applyQueryToTasks([new TaskBuilder().build()]);
            const resultsUpper = queryUpper.applyQueryToTasks([new TaskBuilder().build()]);

            // Assert
            const groups = results.taskGroups;
            const groupsUpper = resultsUpper.taskGroups;

            expect(groups.groups.length).toEqual(1);
            expect(groupsUpper.groups.length).toEqual(1);

            expect(groups.groups[0].groups).toEqual(['hello.md']);
            expect(groupsUpper.groups[0].groups).toEqual(['hello.md']);
        });

        it('should log meaningful error for supported group type', () => {
            // Arrange
            const source = 'group by xxxx';
            const sourceUpper = source.toUpperCase();

            const query = new Query(source);
            const queryUpperr = new Query(sourceUpper);

            // Assert
            // Check that the error message contains the actual problem line
            expect(query.error).toContain(source);
            expect(queryUpperr.error).toContain(sourceUpper);

            expect(query.grouping.length).toEqual(0);
            expect(queryUpperr.grouping.length).toEqual(0);
        });

        it('should apply limit correctly, after sorting tasks', () => {
            // Arrange
            const source = `
                # sorting by status will move the incomplete tasks first
                sort by status

                # grouping by status will give two groups: Done and Todo
                group by status

                # Apply a limit, to test which tasks make it to
                limit 2
                `;
            const sourceUpper = source.toUpperCase();
            const query = new Query(source);
            const queryUpper = new Query(sourceUpper);

            const tasksAsMarkdown = `
- [x] Task 1 - should not appear in output
- [x] Task 2 - should not appear in output
- [ ] Task 3 - will be sorted to 1st place, so should pass limit
- [ ] Task 4 - will be sorted to 2nd place, so should pass limit
- [ ] Task 5 - should not appear in output
- [ ] Task 6 - should not appear in output
            `;

            const tasks = createTasksFromMarkdown(tasksAsMarkdown, 'some_markdown_file', 'Some Heading');

            // Act
            const queryResult = query.applyQueryToTasks(tasks);
            const queryUpperResult = queryUpper.applyQueryToTasks(tasks);

            // Assert
            expect(queryResult.groups.length).toEqual(1);
            expect(queryUpperResult.groups.length).toEqual(1);

            const soleTaskGroup = queryResult.groups[0];
            const soleTaskGroupUpper = queryUpperResult.groups[0];
            const expectedTasks = `
- [ ] Task 3 - will be sorted to 1st place, so should pass limit
- [ ] Task 4 - will be sorted to 2nd place, so should pass limit
`;
            expect('\n' + soleTaskGroup.tasksAsStringOfLines()).toStrictEqual(expectedTasks);
            expect('\n' + soleTaskGroupUpper.tasksAsStringOfLines()).toStrictEqual(expectedTasks);

            expect(queryResult.taskGroups.totalTasksCount()).toEqual(2);
            expect(queryUpperResult.taskGroups.totalTasksCount()).toEqual(2);

            expect(queryResult.totalTasksCountBeforeLimit).toEqual(6);
            expect(queryUpperResult.totalTasksCountBeforeLimit).toEqual(6);
        });

        it('should apply group limit correctly, after sorting tasks', () => {
            // Arrange
            const source = `
                # sorting by description will sort the tasks alphabetically
                sort by description

                # grouping by status will give two groups: Done and Todo
                group by status

                # Apply a limit, to test which tasks make it to
                limit groups 3
                `;
            const sourceUpper = source.toUpperCase();
            const query = new Query(source);
            const queryUpper = new Query(sourceUpper);

            const tasksAsMarkdown = `
- [x] Task 2 - will be in the first group and sorted after next one
- [x] Task 1 - will be in the first group
- [ ] Task 4 - will be sorted to 2nd place in the second group and pass the limit
- [ ] Task 6 - will be sorted to 4th place in the second group and NOT pass the limit
- [ ] Task 3 - will be sorted to 1st place in the second group and pass the limit
- [ ] Task 5 - will be sorted to 3nd place in the second group and pass the limit
            `;

            const tasks = createTasksFromMarkdown(tasksAsMarkdown, 'some_markdown_file', 'Some Heading');

            // Act
            const queryResult = query.applyQueryToTasks(tasks);
            const queryUpperResult = queryUpper.applyQueryToTasks(tasks);

            // Assert
            expect(queryResult.groups.length).toEqual(2);
            expect(queryUpperResult.groups.length).toEqual(2);

            expect(queryResult.totalTasksCount).toEqual(5);
            expect(queryUpperResult.totalTasksCount).toEqual(5);

            expect(queryResult.groups[0].tasksAsStringOfLines()).toMatchInlineSnapshot(`
                "- [x] Task 1 - will be in the first group
                - [x] Task 2 - will be in the first group and sorted after next one
                "
            `);
            expect(queryUpperResult.groups[0].tasksAsStringOfLines()).toMatchInlineSnapshot(`
                "- [x] Task 1 - will be in the first group
                - [x] Task 2 - will be in the first group and sorted after next one
                "
            `);

            expect(queryResult.groups[1].tasksAsStringOfLines()).toMatchInlineSnapshot(`
                "- [ ] Task 3 - will be sorted to 1st place in the second group and pass the limit
                - [ ] Task 4 - will be sorted to 2nd place in the second group and pass the limit
                - [ ] Task 5 - will be sorted to 3nd place in the second group and pass the limit
                "
            `);
            expect(queryUpperResult.groups[1].tasksAsStringOfLines()).toMatchInlineSnapshot(`
                "- [ ] Task 3 - will be sorted to 1st place in the second group and pass the limit
                - [ ] Task 4 - will be sorted to 2nd place in the second group and pass the limit
                - [ ] Task 5 - will be sorted to 3nd place in the second group and pass the limit
                "
            `);

            expect(queryResult.taskGroups.totalTasksCount()).toEqual(5);
            expect(queryUpperResult.taskGroups.totalTasksCount()).toEqual(5);

            expect(queryResult.totalTasksCountBeforeLimit).toEqual(6);
            expect(queryUpperResult.totalTasksCountBeforeLimit).toEqual(6);
        });
    });

    describe('error handling', () => {
        it('should catch an exception that occurs during searching', () => {
            // Arrange
            const source = 'filter by function wibble';
            const query = new Query(source);
            const queryUpper = new Query(source.toUpperCase());
            const task = TaskBuilder.createFullyPopulatedTask();

            // Act
            const queryResult = query.applyQueryToTasks([task]);
            const queryResultUpper = queryUpper.applyQueryToTasks([task]);

            // Assert
            expect(queryResult.searchErrorMessage).toEqual(
                'Error: Search failed.\nThe error message was:\n    "ReferenceError: wibble is not defined"',
            );
            expect(queryResultUpper.searchErrorMessage).toEqual(
                'Error: Search failed.\nThe error message was:\n    "ReferenceError: WIBBLE is not defined"',
            );
        });
    });

    describe('line continuations', () => {
        it('should save the source correctly in a Statement object', () => {
            const source = String.raw`(path includes A) OR \
                (path includes {{query.file.path}})`;
            const query = new Query(source, 'Test.md');

            expect(query.error).toBeUndefined();
            const filter = query.filters[0];
            expect(filter.statement.rawInstruction).toEqual(source);
            expect(filter.statement.anyContinuationLinesRemoved).toEqual(
                '(path includes A) OR (path includes {{query.file.path}})',
            );
            expect(filter.statement.anyPlaceholdersExpanded).toEqual('(path includes A) OR (path includes Test.md)');

            // Self-consistency check:
            expect(filter.statement.anyPlaceholdersExpanded).toEqual(filter.instruction);
        });

        it('should work in group by functions', () => {
            const source = String.raw`group by function \
                const date = task.due.moment; \
                const now = moment(); \
                const label = (order, name) => '%%'+order+'%% =='+name+'=='; \
                if (!date) return label(4, 'Undated'); \
                if (date.isBefore(now, 'day')) return label(1, 'Overdue'); \
                if (date.isSame(now, 'day')) return label(2, 'Today'); \
                return label(3, 'Future');`;
            const query = new Query(source);
            expect(query.error).toBeUndefined();
        });

        it('should be explained correctly in boolean queries', () => {
            const source = String.raw`explain
(description includes line 1) OR        \
  (description includes line 1 continued\
with \ backslash)`;
            const query = new Query(source);
            const queryUpperCase = new Query(source);
            expect(query.explainQuery()).toMatchInlineSnapshot(`
                "(description includes line 1) OR        \\
                  (description includes line 1 continued\\
                with \\ backslash)
                 =>
                (description includes line 1) OR (description includes line 1 continued with \\ backslash) =>
                  OR (At least one of):
                    description includes line 1
                    description includes line 1 continued with \\ backslash

                No grouping instructions supplied.

                No sorting instructions supplied.
                "
            `);
            expect(queryUpperCase.explainQuery()).toMatchInlineSnapshot(`
                "(description includes line 1) OR        \\
                  (description includes line 1 continued\\
                with \\ backslash)
                 =>
                (description includes line 1) OR (description includes line 1 continued with \\ backslash) =>
                  OR (At least one of):
                    description includes line 1
                    description includes line 1 continued with \\ backslash

                No grouping instructions supplied.

                No sorting instructions supplied.
                "
            `);
        });
    });
});
