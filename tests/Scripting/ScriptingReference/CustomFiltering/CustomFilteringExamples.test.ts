/**
 * @jest-environment jsdom
 */

import moment from 'moment';
import type { Task } from '../../../../src/Task/Task';
import { fromLine, fromLines } from '../../../TestingTools/TestHelpers';
import { SampleTasks } from '../../../TestingTools/SampleTasks';
import type { CustomPropertyDocsTestData, QueryInstructionLineAndDescription } from '../VerifyFunctionFieldSamples';
import {
    verifyFunctionFieldFilterSamplesForDocs,
    verifyFunctionFieldFilterSamplesOnTasks,
} from '../VerifyFunctionFieldSamples';
import { StatusRegistry } from '../../../../src/Statuses/StatusRegistry';
import { StatusConfiguration } from '../../../../src/Statuses/StatusConfiguration';

window.moment = moment;

beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2023-06-10 20:00'));
});

afterEach(() => {
    jest.useRealTimers();
});

// NEW_QUERY_INSTRUCTION_EDIT_REQUIRED

describe('dates', () => {
    const testData: CustomPropertyDocsTestData[] = [
        // ---------------------------------------------------------------------------------
        // DATE FIELDS
        // ---------------------------------------------------------------------------------

        [
            'task.cancelled',
            [
                [
                    "filter by function task.cancelled.format('dddd') === 'Wednesday'",
                    'Find tasks cancelled on Wednesdays, that is, any Wednesday.',
                    'On non-English systems, you may need to supply the day of the week in the local language',
                ],
            ],
            SampleTasks.withAllRepresentativeCancelledDates(),
        ],

        [
            'task.created',
            [
                [
                    "filter by function task.created.format('dddd') === 'Monday'",
                    'Find tasks created on Mondays, that is, any Monday.',
                    'On non-English systems, you may need to supply the day of the week in the local language',
                ],
            ],
            SampleTasks.withAllRepresentativeCreatedDates(),
        ],

        [
            'task.done',
            [
                [
                    "filter by function task.done.format('dddd') === 'Thursday'",
                    'Find tasks done on Thursdays, that is, any Thursday.',
                    'On non-English systems, you may need to supply the day of the week in the local language',
                ],
            ],
            SampleTasks.withAllRepresentativeDoneDates(),
        ],

        [
            'task.due',
            [
                [
                    "filter by function task.due.format('dddd') === 'Tuesday'",
                    'Find tasks due on Tuesdays, that is, any Tuesday.',
                    'On non-English systems, you may need to supply the day of the week in the local language',
                ],
            ],
            SampleTasks.withAllRepresentativeDueDates(),
        ],

        [
            'task.due.advanced',
            [
                [
                    // comment to force line break
                    `filter by function \\
    const date = task.due.moment; \\
    return date ? !date.isValid() : false;`,
                    'Like `due date is invalid`.',
                    'It matches tasks that have a due date and the due date is invalid, such as `2022-13-32`',
                ],
                [
                    "filter by function task.due.moment?.isSameOrBefore(moment(), 'day') || false",
                    'Find all tasks due today or earlier.',
                    '`moment()` returns the current date and time, which we need to convert to the start of the day.',
                    "As the second parameter determines the precision, and not just a single value to check, using 'day' will check for year, month and day.",
                    'See the documentation of [isSameOrBefore](https://momentjscom.readthedocs.io/en/latest/moment/05-query/04-is-same-or-before/)',
                ],
                ["filter by function task.due.moment?.isSameOrAfter(moment(), 'day') || false", 'Due today or later'],
                [
                    "filter by function task.due.moment?.isSame(moment('2023-05-31'), 'day') || false",
                    'Find all tasks due on 31 May 2023',
                ],
                [
                    "filter by function task.due.moment?.isSame(moment('2023-05-31'), 'week') || false",
                    'Find all tasks due in the week of 31 May 2023',
                ],
            ],
            SampleTasks.withAllRepresentativeDueDates(),
        ],

        [
            'task.happens',
            [
                [
                    "filter by function task.happens.format('dddd') === 'Friday'",
                    'Find tasks happens on Fridays, that is, any Friday.',
                    'On non-English systems, you may need to supply the day of the week in the local language',
                ],
            ],
            SampleTasks.withAllRepresentativeDueDates(),
        ],

        [
            'task.scheduled',
            [
                [
                    "filter by function task.scheduled.format('dddd') === 'Wednesday'",
                    'Find tasks scheduled on Wednesdays, that is, any Wednesday.',
                    'On non-English systems, you may need to supply the day of the week in the local language',
                ],
            ],
            SampleTasks.withAllRepresentativeScheduledDates(),
        ],

        [
            'task.start',
            [
                [
                    "filter by function task.start.format('dddd') === 'Sunday'",
                    'Find tasks starting on Sundays, that is, any Sunday.',
                    'On non-English systems, you may need to supply the day of the week in the local language',
                ],
            ],
            SampleTasks.withAllRepresentativeStartDates(),
        ],
    ];

    it.each(testData)('%s results', (_: string, groups: QueryInstructionLineAndDescription[], tasks: Task[]) => {
        verifyFunctionFieldFilterSamplesOnTasks(groups, tasks);
    });

    it.each(testData)('%s docs', (_: string, groups: QueryInstructionLineAndDescription[], _tasks: Task[]) => {
        verifyFunctionFieldFilterSamplesForDocs(groups);
    });
});

describe('file properties', () => {
    const samplePath = 'tasks releases/4.1.0 Release.md';

    // Add some tasks with different paths
    const extraTasks = [
        samplePath,
        'Work/do stuff.md',
        'Work/Projects/general projects stuff.md',
        'Work/Projects/Detail/detailed.md',
        'Work/Projects 2024/2024.md',
    ].map((path) => fromLine({ line: '- [ ] In ' + path, path }));

    const sampleDates = ['2023-06-10', '2023-06-11'];

    // Add some tasks with due dates
    sampleDates.map((date) => extraTasks.push(fromLine({ line: `- [ ] Due on ${date} 📅 ${date}` })));

    // Add some tasks with dates in headings
    sampleDates.map((date) =>
        extraTasks.push(
            fromLine({
                line: `- [ ] No due date but I have ${date} in my preceding heading`,
                precedingHeader: `Heading including a date ${date}`,
            }),
        ),
    );

    const sampleTags = ['#context/home', '#context/work'];
    // Add some tasks with tags
    sampleTags.map((tag) => extraTasks.push(fromLine({ line: `- [ ] I have a tag ${tag}` })));

    // Add some tasks with tags
    sampleTags.map((tag) =>
        extraTasks.push(
            fromLine({
                line: `- [ ] I do not have a tag ${tag.substring(1)} but it is in my heading`,
                precedingHeader: `Heading including a tag ${tag}`,
            }),
        ),
    );

    const tasks = SampleTasks.withAllRootsPathsHeadings().concat(extraTasks);

    const testData: CustomPropertyDocsTestData[] = [
        // ---------------------------------------------------------------------------------
        // FILE FIELDS
        // ---------------------------------------------------------------------------------

        [
            'task.file.path',
            [
                [
                    `filter by function task.file.path.includes('${samplePath}')`,
                    "Like 'path includes', except that it is **case-sensitive**: capitalisation matters",
                ],
                [
                    `filter by function task.file.path === '${samplePath}'`,
                    'An exact, **case-sensitive**, equality search.',
                    'Note that the file extension needs to be included too.',
                    'With built-in searches, this could only be done using a regular expression, with special characters `^` and `$`, and escaping any characters with special meaning such as `/`.',
                ],
                [
                    `filter by function task.file.path.toLocaleLowerCase() === '${samplePath.toLocaleUpperCase()}'.toLocaleLowerCase()`,
                    'An exact, **non**-case-sensitive, equality search.',
                    'By lower-casing both values, we do not have to worry about manually lower-casing them in our query',
                ],
            ],
            tasks,
        ],

        [
            'task.file.root',
            [
                [
                    "filter by function task.file.root === '/'",
                    'Find tasks in files in the root of the vault.',
                    'Note that this is **case-sensitive**: capitalisation matters',
                ],
                [
                    "filter by function task.file.root === 'Work/'",
                    'Find tasks in files inside the folder `Work` which is in the root of the vault.',
                    'Note that this is **case-sensitive**: capitalisation matters',
                ],
            ],
            tasks,
        ],

        [
            'task.file.folder',
            [
                [
                    'filter by function task.file.folder === "Work/Projects/"',
                    'Find tasks in files in any file in the given folder **only**, and not any sub-folders.',
                    'The equality test, `===`, requires that the trailing slash (`/`) be included',
                ],
                [
                    'filter by function task.file.folder.includes("Work/Projects/")',
                    'Find tasks in files in a specific folder **and any sub-folders**',
                ],
                [
                    'filter by function task.file.folder.includes( query.file.folder )',
                    'Find tasks in files in the folder that contains the query **and any sub-folders**',
                ],
                [
                    'filter by function task.file.folder === query.file.folder',
                    'Find tasks in files in the folder that contains the query only (**not tasks in any sub-folders**)',
                ],
                [
                    'filter by function task.file.folder.includes("Work/Projects")',
                    'By leaving off the trailing slash (`/`) this would also find tasks in any file inside folders such as:',
                    '    `Work/Projects 2023/`',
                    '    `Work/Projects Top Secret/`',
                ],
            ],
            tasks,
        ],

        [
            'task.file.filename',
            [
                [
                    'filter by function task.file.filename === "4.1.0 Release.md"',
                    'Find tasks in files with the exact file name, but in any folder.',
                    'The equality test, `===`, requires that the file extension `.md` be included',
                ],
                [
                    'filter by function task.file.filename.includes("4.1.0 Release")',
                    'Find tasks in files whose name contains the given text.',
                    'By using `.includes()` and leaving out the file extension, this will also find files such as `14.1.0 Release.md` and `4.1.0 Release Notes.md`.',
                ],
            ],
            tasks,
        ],

        [
            'task.heading',
            [
                [
                    `filter by function \\
    const taskDate = task.due.moment; \\
    const wanted = '2023-06-11'; \\
    return taskDate?.isSame(wanted, 'day') || ( !taskDate && task.heading?.includes(wanted)) || false`,
                    'Find tasks that:',
                    '  **either** due on the date `2023-06-11`,',
                    '  **or** do not have a due date, and their preceding heading contains the same date as a string: `2023-06-11`.',
                    'Note that because we use variables to avoid repetition of values, we need to add `return`.',
                ],
                [
                    `filter by function \\
    const taskDate = task.due.moment; \\
    const now = moment(); \\
    return taskDate?.isSame(now, 'day') || ( !taskDate && task.heading?.includes(now.format('YYYY-MM-DD')) ) || false`,
                    'Find tasks that:',
                    "  **either** due on today's date,",
                    "  **or** do not have a due date, and their preceding heading contains today's date as a string, formatted as `YYYY-MM-DD`.",
                ],
                [
                    `filter by function \\
    const wanted = '#context/home'; \\
    return task.heading?.includes(wanted) || task.tags.find( (tag) => tag === wanted ) && true || false;`,
                    'Find tasks that:',
                    '  **either** have a tag exactly matching `#context/home` on the task line,',
                    '  **or** their preceding heading contains the text `#context/home` anywhere.',
                    '    For demonstration purposes, this is slightly imprecise, in that it would also match nested tasks, such as `#context/home/ground-floor`.',
                ],
            ],
            tasks,
        ],
    ];

    /*
- ```filter by function task.due.moment?.isSame('2023-06-11', 'day') || ( !task.due.moment && task.heading?.includes('2023-06-11')) || false```
"Find tasks that:",
"  **either** due on the date `2023-06-11`,",
"  **or** do not have a due date, and their preceding heading contains the same date as a string: `2023-06-11`.",
- ```filter by function task.due.moment?.isSame(moment(), 'day') || ( !task.due.moment && task.heading?.includes(moment().format('YYYY-MM-DD')) ) || false```
"Find tasks that:",
"  **either** due on today's date,",
"  **or** do not have a due date, and their preceding heading contains today's date as a string, formatted as `YYYY-MM-DD`.",
- ```filter by function task.heading?.includes('#context/home') || task.tags.find( (tag) => tag === '#context/home' ) && true || false```
"Find tasks that:",
"  **either** have a tag exactly matching `#context/home` on the task line",
"  **or** their preceding heading contains the text `#context/home` anywhere",
"    For demonstration purposes, this is slightly imprecise, in that it would also match nested tasks, such as `#context/home/ground-floor`",

     */

    it.each(testData)('%s results', (_: string, groups: QueryInstructionLineAndDescription[], tasks: Task[]) => {
        verifyFunctionFieldFilterSamplesOnTasks(groups, tasks);
    });

    it.each(testData)('%s docs', (_: string, groups: QueryInstructionLineAndDescription[], _tasks: Task[]) => {
        verifyFunctionFieldFilterSamplesForDocs(groups);
    });
});

describe('statuses', () => {
    beforeEach(() => {
        StatusRegistry.getInstance().resetToDefaultStatuses();
        const statusConfiguration = new StatusConfiguration('s', 'advances to self', 's', false);
        StatusRegistry.getInstance().add(statusConfiguration);
    });

    afterEach(() => {
        StatusRegistry.getInstance().resetToDefaultStatuses();
    });

    const extraTasks = fromLines({
        lines: [
            '- [p] Unknown symbol',
            '- [s] Toggles to self',
            '- [P] Pro',
            '- [C] Con',
            '- [Q] Question',
            '- [A] Answer',
        ],
    });
    const tasks = SampleTasks.withAllStatuses().concat(extraTasks);

    const testData: CustomPropertyDocsTestData[] = [
        [
            'task.status.name',
            [
                [
                    "filter by function task.status.name === 'Unknown'",
                    'Find all tasks with custom statuses not yet added to the Tasks settings',
                ],
            ],
            tasks,
        ],

        [
            'task.status.nextSymbol',
            [
                [
                    'filter by function task.status.symbol === task.status.nextSymbol',
                    'Find tasks that toggle to themselves, because the next symbol is the same as the current symbol',
                ],
            ],
            tasks,
        ],

        [
            'task.status.symbol',
            [
                [
                    "filter by function task.status.symbol === '-'",
                    'Find tasks with a checkbox `[-]`, which is conventionally used to mean "cancelled"',
                ],
                [
                    "filter by function task.status.symbol !== ' '",
                    'Find tasks with anything but the space character as their status symbol, that is, without the checkbox `[ ]`.',
                ],
                [
                    `filter by function \\
    const symbol = task.status.symbol; \\
    return symbol === 'P' || symbol === 'C' || symbol === 'Q' || symbol === 'A';`,
                    'Note that because we use a variable to avoid repetition, we need to add `return`',
                    'Find tasks with status symbol `P`, `C`, `Q` or `A`.',
                    'This can get quite verbose, the more symbols you want to search for.',
                ],
                [
                    "filter by function 'PCQA'.includes(task.status.symbol)",
                    'Find tasks with status symbol `P`, `C`, `Q` or `A`.',
                    'This is a convenient shortcut over a longer statement testing each allowed value independently',
                ],
                [
                    "filter by function !' -x/'.includes(task.status.symbol)",
                    'Find tasks with any status symbol not supported by Tasks in the default settings',
                ],
            ],
            tasks,
        ],

        [
            'task.status.type',
            [
                ["filter by function task.status.type === 'NON_TASK'", 'Find tasks of type `NON_TASK`.'],
                [
                    "filter by function 'TODO,IN_PROGRESS'.includes(task.status.type)",
                    'Find tasks that are either type `TODO` or type `IN_PROGRESS`.',
                    'This can be more convenient than doing Boolean `OR` searches',
                ],
                [
                    "filter by function ! 'NON_TASK,CANCELLED'.includes(task.status.type)",
                    'Find tasks that are not type `NON_TASK` and not type `CANCELLED`.',
                ],
            ],
            tasks,
        ],
    ];

    it.each(testData)('%s results', (_: string, groups: QueryInstructionLineAndDescription[], tasks: Task[]) => {
        verifyFunctionFieldFilterSamplesOnTasks(groups, tasks);
    });

    it.each(testData)('%s docs', (_: string, groups: QueryInstructionLineAndDescription[], _tasks: Task[]) => {
        verifyFunctionFieldFilterSamplesForDocs(groups);
    });
});

describe('other properties', () => {
    const tasksForRecurrenceTests = SampleTasks.withAllRecurrences().concat(
        fromLine({ line: '- [ ] valid recurrence 🔁 every day' }),
        fromLine({ line: '- [ ] dodgy recurrence 🔁 every kasdhf alkfha' }),
    );

    const testData: CustomPropertyDocsTestData[] = [
        // ---------------------------------------------------------------------------------
        // RECURRENCE FIELDS
        // ---------------------------------------------------------------------------------

        [
            'task.isRecurring',
            [
                // comment to force line break
                [
                    'filter by function task.isRecurring',
                    'This is identical to `is recurring`.',
                    'It can be used with `&&` (Boolean AND) or `||` (Boolean OR) in conjunction with other conditions.',
                ],
                [
                    'filter by function !task.isRecurring',
                    'This is identical to `is not recurring`.',
                    'It can be used with `&&` (Boolean AND) or `||` (Boolean OR) in conjunction with other conditions.',
                ],
                [
                    "filter by function (!task.isRecurring) && task.originalMarkdown.includes('🔁')",
                    'Find tasks that have a **broken/invalid recurrence rule**.',
                    'This assumes use of the Tasks emoji format, and should of course be updated if using another format.',
                    'This uses knowledge of an implementation detail of Tasks, which is that recurrence rules are read and removed from the description even if they are invalid.',
                    'So we have to search for the recurrence marker in `task.originalMarkdown` to see whether the original task contained the recurrence signifier when `task.isRecurring` even though false',
                ],
            ],
            tasksForRecurrenceTests,
        ],

        [
            'task.recurrenceRule',
            // comment to force line break

            /**
             * Return the text of the Task's recurrence rule, if it is supplied and is valid,
             * and an empty string otherwise.
             */

            [
                [
                    'filter by function task.recurrenceRule.includes("every week")',
                    'Similar to `recurrence includes every week`, but case-sensitive',
                ],
                [
                    'filter by function !task.recurrenceRule.includes("every week")',
                    'Similar to `recurrence does not include every week`, but case-sensitive',
                ],
                [
                    'filter by function task.recurrenceRule.includes("every week") && task.recurrenceRule.includes("when done")',
                    'Find tasks that are due every week, and **do** contain `when done` in their recurrence rule',
                ],
                [
                    'filter by function task.recurrenceRule.includes("every week") && !task.recurrenceRule.includes("when done")',
                    'Find tasks that are due every week, and do **not** contain `when done` in their recurrence rule',
                ],
            ],
            tasksForRecurrenceTests,
        ],

        // ---------------------------------------------------------------------------------
        // OTHER FIELDS
        // ---------------------------------------------------------------------------------
        [
            'task.blockLink',
            // comment to force line break
            [],
            SampleTasks.withAllRepresentativeBlockLinks(),
        ],

        [
            'task.description',
            [['filter by function task.description.length > 100', 'Find tasks with long descriptions']],
            SampleTasks.withAllRepresentativeDescriptions().concat(SampleTasks.withRepresentativeTags()),
        ],

        [
            'task.descriptionWithoutTags',
            [],
            SampleTasks.withAllRepresentativeDescriptions().concat(SampleTasks.withRepresentativeTags()),
        ],

        // [
        //     'task.indentation',
        //     [['group by function task.indentation', '...']],
        //     SampleTasks.withAllPriorities(), // TODO Choose specific tasks for task.indentation'
        // ],

        [
            'task.isDone',
            [
                [
                    'filter by function task.isDone',
                    'Same as the `done` filter, but might be useful in conjunction with other expressions on the same line',
                ],
                [
                    'filter by function ! task.isDone',
                    'Same as the `not done` filter, but might be useful in conjunction with other expressions on the same line',
                ],
            ],
            SampleTasks.withAllStatuses(),
        ],

        // [
        //     'task.listMarker',
        //     [['group by function task.listMarker', '...']],
        //     SampleTasks.withAllPriorities(), // TODO Choose specific tasks for task.listMarker'
        // ],

        [
            'task.priorityName',
            [["filter by function task.priorityName !== 'Normal'", 'The same as `priority is not none`.']],
            SampleTasks.withAllPriorities(),
        ],

        [
            'task.priorityNumber',
            [
                [
                    'filter by function task.priorityNumber % 2 === 0',
                    "Filter using the task's priority number, where Highest is 0 and Lowest is 5.",
                    'This artificial example finds all the tasks with even priority numbers, so Highest, Medium and Low priorities',
                ],
            ],
            SampleTasks.withAllPriorities(),
        ],

        [
            'task.tags',
            [
                [
                    'filter by function task.tags.length === 1',
                    'Find tasks with exactly 1 tag (other than any global filter)',
                ],
                [
                    'filter by function task.tags.length > 1',
                    'Find tasks with more than one tag (other than any global filter)',
                ],
            ],
            SampleTasks.withRepresentativeTags(),
        ],

        [
            'task.tags.advanced',
            [
                [
                    "filter by function task.tags.find( (tag) => tag.includes('/') ) && true || false",
                    'Find all tasks that have at least one nested tag',
                ],
                [
                    "filter by function task.tags.find( (tag) => tag.split('/').length >= 3 ) && true || false",
                    'Find all tasks that have at least one doubly-nested tag, such as `#context/home/ground-floor`.',
                    'This splits each tag at the `/` character, and counts as a match if there are at least 3 words',
                ],
            ],
            SampleTasks.withRepresentativeTags(),
        ],

        [
            'task.originalMarkdown',
            // comment to force line break
            [],
            SampleTasks.withRepresentativeTags(),
        ],
        [
            'task.urgency',
            [
                [
                    // comment to force line break
                    'filter by function task.urgency > 8.9999',
                    'Find tasks with an urgency score above `9.0`.',
                    'Note that limiting value used is `8.9999`.',
                    "Searches that compare two urgency values for 'less than' or 'more than' (using one of `>`, `>=`, `<` or `<=`) **must adjust their values slightly to allow for rounding**",
                ],
                [
                    'filter by function task.urgency > 7.9999 && task.urgency < 11.0001',
                    'Find tasks with an urgency score between `8.0` and `11.0`, inclusive',
                ],
                [
                    'filter by function task.urgency.toFixed(2) === 1.95.toFixed(2)',
                    'Find tasks with the [[Urgency#Why do all my tasks have urgency score 1.95?|default urgency]] of `1.95`.',
                    'This is the correct way to do an equality or inequality search for any numeric values.',
                    'The `.toFixed(2)` on both sides of the `===` ensures that two numbers being compared are both rounded to the same number of decimal places (2).',
                    'This is important, to prevent being tripped up `10.29` being not exactly the same when comparing non-integer numbers',
                ],
                [
                    'filter by function task.urgency.toFixed(2) !== 1.95.toFixed(2)',
                    'Find tasks with any urgency other than the default score of `1.95`.',
                ],
                [
                    'filter by function task.urgency === 10.29',
                    '**This will not find any tasks**.',
                    '==Do not use raw numbers in searches for equality or inequality of any numbers==, either seemingly integer or floating point ones.',
                    'From using `group by urgency` and reviewing the headings, we might conclude that tasks with the following values have urgency `10.19`:',
                    '    due tomorrow,',
                    '    have no priority symbol',
                    'From this, it might be natural to presume that we can search for `task.urgency === 10.29`.',
                    'However, our function is checking the following values for equality:',
                    '    `task.urgency` is approximately:',
                    '        `10.292857142857140928526860079728`',
                    '    `10.29` is approximately:',
                    '        `10.289999999999999147348717087880`',
                    'These values are **not exactly equal**, so the test fails to find any matching tasks',
                ],
            ],
            SampleTasks.withAllPriorities().concat(fromLine({ line: '- [ ] due 2023-06-11 📅 2023-06-11' })),
        ],
    ];

    it.each(testData)('%s results', (_: string, groups: QueryInstructionLineAndDescription[], tasks: Task[]) => {
        verifyFunctionFieldFilterSamplesOnTasks(groups, tasks);
    });

    it.each(testData)('%s docs', (_: string, groups: QueryInstructionLineAndDescription[], _tasks: Task[]) => {
        verifyFunctionFieldFilterSamplesForDocs(groups);
    });
});
