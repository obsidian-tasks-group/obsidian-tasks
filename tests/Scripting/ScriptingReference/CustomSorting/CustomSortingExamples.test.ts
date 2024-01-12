/**
 * @jest-environment jsdom
 */

import moment from 'moment';
import type { Task } from '../../../../src/Task';
import { SampleTasks, fromLine, fromLines } from '../../../TestHelpers';
import type { CustomPropertyDocsTestData, QueryInstructionLineAndDescription } from '../VerifyFunctionFieldSamples';
import {
    verifyFunctionFieldFilterSamplesForDocs,
    verifyFunctionFieldSortSamplesOnTasks,
} from '../VerifyFunctionFieldSamples';

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
                    'sort by function task.cancelled.format("dddd")',
                    "Sort by cancelled date's day of the week, alphabetically",
                ],
            ],
            SampleTasks.withAllRepresentativeCancelledDates(),
        ],

        [
            'task.created',
            [
                [
                    'sort by function task.created.format("dddd")',
                    "Sort by created date's day of the week, alphabetically",
                ],
            ],
            SampleTasks.withAllRepresentativeCreatedDates(),
        ],

        [
            'task.done',
            [['sort by function task.done.format("dddd")', "Sort by done date's day of the week, alphabetically"]],
            SampleTasks.withAllRepresentativeDoneDates(),
        ],

        [
            'task.due',
            [['sort by function task.due.format("dddd")', "Sort by due date's day of the week, alphabetically"]],
            SampleTasks.withAllRepresentativeDueDates(),
        ],

        ['task.due.advanced', [], SampleTasks.withAllRepresentativeDueDates()],

        [
            'task.happens',
            [
                [
                    'sort by function task.happens.format("dddd")',
                    "Sort by happens date's day of the week, alphabetically",
                ],
            ],
            SampleTasks.withAllRepresentativeDueDates(),
        ],

        [
            'task.scheduled',
            [
                [
                    'sort by function task.scheduled.format("dddd")',
                    "Sort by scheduled date's day of the week, alphabetically",
                ],
            ],
            SampleTasks.withAllRepresentativeScheduledDates(),
        ],

        [
            'task.start',
            [['sort by function task.start.format("dddd")', "Sort by start date's day of the week, alphabetically"]],
            SampleTasks.withAllRepresentativeStartDates(),
        ],
    ];

    it.each(testData)('%s results', (_: string, groups: QueryInstructionLineAndDescription[], tasks: Task[]) => {
        verifyFunctionFieldSortSamplesOnTasks(groups, tasks);
    });

    it.each(testData)('%s docs', (_: string, groups: QueryInstructionLineAndDescription[], _tasks: Task[]) => {
        verifyFunctionFieldFilterSamplesForDocs(groups);
    });
});

describe('file properties', () => {
    const tasks = SampleTasks.withAllRootsPathsHeadings();

    const testData: CustomPropertyDocsTestData[] = [
        // ---------------------------------------------------------------------------------
        // FILE FIELDS
        // ---------------------------------------------------------------------------------

        [
            'task.file.path',
            [
                // comment to force line break
                ['sort by function task.file.path', "Like 'Sort by path' but includes the file extension"],
                ['sort by function task.file.pathWithoutExtension', "Like 'Sort by path'"],
            ],
            tasks,
        ],

        [
            'task.file.root',
            [
                // comment to force line break
                ['sort by function task.file.root', 'Enable sorting by the root folder'],
            ],
            tasks,
        ],

        [
            'task.file.folder',
            [
                // comment to force line break
                ['sort by function task.file.folder', 'Enable sorting by the folder containing the task'],
            ],
            tasks,
        ],

        [
            'task.file.filename',
            [
                ['sort by function task.file.filename', "Like 'sort by filename' but includes the file extension"],
                ['sort by function task.file.filenameWithoutExtension', "Like 'sort by filename'"],
            ],
            tasks,
        ],

        ['task.heading', [['sort by function task.heading', "Like 'sort by heading'"]], tasks],
    ];

    it.each(testData)('%s results', (_: string, groups: QueryInstructionLineAndDescription[], tasks: Task[]) => {
        verifyFunctionFieldSortSamplesOnTasks(groups, tasks);
    });

    it.each(testData)('%s docs', (_: string, groups: QueryInstructionLineAndDescription[], _tasks: Task[]) => {
        verifyFunctionFieldFilterSamplesForDocs(groups);
    });
});

describe('statuses', () => {
    const tasks = SampleTasks.withAllStatuses();

    const testData: CustomPropertyDocsTestData[] = [
        ['task.status.name', [['sort by function task.status.name', 'Identical to "Sort by status.name"']], tasks],

        [
            'task.status.nextSymbol',
            [['sort by function task.status.nextSymbol', 'Sort by the next status symbol']],
            tasks,
        ],

        ['task.status.symbol', [['sort by function task.status.symbol', 'Sort by the status symbol']], tasks],

        [
            'task.status.type',
            [
                [
                    'sort by function task.status.type',
                    'Unlike "Sort by status.type", this sorts the status types in alphabetical order',
                ],
            ],
            tasks,
        ],
    ];

    it.each(testData)('%s results', (_: string, groups: QueryInstructionLineAndDescription[], tasks: Task[]) => {
        verifyFunctionFieldSortSamplesOnTasks(groups, tasks);
    });

    it.each(testData)('%s docs', (_: string, groups: QueryInstructionLineAndDescription[], _tasks: Task[]) => {
        verifyFunctionFieldFilterSamplesForDocs(groups);
    });
});

describe('other properties', () => {
    const pseudoCustomPriorityEmojis = fromLines({
        lines: [
            '- [ ] 🟦 pseudo low priority',
            '- [ ] 🟧 pseudo high priority',
            '- [ ] 🟩 pseudo normal priority',
            '- [ ] 🟥 pseudo highest priority',
            '- [ ] 🟨 pseudo medium priority',
        ],
    });

    const testData: CustomPropertyDocsTestData[] = [
        // ---------------------------------------------------------------------------------
        // RECURRENCE FIELDS
        // ---------------------------------------------------------------------------------

        [
            'task.isRecurring',
            [['sort by function task.isRecurring', 'Sort by whether the task is recurring']],
            SampleTasks.withAllRecurrences(),
        ],

        [
            'task.recurrenceRule',
            [['sort by function task.recurrenceRule', 'Sort by recurrence rule']],
            SampleTasks.withAllRecurrences(),
        ],

        // ---------------------------------------------------------------------------------
        // OTHER FIELDS
        // ---------------------------------------------------------------------------------
        [
            'task.blockLink',
            [
                [
                    'sort by function task.blockLink',
                    'DO NOT RELEASE UNTIL THE LEADING SPACE IS REMOVED FROM BLOCKLINKS. Removing the leading space and carat prevents the rendered heading itself being treated as a blocklink.',
                ],
            ],
            SampleTasks.withAllRepresentativeBlockLinks(),
        ],

        [
            'task.description',
            [
                [
                    'sort by function task.description.length',
                    'Sort by length of description, shortest first.',
                    'This might be useful for finding tasks that need more information, or could be made less verbose',
                ],
                [
                    "sort by function task.description.replace('🟥', 1).replace('🟧', 2).replace('🟨', 3).replace('🟩', 4).replace('🟦', 5)",
                    'A user has defined custom system for their task descriptions, with coloured squares at the **start** of task lines as a home-grown alternative priority system.',
                    'This allows tasks to be sorted in the order of their coloured squares.',
                ],
            ],
            SampleTasks.withAllRepresentativeDescriptions().concat(
                SampleTasks.withRepresentativeTags().concat(pseudoCustomPriorityEmojis),
            ),
        ],

        [
            'task.descriptionWithoutTags',
            [
                [
                    'sort by function task.descriptionWithoutTags',
                    'Like `Sort by description`, but it removes any tags from the sort key.',
                    'This might be useful for sorting together completed recurrences of the same task, even if the tags differ in some recurrences',
                ],
            ],
            SampleTasks.withAllRepresentativeDescriptions().concat(SampleTasks.withRepresentativeTags()),
        ],

        // [
        //     'task.indentation',
        //     [['sort by function task.indentation', '...']],
        //     SampleTasks.withAllPriorities(), // TODO Choose specific tasks for task.indentation'
        // ],

        [
            'task.isDone',
            [
                [
                    'sort by function task.isDone',
                    'Tasks with [[Status Types|Status Type]] `TODO` and `IN_PROGRESS` tasks are sorted before those with types `DONE`, `CANCELLED` and `NON_TASK.',
                ],
            ],
            SampleTasks.withAllStatuses(),
        ],

        // [
        //     'task.listMarker',
        //     [['sort by function task.listMarker', '...']],
        //     SampleTasks.withAllPriorities(), // TODO Choose specific tasks for task.listMarker'
        // ],

        [
            'task.priorityName',
            [
                [
                    'sort by function task.priorityName',
                    "Sort by the task's priority name",
                    'The priority names are displayed in alphabetical order.',
                    "Note that the default priority is called 'Normal', as opposed to with `Sort by priority` which calls the default 'None'",
                ],
            ],
            SampleTasks.withAllPriorities(),
        ],

        [
            'task.priorityNumber',
            [
                [
                    'sort by function task.priorityNumber',
                    "Sort by the task's priority number, where Highest is 0 and Lowest is 5",
                ],
            ],
            SampleTasks.withAllPriorities(),
        ],

        [
            'task.tags',
            [
                [
                    // TODO Make this simpler, by allowing sort-keys that are arrays - and joining them by ','
                    'sort by function task.tags.filter( (tag) => tag.includes("#context/")).sort().join(",")',
                    'Sort by tags that contain "#context/".',
                    'Any tasks without that tag are sorted first.',
                ],
                [
                    'sort by function reverse task.tags.length',
                    'Sort by the number of tags on the task',
                    'The `reverse` option puts tasks with the most tags first.',
                ],
                [
                    'sort by function -task.tags.length',
                    'A different way of sorting by the number of tags on the task, still putting tasks with the most tags first.',
                ],
            ],
            SampleTasks.withRepresentativeTags(),
        ],
        ['task.tags.advanced', [], SampleTasks.withRepresentativeTags()],

        [
            'task.originalMarkdown',
            [
                [
                    'sort by function task.originalMarkdown',
                    "Sort by the raw text of the task's original line in the MarkDown file.",
                ],
            ],
            SampleTasks.withRepresentativeTags(),
        ],

        [
            'task.urgency',
            [
                [
                    'sort by function reverse task.urgency',
                    'Sort by task urgency values.',
                    'We use `reverse` to put the most urgent tasks first.',
                ],
            ],
            SampleTasks.withAllPriorities().concat(fromLine({ line: '- [ ] due 2023-06-11 📅 2023-06-11' })),
        ],
    ];

    it.each(testData)('%s results', (_: string, groups: QueryInstructionLineAndDescription[], tasks: Task[]) => {
        verifyFunctionFieldSortSamplesOnTasks(groups, tasks);
    });

    it.each(testData)('%s docs', (_: string, groups: QueryInstructionLineAndDescription[], _tasks: Task[]) => {
        verifyFunctionFieldFilterSamplesForDocs(groups);
    });
});
