/**
 * @jest-environment jsdom
 */
import moment from 'moment';
import { getSettings, updateSettings } from '../src/Settings';
import { Query } from '../src/Query';
import { Status } from '../src/Status';
import { Priority, Task } from '../src/Task';
import { createTasksFromMarkdown } from './TestHelpers';

window.moment = moment;

type FilteringCase = {
    filters: Array<string>;
    tasks: Array<string>;
    expectedResult: Array<string>;
};

function shouldSupportFiltering(
    filters: Array<string>,
    allTaskLines: Array<string>,
    expectedResult: Array<string>,
) {
    // Arrange
    const query = new Query({ source: filters.join('\n') });

    const tasks = allTaskLines.map(
        (taskLine) =>
            Task.fromLine({
                line: taskLine,
                sectionStart: 0,
                sectionIndex: 0,
                path: '',
                precedingHeader: '',
            }) as Task,
    );

    // Act
    let filteredTasks = [...tasks];
    query.filters.forEach((filter) => {
        filteredTasks = filteredTasks.filter(filter);
    });

    // Assert
    const filteredTaskLines = filteredTasks.map(
        (task) => task.toFileLineString(), //  `- [ ] ${task.toString()}`,
    );
    expect(filteredTaskLines).toMatchObject(expectedResult);
}

describe('Query', () => {
    describe('filtering', () => {
        it('filters paths case insensitive', () => {
            // Arrange
            const tasks = [
                new Task({
                    status: Status.TODO,
                    description: 'description',
                    path: 'Ab/C D',
                    indentation: '',
                    sectionStart: 0,
                    sectionIndex: 0,
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
                    status: Status.TODO,
                    description: 'description',
                    path: 'FF/C D',
                    indentation: '',
                    sectionStart: 0,
                    sectionIndex: 0,
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

        it('ignores the global filter when filtering', () => {
            // Arrange
            const originalSettings = getSettings();
            updateSettings({ globalFilter: '#task' });
            const filters: Array<string> = ['description includes task'];
            const tasks: Array<string> = [
                '- [ ] #task this does not include the word; only in the global filter',
                '- [ ] #task this does: task',
            ];
            const expectedResult: Array<string> = [
                '- [ ] #task this does: task',
            ];

            // Act, Assert
            shouldSupportFiltering(filters, tasks, expectedResult);

            // Cleanup
            updateSettings(originalSettings);
        });

        it('works without a global filter', () => {
            // Arrange
            const originalSettings = getSettings();
            updateSettings({ globalFilter: '' });
            const filters: Array<string> = ['description includes task'];
            const tasks: Array<string> = [
                '- [ ] this does not include the word at all',
                '- [ ] #task this includes the word as a tag',
                '- [ ] #task this does: task',
            ];
            const expectedResult: Array<string> = [
                '- [ ] #task this includes the word as a tag',
                '- [ ] #task this does: task',
            ];

            // Act, Assert
            shouldSupportFiltering(filters, tasks, expectedResult);

            // Cleanup
            updateSettings(originalSettings);
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
                        '- [ ] task 1', // reference: https://schemar.github.io/obsidian-tasks/queries/filters/#start-date
                        '- [ ] task 2 🛫 2022-04-15',
                    ],
                },
            ],
            [
                'by due date (before)',
                {
                    filters: ['due before 2022-04-20'],
                    tasks: [
                        '- [ ] task 1',
                        '- [ ] task 2 📅 2022-04-15',
                        '- [ ] task 3 📅 2022-04-20',
                        '- [ ] task 4 📅 2022-04-25',
                    ],
                    expectedResult: ['- [ ] task 2 📅 2022-04-15'],
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
        ])(
            'should support filtering %s',
            (_, { tasks: allTaskLines, filters, expectedResult }) => {
                shouldSupportFiltering(filters, allTaskLines, expectedResult);
            },
        );
    });

    const defaultTasksWithTags = [
        '- [ ] #task something to do #later #work',
        '- [ ] #task something to do #later #work/meeting',
        '- [ ] #task something to do #later #home',
        '- [ ] #task something to do #later #home/kitchen',
        '- [ ] #task get the milk',
        '- [ ] #task something to do #later #work #TopLevelItem/sub',
    ];

    describe('filtering with "tags"', () => {
        const TagFilteringCases: Array<[string, FilteringCase]> = [
            [
                'by tag presence',
                {
                    filters: ['tags include #home'],
                    tasks: defaultTasksWithTags,
                    expectedResult: [
                        '- [ ] #task something to do #later #home',
                        '- [ ] #task something to do #later #home/kitchen',
                    ],
                },
            ],
            [
                'by tag absence',
                {
                    filters: ['tags do not include #home'],
                    tasks: defaultTasksWithTags,
                    expectedResult: [
                        '- [ ] #task something to do #later #work',
                        '- [ ] #task something to do #later #work/meeting',
                        '- [ ] #task get the milk',
                        '- [ ] #task something to do #later #work #TopLevelItem/sub',
                    ],
                },
            ],
            [
                'by tag presence without hash',
                {
                    filters: ['tags include home'],
                    tasks: defaultTasksWithTags,
                    expectedResult: [
                        '- [ ] #task something to do #later #home',
                        '- [ ] #task something to do #later #home/kitchen',
                    ],
                },
            ],
            [
                'by tag absence without hash',
                {
                    filters: ['tags do not include home'],
                    tasks: defaultTasksWithTags,
                    expectedResult: [
                        '- [ ] #task something to do #later #work',
                        '- [ ] #task something to do #later #work/meeting',
                        '- [ ] #task get the milk',
                        '- [ ] #task something to do #later #work #TopLevelItem/sub',
                    ],
                },
            ],

            [
                'by tag presence case insensitive',
                {
                    filters: ['tags include #HoMe'],
                    tasks: defaultTasksWithTags,
                    expectedResult: [
                        '- [ ] #task something to do #later #home',
                        '- [ ] #task something to do #later #home/kitchen',
                    ],
                },
            ],
            [
                'by tag absence case insensitive',
                {
                    filters: ['tags do not include #HoMe'],
                    tasks: defaultTasksWithTags,
                    expectedResult: [
                        '- [ ] #task something to do #later #work',
                        '- [ ] #task something to do #later #work/meeting',
                        '- [ ] #task get the milk',
                        '- [ ] #task something to do #later #work #TopLevelItem/sub',
                    ],
                },
            ],
            [
                'by tag presence without hash case insensitive',
                {
                    filters: ['tags include HoMe'],
                    tasks: defaultTasksWithTags,
                    expectedResult: [
                        '- [ ] #task something to do #later #home',
                        '- [ ] #task something to do #later #home/kitchen',
                    ],
                },
            ],
            [
                'by tag absence without hash case insensitive',
                {
                    filters: ['tags do not include HoMe'],
                    tasks: defaultTasksWithTags,
                    expectedResult: [
                        '- [ ] #task something to do #later #work',
                        '- [ ] #task something to do #later #work/meeting',
                        '- [ ] #task get the milk',
                        '- [ ] #task something to do #later #work #TopLevelItem/sub',
                    ],
                },
            ],
            [
                'by tag presence without hash case insensitive and substring',
                {
                    filters: ['tags include TopLevelItem'],
                    tasks: defaultTasksWithTags,
                    expectedResult: [
                        '- [ ] #task something to do #later #work #TopLevelItem/sub',
                    ],
                },
            ],
            [
                'by tag absence without hash case insensitive and substring',
                {
                    filters: ['tags do not include TopLevelItem'],
                    tasks: defaultTasksWithTags,
                    expectedResult: [
                        '- [ ] #task something to do #later #work',
                        '- [ ] #task something to do #later #work/meeting',
                        '- [ ] #task something to do #later #home',
                        '- [ ] #task something to do #later #home/kitchen',
                        '- [ ] #task get the milk',
                    ],
                },
            ],
        ];

        test.concurrent.each<[string, FilteringCase]>(TagFilteringCases)(
            'should filter tag with globalFilter %s',
            (_, { tasks: allTaskLines, filters, expectedResult }) => {
                // Arrange
                const originalSettings = getSettings();
                updateSettings({ globalFilter: '#task' });

                // Run on the plural version of the filter first.
                shouldSupportFiltering(filters, allTaskLines, expectedResult);

                // Run a remap of filter to use alternative grammar for single and plural tag/tags.
                // tags include #home vs tag includes #home. The first is preferred as it is a collection.
                //  tags -> tag
                //  include -> includes
                //  does not include -> do not include
                filters.map((filter) => {
                    return filter
                        .replace('tags', 'tag')
                        .replace('include', 'includes')
                        .replace('does not include', 'do not include');
                });

                shouldSupportFiltering(filters, allTaskLines, expectedResult);

                // Cleanup
                updateSettings(originalSettings);
            },
        );

        test.concurrent.each<[string, FilteringCase]>(TagFilteringCases)(
            'should filter tags without globalFilter %s',
            (_, { tasks: allTaskLines, filters, expectedResult }) => {
                // Arrange

                // Run on the plural version of the filter first.
                shouldSupportFiltering(filters, allTaskLines, expectedResult);

                // Run a remap of filter to use alternative grammar for single and plural tag/tags.
                // tags include #home vs tag includes #home. The first is preferred as it is a collection.
                //  tags -> tag
                //  include -> includes
                //  does not include -> do not include
                filters.map((filter) => {
                    return filter
                        .replace('tags', 'tag')
                        .replace('include', 'includes')
                        .replace('does not include', 'do not include');
                });

                shouldSupportFiltering(filters, allTaskLines, expectedResult);
            },
        );

        it('should filter tags without globalFilter by tag presence when it is the global tag', () => {
            // Arrange
            const originalSettings = getSettings();
            updateSettings({ globalFilter: '' });

            // Act, Assert
            shouldSupportFiltering(
                ['tags include task'],
                defaultTasksWithTags,
                defaultTasksWithTags,
            );

            // Cleanup
            updateSettings(originalSettings);
        });

        it('should filter tag with globalFilter by tag presence when it is the global tag', () => {
            // Arrange
            const originalSettings = getSettings();
            updateSettings({ globalFilter: '#task' });
            const filters: Array<string> = ['tags include task'];

            // Act, Assert
            shouldSupportFiltering(filters, defaultTasksWithTags, []);

            // Cleanup
            updateSettings(originalSettings);
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

    const defaultTasksWithStatus = [
        '- [ ] Something to do',
        '- [/] Something I am doing',
        '- [x] Something I have done',
        '- [-] Something I will no longer do',
    ];
    describe('filtering with "status"', () => {
        const TagFilteringCases: Array<[string, FilteringCase]> = [
            [
                'by valid status is',
                {
                    filters: ['status is x'],
                    tasks: defaultTasksWithStatus,
                    expectedResult: ['- [x] Something I have done'],
                },
            ],
            [
                'by valid status is not',
                {
                    filters: ['status is not x'],
                    tasks: defaultTasksWithStatus,
                    expectedResult: [
                        '- [ ] Something to do',
                        '- [/] Something I am doing',
                        '- [-] Something I will no longer do',
                    ],
                },
            ],
            [
                'by valid status new',
                {
                    filters: ['status is /'],
                    tasks: defaultTasksWithStatus,
                    expectedResult: ['- [/] Something I am doing'],
                },
            ],
            [
                'by invalid status',
                {
                    filters: ['status is z'],
                    tasks: defaultTasksWithStatus,
                    expectedResult: defaultTasksWithStatus,
                },
            ],
        ];

        test.concurrent.each<[string, FilteringCase]>(TagFilteringCases)(
            'should filter status %s',
            (_, { tasks: allTaskLines, filters, expectedResult }) => {
                shouldSupportFiltering(filters, allTaskLines, expectedResult);
            },
        );
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
