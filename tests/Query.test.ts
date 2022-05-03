/**
 * @jest-environment jsdom
 */
import moment from 'moment';
import { getSettings, updateSettings } from '../src/Settings';
import { Query } from '../src/Query';
import { Priority, Status, Task } from '../src/Task';

window.moment = moment;

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
        (task) => `- [ ] ${task.toString()}`,
    );
    expect(filteredTaskLines).toMatchObject(expectedResult);
}

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

        it('ignores the global filter when filtering', () => {
            // Arrange
            const originalSettings = getSettings();
            updateSettings({ globalFilter: '#task' });
            const tasks: Task[] = [
                Task.fromLine({
                    line: '- [ ] #task this does not include the word; only in the global filter',
                    sectionStart: 0,
                    sectionIndex: 0,
                    path: '',
                    precedingHeader: '',
                }),
                Task.fromLine({
                    line: '- [ ] #task this does: task',
                    sectionStart: 0,
                    sectionIndex: 0,
                    path: '',
                    precedingHeader: '',
                }),
            ] as Task[];
            const input = 'description includes task';
            const query = new Query({ source: input });

            // Act
            let filteredTasks = [...tasks];
            query.filters.forEach((filter) => {
                filteredTasks = filteredTasks.filter(filter);
            });

            // Assert
            expect(filteredTasks.length).toEqual(1);
            expect(filteredTasks[0]).toEqual(tasks[1]);

            // Cleanup
            updateSettings(originalSettings);
        });

        it('works without a global filter', () => {
            // Arrange
            const originalSettings = getSettings();
            updateSettings({ globalFilter: '' });
            const tasks: Task[] = [
                Task.fromLine({
                    line: '- [ ] this does not include the word at all',
                    sectionStart: 0,
                    sectionIndex: 0,
                    path: '',
                    precedingHeader: '',
                }),
                Task.fromLine({
                    line: '- [ ] #task this includes the word as a tag',
                    sectionStart: 0,
                    sectionIndex: 0,
                    path: '',
                    precedingHeader: '',
                }),
                Task.fromLine({
                    line: '- [ ] #task this does: task',
                    sectionStart: 0,
                    sectionIndex: 0,
                    path: '',
                    precedingHeader: '',
                }),
            ] as Task[];
            const input = 'description includes task';
            const query = new Query({ source: input });

            // Act
            let filteredTasks = [...tasks];
            query.filters.forEach((filter) => {
                filteredTasks = filteredTasks.filter(filter);
            });

            // Assert
            expect(filteredTasks.length).toEqual(2);
            expect(filteredTasks[0]).toEqual(tasks[1]);
            expect(filteredTasks[1]).toEqual(tasks[2]);

            // Cleanup
            updateSettings(originalSettings);
        });

        type FilteringCase = {
            filters: Array<string>;
            tasks: Array<string>;
            expectedResult: Array<string>;
        };

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
    describe('filtering with "tag" and global task filter', () => {
        it('filters based off a single tag', () => {
            // Arrange
            const originalSettings = getSettings();
            updateSettings({ globalFilter: '#task' });
            const filters = ['tag includes #home'];
            const tasks = [
                '- [ ] #task something to do #later #work 📅 2021-09-12 ✅ 2021-06-20',
                '- [ ] #task something to do #later #home 📅 2021-09-12 ✅ 2021-06-20',
                '- [ ] #task get the milk 📅 2021-09-12 ✅ 2021-06-20',
            ];

            // Act, Assert
            const expectedResult: Array<string> = [
                '- [ ] #task something to do #later #home 📅 2021-09-12 ✅ 2021-06-20',
            ];
            shouldSupportFiltering(filters, tasks, expectedResult);

            // Cleanup
            updateSettings(originalSettings);
        });

        it('filters based off a tag not being present', () => {
            // Arrange
            const originalSettings = getSettings();
            updateSettings({ globalFilter: '#task' });
            const filters = ['tag does not include #home'];
            const tasks = [
                '- [ ] #task something to do #later #work 📅 2021-09-12 ✅ 2021-06-20',
                '- [ ] #task something to do #later #home 📅 2021-09-12 ✅ 2021-06-20',
                '- [ ] #task get the milk 📅 2021-09-12 ✅ 2021-06-20',
            ];

            // Act, Assert
            const expectedResult: Array<string> = [
                '- [ ] #task something to do #later #work 📅 2021-09-12 ✅ 2021-06-20',
                '- [ ] #task get the milk 📅 2021-09-12 ✅ 2021-06-20',
            ];
            shouldSupportFiltering(filters, tasks, expectedResult);

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
                const query = new Query({ source: happensFilter });

                const line = [
                    '- [ ] this is a task',
                    !!scheduled && `⏳ ${scheduled}`,
                    !!due && `📅 ${due}`,
                    !!start && `🛫 ${start}`,
                    !!done && `✅ ${done}`,
                ]
                    .filter(Boolean)
                    .join(' ');

                const task = Task.fromLine({
                    line,
                    path: '',
                    sectionStart: 0,
                    sectionIndex: 0,
                    precedingHeader: '',
                }) as Task;
                const tasks = [task];

                // Act
                let filteredTasks = [...tasks];
                query.filters.forEach((filter) => {
                    filteredTasks = filteredTasks.filter(filter);
                });

                // Assert
                const taskMatched = filteredTasks.length == 1;
                expect(taskMatched).toEqual(taskShouldMatch);
            },
        );
    });

    describe('sorting instructions', () => {
        const cases: {
            input: string;
            output: { property: string; reverse: boolean }[];
        }[] = [
            {
                input: 'sort by status',
                output: [{ property: 'status', reverse: false }],
            },
            {
                input: 'sort by status\nsort by due',
                output: [
                    { property: 'status', reverse: false },
                    { property: 'due', reverse: false },
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
});
