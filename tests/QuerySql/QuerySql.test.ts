/**
 * @jest-environment jsdom
 */
import moment from 'moment';
import { GlobalFilter } from '../../src/Config/GlobalFilter';
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
function createTaskFromLine(line: string) {
    return Task.fromLine({
        line: line + ' #task',
        taskLocation: TaskLocation.fromUnknownPosition('file.md'),
        fallbackDate: null,
    }) as Task;
}
describe('Query parsing', () => {
    // In alphabetical order, please
    const filters = [
        "WHERE moment(createdDate)->[format]('YYYY-MM-DD') > '2021-12-27'", // generic query with moment,
        "SELECT pageProperty('test') \n#raw empty",
        'SELECT queryId() \n#raw empty',
        'SELECT debugMe() \n#raw empty',

        // Add more filters here if there are any more custom functions added.
    ];

    describe('should recognize custom functions', () => {
        test.concurrent.each<string>(filters)('recognizes %j', (filter) => {
            // Arrange
            const query = new QuerySql({ source: filter, sourcePath: '', frontmatter: {} });

            // Act
            query.applyQueryToTasks([]);

            // Assert
            if (query.rawResults === undefined) {
                expect(query.error).toBeUndefined();
            } else {
                expect(query.error).toBe('To view results please open the console.');
            }
        });
    });

    describe('custom functions', () => {
        it('should return query id when queryId() is called', () => {
            // Arrange
            const query = new QuerySql({
                source: [
                    'CREATE TABLE one;',
                    'INSERT INTO one VALUES @{a:1}, @{a:2}, @{a:3};',
                    'SELECT queryId() AS QueryID FROM one LIMIT 1;',
                    '#raw empty',
                    '#ml',
                ].join('\n'),
                sourcePath: '',
                frontmatter: {},
            });

            // Act
            query.queryTasks([]);
            const selectResult = query.rawResults[0].QueryID;

            // Assert
            expect(query.error).toBe('To view results please open the console.');
            expect(selectResult).toBe(query.queryId);
        });
        it('should run inline function', () => {
            // Arrange
            const query = new QuerySql({
                source: [
                    "CREATE FUNCTION inLastSevenDays AS ``function(date) {return date ? date.isBetween(window.moment().subtract(7, 'days'), window.moment()) : false; }``;",
                    'WHERE inLastSevenDays(dueDate); ',
                    '#ml',
                ].join('\n'),
                sourcePath: '',
                frontmatter: {},
            });

            const tasksToTest = [
                createTaskFromLine('- [ ] Task due a long time ago 📅 2021-09-12'),
                createTaskFromLine(
                    `- [ ] Task due three days ago 📅 ${moment().subtract(3, 'days').format('YYYY-MM-DD')}`,
                ),
            ];

            // Act
            const result = query.queryTasks(tasksToTest) as Task[];
            // Assert
            expect(query.error).toBeUndefined();
            expect(result).toHaveLength(1);
            expect(result[0].dueDate?.format('YYYY-MM-DD')).toBe(moment().subtract(3, 'days').format('YYYY-MM-DD'));
        });

        // Added to vaildate scenario raised in PR.
        // Link: https://github.com/obsidian-tasks-group/obsidian-tasks/pull/1851#discussion_r1167989504
        it('should strip markdown from field', () => {
            // Arrange
            GlobalFilter.set('#task');
            const query = new QuerySql({
                source: ['ORDER BY removeMarkdown(description)'].join('\n'),
                sourcePath: '',
                frontmatter: {},
            });

            const tasksToTest = [
                createTaskFromLine('- [ ] #task Take out the trash 🔁 every week on Monday 📅 2021-11-22'),
                createTaskFromLine(
                    '- [x] #task Take out the trash 🔁 every week on Monday 📅 2021-11-15 ✅ 2021-11-15',
                ),
                createTaskFromLine('- [ ] #task **?** 📅 2021-11-22'),
                createTaskFromLine('- [ ] #task ==Profit== 📅 2021-11-22'),
                createTaskFromLine('- [ ] #task Cook dinner ⏫ ⏳ 2021-11-23'),
                createTaskFromLine('- [ ] #task Bake a cake 🔼 🛫 2021-11-25'),
                createTaskFromLine('- [ ] #task Feed the baby 🔽 📅 2021-11-21'),
            ];

            // Act
            const result = query.queryTasks(tasksToTest) as Task[];

            // Assert
            expect(query.error).toBeUndefined();
            expect(result).toHaveLength(7);
            // Check is order matches how tasks query engine works.
            expect(result[0].description).toBe(tasksToTest[2].description);
            expect(result[1].description).toBe(tasksToTest[5].description);
            expect(result[2].description).toBe(tasksToTest[4].description);
            expect(result[3].description).toBe(tasksToTest[6].description);
            expect(result[4].description).toBe(tasksToTest[3].description);
            expect(result[5].description).toBe(tasksToTest[0].description);
            expect(result[6].description).toBe(tasksToTest[1].description);
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
            [
                'after created date',
                {
                    filters: ["WHERE moment(createdDate)->[format]('YYYY-MM-DD') > '2021-12-27'"],
                    tasks: [
                        '- [ ] Task after ➕ 2022-12-01',
                        '- [ ] Task after ➕ 2022-01-01',
                        '- [ ] Task after ➕ 2022-12-03',
                        '- [ ] Task after ➕ 2022-12-02',
                        '- [ ] Task after ➕ 2022-12-05',
                        '- [ ] Task before ➕ 2020-12-01',
                        '- [ ] Task before ➕ 2020-01-01',
                        '- [ ] Task before ➕ 2020-12-03',
                        '- [ ] Task before ➕ 2020-12-02',
                        '- [ ] Task before ➕ 2020-12-05',
                    ],
                    expectedResult: [
                        '- [ ] Task after ➕ 2022-12-01',
                        '- [ ] Task after ➕ 2022-01-01',
                        '- [ ] Task after ➕ 2022-12-03',
                        '- [ ] Task after ➕ 2022-12-02',
                        '- [ ] Task after ➕ 2022-12-05',
                    ],
                },
            ],
            [
                'after created date no moment',
                {
                    filters: ["WHERE createdDate > DATE('2021-12-27')"],
                    tasks: [
                        '- [ ] Task after ➕ 2022-12-01',
                        '- [ ] Task after ➕ 2022-01-01',
                        '- [ ] Task after ➕ 2022-12-03',
                        '- [ ] Task after ➕ 2022-12-02',
                        '- [ ] Task after ➕ 2022-12-05',
                        '- [ ] Task before ➕ 2020-12-01',
                        '- [ ] Task before ➕ 2020-01-01',
                        '- [ ] Task before ➕ 2020-12-03',
                        '- [ ] Task before ➕ 2020-12-02',
                        '- [ ] Task before ➕ 2020-12-05',
                    ],
                    expectedResult: [
                        '- [ ] Task after ➕ 2022-12-01',
                        '- [ ] Task after ➕ 2022-01-01',
                        '- [ ] Task after ➕ 2022-12-03',
                        '- [ ] Task after ➕ 2022-12-02',
                        '- [ ] Task after ➕ 2022-12-05',
                    ],
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
            let filteredTaskLines = filteredTasks.map((task) => `- [ ] ${task.toString()}`);
            expect(filteredTaskLines).toMatchObject(expectedResult);

            query.enableDirectTaskQueries = true;
            filteredTasks = query.queryTasks(filteredTasks) as Task[];
            filteredTaskLines = filteredTasks.map((task) => `- [ ] ${task.toString()}`);
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

describe('Timezones', () => {
    it('should always be UTC', () => {
        expect(new Date().getTimezoneOffset()).toBe(0);
    });
});
