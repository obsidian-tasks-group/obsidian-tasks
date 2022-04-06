/**
 * @jest-environment jsdom
 */
import moment from 'moment';
import { getSettings, updateSettings } from '../src/Settings';
import { Query } from '../src/Query';
import { Priority, Status, Task } from '../src/Task';

window.moment = moment;

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
    });

    describe('filtering with "happens"', () => {
        type HappensCase = {
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
                // matches if due matches
                happensFilter: 'happens on 2012-03-04',
                due: '2012-03-04',
                taskShouldMatch: true,
            },
            {
                // matches if due scheduled matches
                happensFilter: 'happens on 2012-03-04',
                scheduled: '2012-03-04',
                taskShouldMatch: true,
            },
            {
                // matches if due start matches
                happensFilter: 'happens on 2012-03-04',
                start: '2012-03-04',
                taskShouldMatch: true,
            },
            {
                // the 'on' word is optional
                happensFilter: 'happens 2012-03-04',
                start: '2012-03-04',
                taskShouldMatch: true,
            },

            // ----------------------------------------------------------------
            // Ignores 'done' date
            {
                // does NOT match if only done date matches
                happensFilter: 'happens on 2012-03-04',
                done: '2012-03-04',
                taskShouldMatch: false,
            },

            // ----------------------------------------------------------------
            // 'before'
            {
                // the 'before' word matches dates before the given date
                happensFilter: 'happens before 2012-03-04',
                start: '2012-03-02',
                taskShouldMatch: true,
            },
            {
                // the 'before' word does not match boundary date
                happensFilter: 'happens before 2012-03-04',
                start: '2012-03-04',
                taskShouldMatch: false,
            },
            {
                // the 'before' word does not match after boundary date
                happensFilter: 'happens before 2012-03-04',
                start: '2012-03-05',
                taskShouldMatch: false,
            },

            // ----------------------------------------------------------------
            // 'after'
            {
                // the 'after' word matches dates after the given date
                happensFilter: 'happens after 2012-03-04',
                start: '2012-03-05',
                taskShouldMatch: true,
            },
            {
                // the 'after' word does not match boundary date
                happensFilter: 'happens after 2012-03-04',
                start: '2012-03-04',
                taskShouldMatch: false,
            },
            {
                // the 'after' word does not match before boundary date
                happensFilter: 'happens after 2012-03-04',
                start: '2012-03-03',
                taskShouldMatch: false,
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
