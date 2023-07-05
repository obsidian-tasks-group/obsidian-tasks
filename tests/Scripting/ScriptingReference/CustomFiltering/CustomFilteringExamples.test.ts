/**
 * @jest-environment jsdom
 */

import moment from 'moment';

import type { Task } from '../../../../src/Task';
import { SampleTasks } from '../../../TestHelpers';
import type { QueryInstructionLineAndDescription } from '../../../Query/Filter/ReferenceDocs/FilterReference/VerifyFunctionFieldSamples';

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

function verifyFunctionFieldFilterSamplesOnTasks(_groups: QueryInstructionLineAndDescription[], _tasks: Task[]) {
    // TODO
}

function verifyFunctionFieldFilterSamplesForDocs(_groups: QueryInstructionLineAndDescription[]) {
    // TODO
}

describe('dates', () => {
    const testData: CustomGroupingPropertyTestData[] = [
        // ---------------------------------------------------------------------------------
        // DATE FIELDS
        // ---------------------------------------------------------------------------------

        ['task.created', [], SampleTasks.withAllRepresentativeCreatedDates()],

        ['task.done', [], SampleTasks.withAllRepresentativeDoneDates()],

        ['task.due', [], SampleTasks.withAllRepresentativeDueDates()],

        ['task.due.advanced', [], SampleTasks.withAllRepresentativeDueDates()],

        ['task.happens', [], SampleTasks.withAllRepresentativeDueDates()],

        ['task.scheduled', [], SampleTasks.withAllRepresentativeScheduledDates()],

        ['task.start', [], SampleTasks.withAllRepresentativeStartDates()],
    ];

    it.each(testData)('%s results', (_: string, groups: QueryInstructionLineAndDescription[], tasks: Task[]) => {
        verifyFunctionFieldFilterSamplesOnTasks(groups, tasks);
    });

    it.each(testData)('%s docs', (_: string, groups: QueryInstructionLineAndDescription[], _tasks: Task[]) => {
        verifyFunctionFieldFilterSamplesForDocs(groups);
    });
});

describe('file properties', () => {
    const testData: CustomGroupingPropertyTestData[] = [
        // ---------------------------------------------------------------------------------
        // FILE FIELDS
        // ---------------------------------------------------------------------------------

        ['task.file.path', [], SampleTasks.withAllRootsPathsHeadings()],

        ['task.file.root', [], SampleTasks.withAllRootsPathsHeadings()],

        ['task.file.folder', [], SampleTasks.withAllRootsPathsHeadings()],

        ['task.file.filename', [], SampleTasks.withAllRootsPathsHeadings()],

        ['task.heading', [], SampleTasks.withAllRootsPathsHeadings()],
    ];

    it.each(testData)('%s results', (_: string, groups: QueryInstructionLineAndDescription[], tasks: Task[]) => {
        verifyFunctionFieldFilterSamplesOnTasks(groups, tasks);
    });

    it.each(testData)('%s docs', (_: string, groups: QueryInstructionLineAndDescription[], _tasks: Task[]) => {
        verifyFunctionFieldFilterSamplesForDocs(groups);
    });
});

describe('statuses', () => {
    const testData: CustomGroupingPropertyTestData[] = [
        ['task.status.name', [], SampleTasks.withAllStatuses()],

        ['task.status.nextSymbol', [], SampleTasks.withAllStatuses()],

        ['task.status.symbol', [], SampleTasks.withAllStatuses()],

        ['task.status.type', [], SampleTasks.withAllStatuses()],
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

        ['task.isRecurring', [], SampleTasks.withAllRecurrences()],

        ['task.recurrenceRule', [], SampleTasks.withAllRecurrences()],

        // ---------------------------------------------------------------------------------
        // OTHER FIELDS
        // ---------------------------------------------------------------------------------
        ['task.blockLink', [], SampleTasks.withAllRepresentativeBlockLinks()],

        [
            'task.description',
            [],
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

        ['task.urgency', [], SampleTasks.withAllPriorities()],
    ];

    it.each(testData)('%s results', (_: string, groups: QueryInstructionLineAndDescription[], tasks: Task[]) => {
        verifyFunctionFieldFilterSamplesOnTasks(groups, tasks);
    });

    it.each(testData)('%s docs', (_: string, groups: QueryInstructionLineAndDescription[], _tasks: Task[]) => {
        verifyFunctionFieldFilterSamplesForDocs(groups);
    });
});

describe('special cases', () => {
    const testData: CustomGroupingPropertyTestData[] = [
        ['formatting', [], SampleTasks.withAllRepresentativeDueDates()],

        // idea: folder: show stripping out the folder containing the query file - may need to escape forward slashes if using regular expression
    ];

    it.each(testData)('%s results', (_: string, groups: QueryInstructionLineAndDescription[], tasks: Task[]) => {
        verifyFunctionFieldFilterSamplesOnTasks(groups, tasks);
    });

    it.each(testData)('%s docs', (_: string, groups: QueryInstructionLineAndDescription[], _tasks: Task[]) => {
        verifyFunctionFieldFilterSamplesForDocs(groups);
    });
});
