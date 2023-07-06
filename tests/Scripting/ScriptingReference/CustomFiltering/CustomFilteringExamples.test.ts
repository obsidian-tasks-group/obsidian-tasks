/**
 * @jest-environment jsdom
 */

import moment from 'moment';

import { verifyAll } from 'approvals/lib/Providers/Jest/JestApprovals';
import type { Task } from '../../../../src/Task';
import { SampleTasks, fromLine, fromLines } from '../../../TestHelpers';
import type { QueryInstructionLineAndDescription } from '../../../Query/Filter/ReferenceDocs/FilterReference/VerifyFunctionFieldSamples';
import { verifyMarkdownForDocs } from '../../../TestingTools/VerifyMarkdownTable';
import { FunctionField } from '../../../../src/Query/Filter/FunctionField';
import { StatusRegistry } from '../../../../src/StatusRegistry';
import { StatusConfiguration } from '../../../../src/StatusConfiguration';

window.moment = moment;

beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2023-06-10 20:00'));
});

afterEach(() => {
    jest.useRealTimers();
});

/** For example, 'task.due' */
type TaskPropertyName = string;

type CustomGroupingPropertyTestData = [TaskPropertyName, QueryInstructionLineAndDescription[], Task[]];

function verifyFunctionFieldFilterSamplesOnTasks(filters: QueryInstructionLineAndDescription[], tasks: Task[]) {
    if (filters.length === 0) {
        return;
    }
    verifyAll('Results of custom filters', filters, (filter) => {
        const instruction = filter[0];
        const comment = filter.slice(1);
        const filterOrErrorMessage = new FunctionField().createFilterOrErrorMessage(instruction);
        const filterFunction = filterOrErrorMessage.filterFunction!;
        const matchingTasks: string[] = [];
        for (const task of tasks) {
            const matches = filterFunction(task);
            if (matches) {
                matchingTasks.push(task.toFileLineString());
            }
        }
        return `
${instruction}
${comment.join('\n')}
=>
${matchingTasks.join('\n')}
====================================================================================
`;
    });
}

function verifyFunctionFieldFilterSamplesForDocs(filters: QueryInstructionLineAndDescription[]) {
    let markdown = '';
    if (filters.length === 0) {
        markdown = '==TODO==';
    } else {
        for (const filter of filters) {
            const instruction = filter[0];
            const comments = filter.slice(1);
            markdown += `- \`\`\`${instruction}\`\`\`
${comments.map((l) => l.replace(/^( *)/, '$1    - ')).join('\n')}.
`;
        }
    }
    verifyMarkdownForDocs(markdown);
}

describe('dates', () => {
    const testData: CustomGroupingPropertyTestData[] = [
        // ---------------------------------------------------------------------------------
        // DATE FIELDS
        // ---------------------------------------------------------------------------------

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
    const extraTasks = fromLines({
        lines: [`- [ ] from ${samplePath}`],
        path: samplePath,
    });
    extraTasks.push(fromLine({ line: '- [ ] In Work', path: 'Work/do stuff.md' }));
    const tasks = SampleTasks.withAllRootsPathsHeadings().concat(extraTasks);
    const testData: CustomGroupingPropertyTestData[] = [
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
                    'With built-in searches, this could only be done using a regular expression, with special characters `^` and `$`, and escaping any characters with special meaning such as `/`',
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
            // comment to force line break
            [],
            tasks,
        ],

        [
            'task.file.filename',
            // comment to force line break
            [],
            tasks,
        ],

        [
            'task.heading',
            // comment to force line break
            [],
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

    const testData: CustomGroupingPropertyTestData[] = [
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
                    'Find tasks with anything but the space character as their status symbol, that is, without the checkbox `[ ]`',
                ],
                [
                    "filter by function task.status.symbol === 'P' || task.status.symbol === 'C' || task.status.symbol === 'Q' || task.status.symbol === 'A'",
                    'Find tasks with status symbol `P`, `C`, `Q` or `A`',
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
                ["filter by function task.status.type === 'NON_TASK'", 'Find tasks of type `NON_TASK`'],
                [
                    "filter by function 'TODO,IN_PROGRESS'.includes(task.status.type)",
                    'Find tasks that are either type `TODO` or type `IN_PROGRESS`.',
                    'This can be more convenient than doing Boolean `OR` searches',
                ],
                [
                    "filter by function ! 'NON_TASK,CANCELLED'.includes(task.status.type)",
                    'Find tasks that are not type `NON_TASK` and not type `CANCELLED`',
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
    const testData: CustomGroupingPropertyTestData[] = [
        // ---------------------------------------------------------------------------------
        // RECURRENCE FIELDS
        // ---------------------------------------------------------------------------------

        [
            'task.isRecurring',
            // comment to force line break
            [],
            SampleTasks.withAllRecurrences(),
        ],

        [
            'task.recurrenceRule',
            // comment to force line break
            [],
            SampleTasks.withAllRecurrences(),
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
            // comment to force line break
            [],
            SampleTasks.withAllStatuses(),
        ],

        // [
        //     'task.listMarker',
        //     [['group by function task.listMarker', '...']],
        //     SampleTasks.withAllPriorities(), // TODO Choose specific tasks for task.listMarker'
        // ],

        [
            'task.priorityName',
            [["filter by function task.priorityName !== 'Normal'", 'The same as `priority is not none`']],
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
            // comment to force line break
            [],
            SampleTasks.withAllPriorities(),
        ],
    ];

    it.each(testData)('%s results', (_: string, groups: QueryInstructionLineAndDescription[], tasks: Task[]) => {
        verifyFunctionFieldFilterSamplesOnTasks(groups, tasks);
    });

    it.each(testData)('%s docs', (_: string, groups: QueryInstructionLineAndDescription[], _tasks: Task[]) => {
        verifyFunctionFieldFilterSamplesForDocs(groups);
    });
});
