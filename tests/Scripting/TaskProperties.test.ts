/**
 * @jest-environment jsdom
 */

import moment from 'moment';
import type { Reference } from 'obsidian';
import { Status } from '../../src/Statuses/Status';

import { TaskBuilder } from '../TestingTools/TaskBuilder';
import { verifyMarkdownForDocs } from '../TestingTools/VerifyMarkdown';
import { parseAndEvaluateExpression } from '../../src/Scripting/TaskExpression';
import { MarkdownTable } from '../../src/lib/MarkdownTable';
import { makeQueryContextWithTasks } from '../../src/Scripting/QueryContext';
import { TasksFile } from '../../src/Scripting/TasksFile';
import type { Task } from '../../src/Task/Task';
import { readTasksFromSimulatedFile } from '../Obsidian/SimulatedFile';
import docs_sample_for_task_properties_reference from '../Obsidian/__test_data__/docs_sample_for_task_properties_reference.json';
import links_everywhere from '../Obsidian/__test_data__/links_everywhere.json';
import { LinkResolver } from '../../src/Task/LinkResolver';
import { getFirstLinkpathDest } from '../__mocks__/obsidian';
import { addBackticks, determineExpressionType, formatToRepresentType } from './ScriptingTestHelpers';

window.moment = moment;

// TODO Show a task in a callout, or an ordered list

beforeEach(() => {});

afterEach(() => {
    LinkResolver.getInstance().resetGetFirstLinkpathDestFn();
});

describe('task', () => {
    function verifyFieldDataForReferenceDocs(fields: string[]) {
        const task1 = TaskBuilder.createFullyPopulatedTask();
        const task2 = new TaskBuilder().description('minimal task').status(Status.IN_PROGRESS).build();
        verifyFieldDataFromTasksForReferenceDocs([task1, task2], fields);
    }

    function verifyFieldDataFromTasksForReferenceDocs(tasks: Task[], fields: string[]) {
        const headings = ['Field'];
        tasks.forEach((_, index) => {
            headings.push(`Type ${index + 1}`);
            headings.push(`Example ${index + 1}`);
        });
        const markdownTable = new MarkdownTable(headings);

        const queryContext = makeQueryContextWithTasks(new TasksFile(tasks[0].path), tasks);
        for (const field of fields) {
            const cells = [addBackticks(field)];
            for (const task of tasks) {
                const value = parseAndEvaluateExpression(task, field, queryContext);
                cells.push(addBackticks(determineExpressionType(value)));
                cells.push(addBackticks(formatToRepresentType(value)));
            }
            markdownTable.addRow(cells);
        }
        verifyMarkdownForDocs(markdownTable.markdown);
    }

    beforeAll(() => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date('2023-06-12'));
    });

    afterAll(() => {
        jest.useRealTimers();
    });

    // NEW_TASK_FIELD_EDIT_REQUIRED

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
            'task.cancelled',
            'task.done',
            'task.happens',
        ]);
    });

    it('date fields', () => {
        const textToUseIfUndated = "'no date'";
        verifyFieldDataForReferenceDocs([
            'task.due',
            'task.due.moment',
            'task.due.formatAsDate()',
            `task.due.formatAsDate(${textToUseIfUndated})`,
            'task.due.formatAsDateAndTime()',
            `task.due.formatAsDateAndTime(${textToUseIfUndated})`,
            "task.due.format('dddd')",
            `task.due.format('dddd', ${textToUseIfUndated})`,
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

    it('dependency fields', () => {
        verifyFieldDataForReferenceDocs([
            // force line break
            'task.id',
            'task.dependsOn',
            'task.isBlocked(query.allTasks)',
            'task.isBlocking(query.allTasks)',
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
            'task.onCompletion',
            'task.tags',
            // 'task.indentation', // Cannot just use length to determine if sub-task, as it many be '> ' due to being in a sub-task
            // 'task.listMarker', // Not a priority to release
            // 'task.blockLink', // Release support for grouping by task.blockLink, after removing the leading space and maybe the carat
            'task.originalMarkdown',
            'task.lineNumber',
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

    it('links', () => {
        // This is getting annoying, having to do this repeatedly.
        LinkResolver.getInstance().setGetFirstLinkpathDestFn((rawLink: Reference, sourcePath: string) =>
            getFirstLinkpathDest(rawLink, sourcePath),
        );

        const tasks = readTasksFromSimulatedFile(links_everywhere);
        verifyFieldDataFromTasksForReferenceDocs(tasks, [
            'task.outlinks',
            'task.file.outlinksInProperties',
            'task.file.outlinksInBody',
            'task.file.outlinks',
        ]);
    });

    it('frontmatter properties', () => {
        const tasks = readTasksFromSimulatedFile(docs_sample_for_task_properties_reference as any);
        // Show just the first task:
        verifyFieldDataFromTasksForReferenceDocs(tasks.slice(0, 1), [
            "task.file.hasProperty('creation date')",
            "task.file.property('creation date')",
            "task.file.property('sample_checkbox_property')",
            "task.file.property('sample_date_property')",
            "task.file.property('sample_date_and_time_property')",
            "task.file.property('sample_list_property')",
            "task.file.property('sample_number_property')",
            "task.file.property('sample_text_property')",
            "task.file.property('sample_text_multiline_property')",
            "task.file.property('sample_link_property')",
            "task.file.property('sample_link_list_property')",
            "task.file.property('tags')",
            // 'task.file.tags', // TODO Replace
            // 'task.file.tags()', // TODO Implement
            // "task.file.tags('body')", // TODO Implement
            // "task.file.tags('properties')", // TODO Implement
        ]);
    });
});
