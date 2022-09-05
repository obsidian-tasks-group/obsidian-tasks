/**
 * @jest-environment jsdom
 */
import moment from 'moment';
import { Query } from '../src/Query';
import { Priority, Status, Task } from '../src/Task';
import { createTasksFromMarkdown, fromLine } from './TestHelpers';
import { shouldSupportFiltering } from './TestingTools/FilterTestHelpers';
import type { FilteringCase } from './TestingTools/FilterTestHelpers';

window.moment = moment;

describe('Query parsing', () => {
    // In alphabetical order, please
    const filters = [
        'description does not include wibble',
        'description includes AND', // Verify Query doesn't confuse this with a boolean query
        'description includes wibble',
        'done after 2021-12-27',
        'done before 2021-12-27',
        'done on 2021-12-27',
        'done',
        'due after 2021-12-27',
        'due before 2021-12-27',
        'due on 2021-12-27',
        'exclude sub-items',
        'filename includes wibble',
        'happens after 2021-12-27',
        'happens before 2021-12-27',
        'happens on 2021-12-27',
        'has done date',
        'has due date',
        'has happens date',
        'has scheduled date',
        'has start date',
        'heading does not include wibble',
        'heading includes AND', // Verify Query doesn't confuse this with a boolean query
        'heading includes wibble',
        'is not recurring',
        'is recurring',
        'no done date',
        'no due date',
        'no happens date',
        'no scheduled date',
        'no start date',
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
        'scheduled after 2021-12-27',
        'scheduled before 2021-12-27',
        'scheduled on 2021-12-27',
        'starts after 2021-12-27',
        'starts before 2021-12-27',
        'starts on 2021-12-27',
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
            const query = new Query({ source: filter });

            // Assert
            expect(query.error).toBeUndefined();
            expect(query.filters.length).toEqual(1);
            expect(query.filters[0]).toBeDefined();
        });
    });

    describe('should not confuse a boolean query for any other single field', () => {
        test.concurrent.each<string>(filters)(
            'sub-query %j is recognized inside a boolean query',
            (filter) => {
                // Arrange
                // For every sub-query from the filters list above, compose a boolean query that is always
                // true, in the format (expression) OR NOT (expression)
                const queryString = `(${filter}) OR NOT (${filter})`;
                const query = new Query({ source: queryString });

                const taskLine =
                    '- [ ] this is a task due 📅 2021-09-12 #inside_tag ⏫ #some/tags_with_underscore';
                const task = fromLine({
                    line: taskLine,
                });

                // Assert
                expect(query.error).toBeUndefined();
                expect(query.filters.length).toEqual(1);
                expect(query.filters[0]).toBeDefined();
                // If the boolean query and its sub-query are parsed correctly, the expression should always be true
                expect(query.filters[0](task)).toBeTruthy();
            },
        );
    });

    describe('should recognise every sort instruction', () => {
        // In alphabetical order, please
        const filters = [
            'sort by description reverse',
            'sort by description',
            'sort by done reverse',
            'sort by done',
            'sort by due reverse',
            'sort by due',
            'sort by path reverse',
            'sort by path',
            'sort by priority reverse',
            'sort by priority',
            'sort by scheduled reverse',
            'sort by scheduled',
            'sort by start reverse',
            'sort by start',
            'sort by status reverse',
            'sort by status',
            'sort by tag 5',
            'sort by tag reverse 3',
            'sort by tag reverse',
            'sort by tag',
            'sort by urgency reverse',
            'sort by urgency',
        ];
        test.concurrent.each<string>(filters)('recognises %j', (filter) => {
            // Arrange
            const query = new Query({ source: filter });

            // Assert
            expect(query.error).toBeUndefined();
            expect(query.sorting.length).toEqual(1);
            expect(query.sorting[0]).toBeDefined();
        });
    });

    describe('should recognise every group instruction', () => {
        // In alphabetical order, please
        const filters = [
            'group by backlink',
            'group by done',
            'group by due',
            'group by filename',
            'group by folder',
            'group by happens',
            'group by heading',
            'group by path',
            'group by priority',
            'group by recurrence',
            'group by recurrence',
            'group by root',
            'group by scheduled',
            'group by start',
            'group by status',
            'group by tags',
        ];
        test.concurrent.each<string>(filters)('recognises %j', (filter) => {
            // Arrange
            const query = new Query({ source: filter });

            // Assert
            expect(query.error).toBeUndefined();
            expect(query.grouping.length).toEqual(1);
            expect(query.grouping[0]).toBeDefined();
        });
    });

    describe('should recognise every other instruction', () => {
        // In alphabetical order, please
        const filters = [
            '# Comment lines are ignored',
            'hide backlink',
            'hide done date',
            'hide due date',
            'hide edit button',
            'hide priority',
            'hide recurrence rule',
            'hide scheduled date',
            'hide start date',
            'hide task count',
            'limit 42',
            'limit to 42 tasks',
            'short mode',
            'short',
        ];
        test.concurrent.each<string>(filters)('recognises %j', (filter) => {
            // Arrange
            const query = new Query({ source: filter });

            // Assert
            expect(query.error).toBeUndefined();
        });
    });

    describe('should recognize boolean queries', () => {
        const filters = [
            '# Comment lines are ignored',
            '(description includes wibble) OR (has due date)',
            '(has due date) OR ((has start date) AND (due after 2021-12-27))',
            '(is not recurring) XOR ((path includes ab/c) OR (happens before 2021-12-27))',
        ];
        test.concurrent.each<string>(filters)('recognises %j', (filter) => {
            // Arrange
            const query = new Query({ source: filter });

            // Assert
            expect(query.error).toBeUndefined();
        });
    });
});

describe('Query', () => {
    describe('filtering', () => {
        it('filters paths case insensitive', () => {
            // Arrange
            const tasks = [
                new Task({
                    status: Status.Todo,
                    description: 'description',
                    path: 'Ab/C D',
                    indentation: '',
                    sectionStart: 0,
                    sectionIndex: 0,
                    originalStatusCharacter: ' ',
                    precedingHeader: null,
                    priority: Priority.None,
                    startDate: null,
                    scheduledDate: null,
                    dueDate: null,
                    doneDate: null,
                    recurrence: null,
                    blockLink: '',
                    tags: [],
                }),
                new Task({
                    status: Status.Todo,
                    description: 'description',
                    path: 'FF/C D',
                    indentation: '',
                    sectionStart: 0,
                    sectionIndex: 0,
                    originalStatusCharacter: ' ',
                    precedingHeader: null,
                    priority: Priority.None,
                    startDate: null,
                    scheduledDate: null,
                    dueDate: null,
                    doneDate: null,
                    recurrence: null,
                    blockLink: '',
                    tags: [],
                }),
            ];
            const input = 'path includes ab/c d';
            const query = new Query({ source: input });

            // Act
            let filteredTasks = [...tasks];
            query.filters.forEach((filter) => {
                filteredTasks = filteredTasks.filter(filter);
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
                        '- [ ] task 1', // reference: https://obsidian-tasks-group.github.io/obsidian-tasks/queries/filters/#start-date
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
                    expectedResult: [
                        '- [ ] I am done before filter, and should pass ✅ 2022-12-01',
                    ],
                },
            ],
        ])(
            'should support filtering %s',
            (_, { tasks: allTaskLines, filters, expectedResult }) => {
                shouldSupportFiltering(filters, allTaskLines, expectedResult);
            },
        );
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
                description:
                    'before: should match if a date is before specified date',
                happensFilter: 'happens before 2012-03-04',
                start: '2012-03-02',
                taskShouldMatch: true,
            },
            {
                description:
                    'before: should not match if a date is on specified date',
                happensFilter: 'happens before 2012-03-04',
                start: '2012-03-04',
                taskShouldMatch: false,
            },
            {
                description:
                    'before: should not match if a date is after specified date',
                happensFilter: 'happens before 2012-03-04',
                start: '2012-03-05',
                taskShouldMatch: false,
            },

            // ----------------------------------------------------------------
            // 'after'
            {
                description:
                    'after: should match if a date is after specified date',
                happensFilter: 'happens after 2012-03-04',
                start: '2012-03-05',
                taskShouldMatch: true,
            },
            {
                description:
                    'after: should not match if a date is on specified date',
                happensFilter: 'happens after 2012-03-04',
                start: '2012-03-04',
                taskShouldMatch: false,
            },
            {
                description:
                    'after: should not match if a date is before specified date',
                happensFilter: 'happens after 2012-03-04',
                start: '2012-03-03',
                taskShouldMatch: false,
            },

            // ----------------------------------------------------------------
            // multiple date values
            {
                description:
                    'multiple dates in task: should match if any date matches',
                happensFilter: 'happens on 2012-03-04',
                due: '2012-03-04',
                scheduled: '2012-03-05',
                start: '2012-03-06',
                taskShouldMatch: true,
            },
        ];

        test.concurrent.each<HappensCase>(HappensCases)(
            'filters via "happens" correctly (%j)',
            ({
                happensFilter,
                due,
                scheduled,
                start,
                done,
                taskShouldMatch,
            }) => {
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
            },
        );
    });

    describe('filtering with boolean operators', () => {
        test.concurrent.each<[string, FilteringCase]>([
            [
                'simple OR',
                {
                    filters: [
                        '"has due date" OR (description includes special)',
                    ],
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
                    filters: [
                        '(has start date) AND "description includes some"',
                    ],
                    tasks: [
                        '- [ ] task 1',
                        '- [ ] some task 2 🛫 2022-04-20 ⏳ 2022-04-20 📅 2022-04-20',
                        '- [ ] any task 3 🛫 2022-04-20',
                        '- [ ] special task 4',
                    ],
                    expectedResult: [
                        '- [ ] some task 2 🛫 2022-04-20 ⏳ 2022-04-20 📅 2022-04-20',
                    ],
                },
            ],
            [
                'simple AND NOT',
                {
                    filters: [
                        '(has start date) AND NOT (description includes some)',
                    ],
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
                    filters: [
                        '(has start date) OR NOT (description includes special)',
                    ],
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
                    filters: [
                        '(has start date) XOR (description includes special)',
                    ],
                    tasks: [
                        '- [ ] task 1',
                        '- [ ] special task 2 🛫 2022-04-20 ⏳ 2022-04-20 📅 2022-04-20',
                        '- [ ] any task 3 🛫 2022-04-20',
                        '- [ ] special task 4',
                    ],
                    expectedResult: [
                        '- [ ] any task 3 🛫 2022-04-20',
                        '- [ ] special task 4',
                    ],
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
                    filters: [
                        '(has start date) AND ((description includes some) OR (has due date))',
                    ],
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
                    filters: [
                        '(has start date) OR ((description includes special) AND (has due date))',
                    ],
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
                    filters: [
                        'NOT ((has start date) OR (description includes special))',
                    ],
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
        ])(
            'should support boolean filtering %s',
            (_, { tasks: allTaskLines, filters, expectedResult }) => {
                shouldSupportFiltering(filters, allTaskLines, expectedResult);
            },
        );
    });

    describe('sorting instructions', () => {
        const cases: {
            input: string;
            output: {
                property: string;
                reverse: boolean;
                propertyInstance: number;
            }[];
        }[] = [
            {
                input: 'sort by status',
                output: [
                    {
                        property: 'status',
                        reverse: false,
                        propertyInstance: 1,
                    },
                ],
            },
            {
                input: 'sort by status\nsort by due',
                output: [
                    {
                        property: 'status',
                        reverse: false,
                        propertyInstance: 1,
                    },
                    { property: 'due', reverse: false, propertyInstance: 1 },
                ],
            },
            {
                input: 'sort by tag',
                output: [
                    { property: 'tag', reverse: false, propertyInstance: 1 },
                ],
            },
            {
                input: 'sort by tag 2',
                output: [
                    { property: 'tag', reverse: false, propertyInstance: 2 },
                ],
            },
        ];
        it.concurrent.each(cases)('sorting as %j', ({ input, output }) => {
            const query = new Query({ source: input });

            expect(query.sorting).toEqual(output);
        });
    });
    describe('comments', () => {
        it('ignores comments', () => {
            // Arrange
            const input = '# I am a comment, which will be ignored';
            const query = new Query({ source: input });

            // Assert
            expect(query.error).toBeUndefined();
        });
    });

    // This tests the parsing of 'group by' instructions.
    // Group.test.ts tests the actual grouping code.
    describe('grouping instructions', () => {
        it('should default to ungrouped', () => {
            // Arrange
            const source = '';
            const query = new Query({ source });

            // Assert
            expect(query.grouping.length).toEqual(0);
        });

        it('should parse a supported group command without error', () => {
            // Arrange
            const input = 'group by path';
            const query = new Query({ source: input });

            // Assert
            expect(query.error).toBeUndefined();
            expect(query.grouping.length).toEqual(1);
        });

        it('should log meaningful error for supported group type', () => {
            // Arrange
            const input = 'group by xxxx';
            const query = new Query({ source: input });

            // Assert
            // Check that the error message contains the actual problem line
            expect(query.error).toContain(input);
            expect(query.grouping.length).toEqual(0);
        });

        it('should apply limit correctly, after sorting tasks', () => {
            // Arrange
            const input = `
                # sorting by status will move the incomplete tasks first
                sort by status

                # grouping by status will give two groups: Done and Todo
                group by status

                # Apply a limit, to test which tasks make it to
                limit 2
                `;
            const query = new Query({ source: input });

            const tasksAsMarkdown = `
- [x] Task 1 - should not appear in output
- [x] Task 2 - should not appear in output
- [ ] Task 3 - will be sorted to 1st place, so should pass limit
- [ ] Task 4 - will be sorted to 2nd place, so should pass limit
- [ ] Task 5 - should not appear in output
- [ ] Task 6 - should not appear in output
            `;

            const tasks = createTasksFromMarkdown(
                tasksAsMarkdown,
                'some_markdown_file',
                'Some Heading',
            );

            // Act
            const groups = query.applyQueryToTasks(tasks);

            // Assert
            expect(groups.groups.length).toEqual(1);
            const soleTaskGroup = groups.groups[0];
            const expectedTasks = `
- [ ] Task 3 - will be sorted to 1st place, so should pass limit
- [ ] Task 4 - will be sorted to 2nd place, so should pass limit
`;
            expect('\n' + soleTaskGroup.tasksAsStringOfLines()).toStrictEqual(
                expectedTasks,
            );
        });
    });
});
