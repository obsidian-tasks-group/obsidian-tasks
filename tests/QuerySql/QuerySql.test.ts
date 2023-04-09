/**
 * @jest-environment jsdom
 */
import moment from 'moment';
import { QuerySql } from '../../src/QuerySql/QuerySql';
import { Status } from '../../src/Status';
import { Priority, Task } from '../../src/Task';
//import { GlobalFilter } from '../../src/Config/GlobalFilter';
import { TaskLocation } from '../../src/TaskLocation';
//import { createTasksFromMarkdown, fromLine } from '../TestHelpers';
//import { shouldSupportFiltering } from '../TestingTools/FilterTestHelpers';
import type { FilteringCase } from '../TestingTools/FilterTestHelpers';
//import { TaskBuilder } from '../TestingTools/TaskBuilder';

window.moment = moment;

describe('Query parsing', () => {
    // In alphabetical order, please
    const filters = [
        "WHERE moment(createdDate)->[format]('YYYY-MM-DD') > '2021-12-27'", // 'created after 2021-12-27',
        // 'created before 2021-12-27',
        // 'created date is invalid',
        // 'created in 2021-12-27 2021-12-29',
        // 'created on 2021-12-27',
        // 'created this week',
        // 'description does not include wibble',
        // 'description includes AND', // Verify Query doesn't confuse this with a boolean query
        // 'description includes wibble',
        // 'done after 2021-12-27',
        // 'done before 2021-12-27',
        // 'done date is invalid',
        // 'done in 2021-12-27 2021-12-29',
        // 'done on 2021-12-27',
        // 'done this week',
        // 'done',
        // 'due after 2021-12-27',
        // 'due before 2021-12-27',
        // 'due date is invalid',
        // 'due in 2021-12-27 2021-12-29',
        // 'due on 2021-12-27',
        // 'due this week',
        // 'exclude sub-items',
        // 'filename includes wibble',
        // 'happens after 2021-12-27',
        // 'happens before 2021-12-27',
        // 'happens in 2021-12-27 2021-12-29',
        // 'happens on 2021-12-27',
        // 'happens this week',
        // 'has created date',
        // 'has done date',
        // 'has due date',
        // 'has happens date',
        // 'has scheduled date',
        // 'has start date',
        // 'has tags',
        // 'has tag',
        // 'heading does not include wibble',
        // 'heading includes AND', // Verify Query doesn't confuse this with a boolean query
        // 'heading includes wibble',
        // 'is not recurring',
        // 'is recurring',
        // 'no created date',
        // 'no due date',
        // 'no due date',
        // 'no happens date',
        // 'no scheduled date',
        // 'no start date',
        // 'no tags',
        // 'no tag',
        // 'not done',
        // 'path does not include some/path',
        // 'path includes AND', // Verify Query doesn't confuse this with a boolean query
        // 'path includes some/path',
        // 'priority is above none',
        // 'priority is below none',
        // 'priority is high',
        // 'priority is low',
        // 'priority is medium',
        // 'priority is none',
        // 'recurrence does not include wednesday',
        // 'recurrence includes wednesday',
        // 'scheduled after 2021-12-27',
        // 'scheduled before 2021-12-27',
        // 'scheduled date is invalid',
        // 'scheduled in 2021-12-27 2021-12-29',
        // 'scheduled on 2021-12-27',
        // 'scheduled this week',
        // 'start date is invalid',
        // 'starts after 2021-12-27',
        // 'starts before 2021-12-27',
        // 'starts in 2021-12-27 2021-12-29',
        // 'starts on 2021-12-27',
        // 'starts this week',
        // 'status.name includes cancelled',
        // 'status.type is IN_PROGRESS',
        // 'tag does not include #sometag',
        // 'tag does not include sometag',
        // 'tag includes #sometag',
        // 'tag includes AND', // Verify Query doesn't confuse this with a boolean query
        // 'tag includes sometag',
        // 'tags do not include #sometag',
        // 'tags do not include sometag',
        // 'tags include #sometag',
        // 'tags include sometag',
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
            const query = new QuerySql({ source: filter, sourcePath: '', frontmatter: {} });

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
                    status: Status.TODO,
                    description: 'description',
                    taskLocation: TaskLocation.fromUnknownPosition('Ab/C D'),
                    indentation: '',
                    listMarker: '-',
                    priority: Priority.None,
                    startDate: null,
                    scheduledDate: null,
                    dueDate: null,
                    doneDate: null,
                    recurrence: null,
                    blockLink: '',
                    tags: [],
                    originalMarkdown: '',
                    scheduledDateIsInferred: false,
                    createdDate: null,
                }),
                new Task({
                    status: Status.TODO,
                    description: 'description',
                    taskLocation: TaskLocation.fromUnknownPosition('FF/C D'),
                    indentation: '',
                    listMarker: '-',
                    priority: Priority.None,
                    startDate: null,
                    scheduledDate: null,
                    dueDate: null,
                    doneDate: null,
                    recurrence: null,
                    blockLink: '',
                    tags: [],
                    originalMarkdown: '',
                    scheduledDateIsInferred: false,
                    createdDate: null,
                }),
            ];
            const input = "WHERE path LIKE '%ab/c d%'";
            const query = new QuerySql({ source: input, sourcePath: '', frontmatter: {} });
            // Act
            let filteredTasks = [...tasks];
            filteredTasks = query.applyQueryToTasks(filteredTasks).groups[0].tasks;

            // Assert
            expect(filteredTasks.length).toEqual(1);
            expect(filteredTasks[0]).toEqual(tasks[0]);
        });

        test.concurrent.each<[string, FilteringCase]>([
            [
                'by due date presence',
                {
                    filters: ['WHERE dueDate'],
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
                    filters: ['WHERE startDate'],
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
                    filters: ['WHERE scheduledDate'],
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
                    filters: ['WHERE dueDate IS NULL'],
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
                    filters: ['WHERE startDate IS NULL'],
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
                    filters: ['WHERE scheduledDate IS NULL'],
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
                    filters: ["WHERE moment(startDate)->[format]('YYYY-MM-DD') < '2022-04-20' OR startDate IS NULL"],
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
                    filters: ["WHERE moment(scheduledDate)->[format]('YYYY-MM-DD') < '2022-04-20'"],
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
                    filters: ["WHERE moment(doneDate)->[format]('YYYY-MM-DD') < '2022-12-23'"],
                    tasks: [
                        '- [ ] I am done before filter, and should pass ✅ 2022-12-01',
                        '- [ ] I have no done date, so should fail',
                    ],
                    expectedResult: ['- [ ] I am done before filter, and should pass ✅ 2022-12-01'],
                },
            ],
        ])('should support filtering %s', (_, { tasks: allTaskLines, filters, expectedResult }) => {
            const query = new QuerySql({ source: filters.join('\n'), sourcePath: '', frontmatter: {} });

            const tasks = allTaskLines.map(
                (taskLine) =>
                    Task.fromLine({
                        line: taskLine,
                        taskLocation: TaskLocation.fromUnknownPosition(''),
                        fallbackDate: null, // For tests scheduled date needs to be set explicitly
                    }) as Task,
            );

            // Act
            let filteredTasks = [...tasks];
            filteredTasks = query.queryTasks(filteredTasks);

            // Assert
            const filteredTaskLines = filteredTasks.map((task) => `- [ ] ${task.toString()}`);
            expect(filteredTaskLines).toMatchObject(expectedResult);

            //shouldSupportFiltering(filters, allTaskLines, expectedResult);
        });
    });

    //     describe('comments', () => {
    //         it('ignores comments', () => {
    //             // Arrange
    //             const input = '# I am a comment, which will be ignored';
    //             const query = new Query({ source: input });
    //             // Assert
    //             expect(query.error).toBeUndefined();
    //         });
    //     });
});
