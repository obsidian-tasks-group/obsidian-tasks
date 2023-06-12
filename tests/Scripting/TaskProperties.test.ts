/**
 * @jest-environment jsdom
 */

import moment from 'moment';
import { evaluateExpression } from '../../src/Scripting/Expression';
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
            const value1 = evaluateExpression(task1, field);
            const value2 = evaluateExpression(task2, field);
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

    it('status', () => {
        verifyFieldDataForReferenceDocs([
            'task.status.name',
            'task.status.type',
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

    it('other fields', () => {
        // TODO Recurrence
        verifyFieldDataForReferenceDocs([
            'task.description',
            // 'task.priority', // I think it will be more useful for task.priority to refer to the name. Currently, it gives the number. Needs more thought.
            'task.urgency',
            'task.tags',
            // 'task.indentation', // Cannot just use length to determine if sub-task, as it many be '> ' due to being in a sub-task
            // 'task.listMarker', // Not a priority to release
            // 'task.blockLink', // Release support for grouping by task.blockLink, after removing the leading space and maybe the carat
            // 'task.originalMarkdown', // Not a priority to release
        ]);
    });

    it('file properties', () => {
        // TODO Replace this with values that can be published
        // TODO Create task.file
        verifyFieldDataForReferenceDocs([
            // 'task.path',
            // 'task.filename',
            // 'task.lineNumber', // this name is misleading - in some circumstances the line number is not updated after user edits
            'task.hasHeading',
            'task.heading',
        ]);
    });
});
