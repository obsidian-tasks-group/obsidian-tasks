/**
 * @jest-environment jsdom
 */

import moment from 'moment';
import { parseAndEvaluateExpression } from '../../src/Scripting/Expression';
import { Status } from '../../src/Status';

import { TaskBuilder } from '../TestingTools/TaskBuilder';
import { MarkdownTable } from '../TestingTools/VerifyMarkdownTable';
import { addBackticks, determineExpressionType, formatToRepresentType } from './ScriptingTestHelpers';

window.moment = moment;

// TODO Show a task in a callout, or an ordered list

describe('task', () => {
    function verifyFieldDataForReferenceDocs(fields: string[]) {
        const markdownTable = new MarkdownTable(['Field', 'Type 1', 'Example 1', 'Type 2', 'Example 2']);
        const task1 = TaskBuilder.createFullyPopulatedTask();
        const task2 = new TaskBuilder().description('minimal task').status(Status.makeInProgress()).build();
        for (const field of fields) {
            const value1 = parseAndEvaluateExpression(task1, field);
            const value2 = parseAndEvaluateExpression(task2, field);
            const cells = [
                addBackticks(field),
                addBackticks(determineExpressionType(value1)),
                addBackticks(formatToRepresentType(value1)),
                addBackticks(determineExpressionType(value2)),
                addBackticks(formatToRepresentType(value2)),
            ];
            markdownTable.addRow(cells);
        }
        markdownTable.verifyForDocs();
    }

    beforeAll(() => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date('2023-06-12'));
    });

    afterAll(() => {
        jest.useRealTimers();
    });

    it('status', () => {
        verifyFieldDataForReferenceDocs([
            'task.isDone',
            'task.status.name',
            'task.status.type',
            'task.status.typeGroupText',
            'task.status.symbol',
            'task.status.nextSymbol',
        ]);
    });

    it('dates', () => {
        verifyFieldDataForReferenceDocs([
            'task.created',
            'task.start',
            'task.scheduled',
            'task.due',
            'task.done',
            'task.happens',
        ]);
    });

    it('date fields', () => {
        verifyFieldDataForReferenceDocs([
            'task.due',
            'task.due.moment',
            'task.due.formatAsDate()',
            "task.due.formatAsDate('undated')",
            'task.due.formatAsDateAndTime()',
            "task.due.formatAsDate('undated')",
            "task.due.format('dddd')",
            'task.due.toISOString()',
            'task.due.toISOString(true)', // https://momentjs.com/docs/#/displaying/as-iso-string/ - true prevents UTC conversion
            'task.due.category.name',
            'task.due.category.sortOrder',
            'task.due.category.groupText',
            'task.due.fromNow.name',
            'task.due.fromNow.sortOrder',
            'task.due.fromNow.groupText',
        ]);
    });

    it('other fields', () => {
        verifyFieldDataForReferenceDocs([
            'task.description',
            'task.descriptionWithoutTags',
            'task.priorityNumber',
            'task.priorityName',
            'task.priorityNameGroupText',
            'task.urgency',
            'task.isRecurring',
            'task.recurrenceRule',
            'task.tags',
            // 'task.indentation', // Cannot just use length to determine if sub-task, as it many be '> ' due to being in a sub-task
            // 'task.listMarker', // Not a priority to release
            // 'task.blockLink', // Release support for grouping by task.blockLink, after removing the leading space and maybe the carat
            'task.originalMarkdown',
        ]);
    });

    it('file properties', () => {
        verifyFieldDataForReferenceDocs([
            'task.file.path',
            'task.file.pathWithoutExtension',
            'task.file.root',
            'task.file.folder',
            'task.file.filename',
            'task.file.filenameWithoutExtension',
            'task.hasHeading',
            'task.heading',
        ]);
    });
});
