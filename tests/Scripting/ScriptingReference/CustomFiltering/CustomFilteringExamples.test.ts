/**
 * @jest-environment jsdom
 */

import moment from 'moment';

import { verifyAll } from 'approvals/lib/Providers/Jest/JestApprovals';
import type { Task } from '../../../../src/Task';
import { SampleTasks } from '../../../TestHelpers';
import type { QueryInstructionLineAndDescription } from '../../../Query/Filter/ReferenceDocs/FilterReference/VerifyFunctionFieldSamples';
import { verifyMarkdownForDocs } from '../../../TestingTools/VerifyMarkdownTable';
import { FunctionField } from '../../../../src/Query/Filter/FunctionField';

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
    for (const filter of filters) {
        const instruction = filter[0];
        const comments = filter.slice(1);
        markdown += `- \`\`\`${instruction}\`\`\`
${comments.map((l) => l.replace(/^( *)/, '$1    - ')).join('\n')}.
`;
    }
    verifyMarkdownForDocs(markdown);
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
