/**
 * @jest-environment jsdom
 */

import moment from 'moment';
import type { Task } from '../../../../src/Task';
import { SampleTasks, fromLine } from '../../../TestHelpers';
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
            ],
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

        ['task.isDone', [], SampleTasks.withAllStatuses()],

        // [
        //     'task.listMarker',
        //     [['group by function task.listMarker', '...']],
        //     SampleTasks.withAllPriorities(), // TODO Choose specific tasks for task.listMarker'
        // ],

        ['task.priorityName', [], SampleTasks.withAllPriorities()],

        ['task.priorityNumber', [], SampleTasks.withAllPriorities()],

        ['task.tags', [], SampleTasks.withRepresentativeTags()],

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
