/**
 * @jest-environment jsdom
 */
import moment from 'moment';
import type { Task } from 'Task/Task';
import { State } from '../../src/Obsidian/Cache';
import { QueryResultsRenderer } from '../../src/Renderer/QueryResultsRenderer';
import { TasksFile } from '../../src/Scripting/TasksFile';
import { inheritance_rendering_sample } from '../Obsidian/__test_data__/inheritance_rendering_sample';
import { inheritance_task_2listitem_3task } from '../Obsidian/__test_data__/inheritance_task_2listitem_3task';
import { readTasksFromSimulatedFile } from '../Obsidian/SimulatedFile';
import { verifyWithFileExtension } from '../TestingTools/ApprovalTestHelpers';
import { prettifyHTML } from '../TestingTools/HTMLHelpers';
import { TaskBuilder } from '../TestingTools/TaskBuilder';
import { mockHTMLRenderer } from './RenderingTestHelpers';

window.moment = moment;

beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-08-19'));
});

afterEach(() => {
    jest.useRealTimers();
});

describe('QueryResultsRenderer tests', () => {
    async function verifyRenderedTasksHTML(allTasks: Task[], source: string = '') {
        const renderer = new QueryResultsRenderer(
            'block-language-tasks',
            source,
            new TasksFile('query.md'),
            () => Promise.resolve(),
            null,
            mockHTMLRenderer,
        );
        const queryRendererParameters = {
            allTasks,
            allMarkdownFiles: [],
            backlinksClickHandler: () => Promise.resolve(),
            backlinksMousedownHandler: () => Promise.resolve(),
            editTaskPencilClickHandler: () => Promise.resolve(),
        };
        const container = document.createElement('div');

        await renderer.render(State.Warm, allTasks, container, queryRendererParameters);

        const prettyHTML = prettifyHTML(container.outerHTML);
        verifyWithFileExtension(prettyHTML, 'html');
    }

    it('fully populated task', async () => {
        const allTasks = [TaskBuilder.createFullyPopulatedTask()];
        await verifyRenderedTasksHTML(allTasks);
    });

    const showTree = 'show tree\n';
    const hideTree = 'hide tree\n';

    it('parent-child items hidden', async () => {
        const allTasks = readTasksFromSimulatedFile(inheritance_rendering_sample);
        await verifyRenderedTasksHTML(allTasks, hideTree + 'sort by function task.lineNumber');
    });

    it('parent-child items', async () => {
        const allTasks = readTasksFromSimulatedFile(inheritance_rendering_sample);
        await verifyRenderedTasksHTML(allTasks, showTree + 'sort by function task.lineNumber');
    });

    it('parent-child items reverse sorted', async () => {
        const allTasks = readTasksFromSimulatedFile(inheritance_rendering_sample);
        await verifyRenderedTasksHTML(allTasks, showTree + 'sort by function reverse task.lineNumber');
    });

    it('should render tasks without their parents', async () => {
        // example chosen to match subtasks whose parents do not match the query
        const allTasks = readTasksFromSimulatedFile(inheritance_task_2listitem_3task);
        await verifyRenderedTasksHTML(allTasks, showTree + 'description includes grandchild');
    });
});
