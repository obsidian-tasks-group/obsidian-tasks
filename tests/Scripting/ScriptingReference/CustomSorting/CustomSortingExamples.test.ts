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

        ['task.cancelled', [], SampleTasks.withAllRepresentativeCancelledDates()],

        ['task.created', [], SampleTasks.withAllRepresentativeCreatedDates()],

        ['task.done', [], SampleTasks.withAllRepresentativeDoneDates()],

        ['task.due', [], SampleTasks.withAllRepresentativeDueDates()],

        ['task.due.advanced', [], SampleTasks.withAllRepresentativeDueDates()],

        ['task.happens', [], SampleTasks.withAllRepresentativeDueDates()],

        ['task.scheduled', [], SampleTasks.withAllRepresentativeScheduledDates()],

        ['task.start', [], SampleTasks.withAllRepresentativeStartDates()],
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

        ['task.file.path', [], tasks],

        ['task.file.root', [], tasks],

        ['task.file.folder', [], tasks],

        ['task.file.filename', [], tasks],

        ['task.heading', [], tasks],
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
        ['task.status.name', [], tasks],

        ['task.status.nextSymbol', [], tasks],

        ['task.status.symbol', [], tasks],

        ['task.status.type', [], tasks],
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

        ['task.isRecurring', [], SampleTasks.withAllRecurrences()],

        ['task.recurrenceRule', [], SampleTasks.withAllRecurrences()],

        // ---------------------------------------------------------------------------------
        // OTHER FIELDS
        // ---------------------------------------------------------------------------------
        ['task.blockLink', [], SampleTasks.withAllRepresentativeBlockLinks()],

        [
            'task.description',
            [
                [
                    'sort by function task.description.length',
                    'sort by length of description, shortest first.',
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
                    'Like `sort by description`, but it removes any tags from the sort key.',
                    'This might be useful for sorting together completed recurrences of the same task, even if the tags differ in some recurrences',
                ],
            ],
            SampleTasks.withAllRepresentativeDescriptions().concat(SampleTasks.withRepresentativeTags()),
        ],

        // [
        //     'task.indentation',
        //     [['group by function task.indentation', '...']],
        //     SampleTasks.withAllPriorities(), // TODO Choose specific tasks for task.indentation'
        // ],

        ['task.isDone', [], SampleTasks.withAllStatuses()],

        // [
        //     'task.listMarker',
        //     [['group by function task.listMarker', '...']],
        //     SampleTasks.withAllPriorities(), // TODO Choose specific tasks for task.listMarker'
        // ],

        ['task.priorityName', [], SampleTasks.withAllPriorities()],

        ['task.priorityNumber', [], SampleTasks.withAllPriorities()],

        [
            'task.tags',
            [
                [
                    // TODO Make this simpler, by allowing sort-keys that are arrays - and joining them by ','
                    'sort by function task.tags.filter( (tag) => tag.includes("#context/")).sort().join(",")',
                    'Sort by tags that contain "#context/".',
                    'Any tasks without that tag are sorted first.',
                ],
            ],
            SampleTasks.withRepresentativeTags(),
        ],

        ['task.tags.advanced', [], SampleTasks.withRepresentativeTags()],

        ['task.originalMarkdown', [], SampleTasks.withRepresentativeTags()],

        [
            'task.urgency',
            [],
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
