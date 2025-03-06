/**
 * @jest-environment jsdom
 */
import moment from 'moment';
import type { Task } from 'Task/Task';
import { GlobalFilter } from '../../src/Config/GlobalFilter';
import { State } from '../../src/Obsidian/Cache';
import { QueryResultsRenderer } from '../../src/Renderer/QueryResultsRenderer';
import { TasksFile } from '../../src/Scripting/TasksFile';
import inheritance_non_task_child from '../Obsidian/__test_data__/inheritance_non_task_child.json';
import inheritance_rendering_sample from '../Obsidian/__test_data__/inheritance_rendering_sample.json';
import inheritance_task_2listitem_3task from '../Obsidian/__test_data__/inheritance_task_2listitem_3task.json';
import internal_heading_links_test from '../Obsidian/__test_data__/internal_heading_links.json';
import { readTasksFromSimulatedFile } from '../Obsidian/SimulatedFile';
import { verifyWithFileExtension } from '../TestingTools/ApprovalTestHelpers';
import { prettifyHTML } from '../TestingTools/HTMLHelpers';
import { TaskBuilder } from '../TestingTools/TaskBuilder';
import { toMarkdown } from '../TestingTools/TestHelpers';
import { mockHTMLRenderer } from './RenderingTestHelpers';

window.moment = moment;

beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2023-07-05'));
});

afterEach(() => {
    jest.useRealTimers();
    GlobalFilter.getInstance().reset();
});

function makeQueryResultsRenderer(source: string, tasksFile: TasksFile) {
    return new QueryResultsRenderer(
        'block-language-tasks',
        source,
        tasksFile,
        () => Promise.resolve(),
        null,
        mockHTMLRenderer,
    );
}

describe('QueryResultsRenderer tests', () => {
    async function verifyRenderedTasksHTML(allTasks: Task[], source: string = '') {
        const renderer = makeQueryResultsRenderer(source, new TasksFile('query.md'));
        const queryRendererParameters = {
            allTasks,
            allMarkdownFiles: [],
            backlinksClickHandler: () => Promise.resolve(),
            backlinksMousedownHandler: () => Promise.resolve(),
            editTaskPencilClickHandler: () => Promise.resolve(),
        };
        const container = document.createElement('div');

        await renderer.render(State.Warm, allTasks, container, queryRendererParameters);

        const taskAsMarkdown = `<!--
${toMarkdown(allTasks)}
-->\n\n`;

        const prettyHTML = prettifyHTML(container.outerHTML);
        verifyWithFileExtension(taskAsMarkdown + prettyHTML, 'html');
    }

    it('fully populated task', async () => {
        const allTasks = [TaskBuilder.createFullyPopulatedTask()];
        await verifyRenderedTasksHTML(allTasks, 'show urgency');
    });

    it('fully populated task - short mode', async () => {
        const allTasks = [TaskBuilder.createFullyPopulatedTask()];
        await verifyRenderedTasksHTML(allTasks, 'show urgency\nshort mode');
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

    it('should render non task check box when global filter is enabled', async () => {
        GlobalFilter.getInstance().set('#task');
        const allTasks = readTasksFromSimulatedFile(inheritance_non_task_child);
        await verifyRenderedTasksHTML(allTasks, showTree);
    });
});

describe('QueryResultsRenderer - responding to file edits', () => {
    it('should update the query its file path is changed', () => {
        // Arrange
        const source = 'path includes {{query.file.path}}';
        const renderer = makeQueryResultsRenderer(source, new TasksFile('oldPath.md'));
        expect(renderer.query.explainQuery()).toContain('path includes oldPath.md');

        // Act
        renderer.setTasksFile(new TasksFile('newPath.md'));

        // Assert
        expect(renderer.query.explainQuery()).toContain('path includes newPath.md');
    });
});

describe('QueryResultsRenderer - internal heading links', () => {
    let allTasks: Task[];

    beforeAll(() => {
        allTasks = readTasksFromSimulatedFile(internal_heading_links_test);
    });

    async function testHeadingLinks(taskDescription: string, queryFilePath: string, expectedLinks: string[]) {
        const task = allTasks.find((t) => t.description.includes(taskDescription));
        if (!task) throw new Error(`Task with description "${taskDescription}" not found`);

        const renderer = makeQueryResultsRenderer('', new TasksFile(queryFilePath));
        const queryRendererParameters = {
            allTasks: [task],
            allMarkdownFiles: [],
            backlinksClickHandler: () => Promise.resolve(),
            backlinksMousedownHandler: () => Promise.resolve(),
            editTaskPencilClickHandler: () => Promise.resolve(),
        };
        const container = document.createElement('div');

        await renderer.render(State.Warm, [task], container, queryRendererParameters);

        const renderedText = container.innerHTML;
        expectedLinks.forEach((link) => expect(renderedText).toContain(link));
    }

    it('should not modify internal heading links when rendering in same file', async () => {
        await testHeadingLinks('[[#Basic Internal Links]]', 'original.md', [
            '[[Test Data/internal_heading_links.md#Basic Internal Links|Basic Internal Links]]',
        ]);
    });

    it('should convert internal heading links when rendering in different file', async () => {
        await testHeadingLinks('[[#Basic Internal Links]]', 'query.md', [
            '[[Test Data/internal_heading_links.md#Basic Internal Links|Basic Internal Links]]',
        ]);
    });

    it('should handle multiple internal heading links in one description', async () => {
        await testHeadingLinks('[[#Multiple Links In One Task]] and [[#Simple Headers]]', 'query.md', [
            '[[Test Data/internal_heading_links.md#Multiple Links In One Task|Multiple Links In One Task]]',
            '[[Test Data/internal_heading_links.md#Simple Headers|Simple Headers]]',
        ]);
    });

    it('should not modify regular file links', async () => {
        await testHeadingLinks('[[Other File]]', 'query.md', ['[[Other File]]']);
    });

    it('should handle mixed link types correctly', async () => {
        await testHeadingLinks('[[Other File]] and [[#Mixed Link Types]]', 'query.md', [
            '[[Other File]]',
            '[[Test Data/internal_heading_links.md#Mixed Link Types|Mixed Link Types]]',
        ]);
    });

    it('should handle links with spaces in headers', async () => {
        await testHeadingLinks('[[#Headers With Spaces]]', 'query.md', [
            '[[Test Data/internal_heading_links.md#Headers With Spaces|Headers With Spaces]]',
        ]);
    });

    it('should handle special characters in headers', async () => {
        await testHeadingLinks('[[#Headers With Dashes]]', 'query.md', [
            '[[Test Data/internal_heading_links.md#Headers With Dashes|Headers With Dashes]]',
        ]);
        await testHeadingLinks('[[#Headers With Underscores]]', 'query.md', [
            '[[Test Data/internal_heading_links.md#Headers With Underscores|Headers With Underscores]]',
        ]);
    });

    it('should handle links with aliases', async () => {
        await testHeadingLinks('[[#Aliased Links|I am an alias]]', 'query.md', [
            '[[Test Data/internal_heading_links.md#Aliased Links|I am an alias]]',
        ]);
    });

    it('should not modify formatted text that looks like links in code blocks', async () => {
        await testHeadingLinks('`[[#Links In Code Blocks]]`', 'query.md', ['`[[#Links In Code Blocks]]`']);
    });

    it('should not modify escaped links', async () => {
        await testHeadingLinks('\\[\\[#Escaped Links\\]\\]', 'query.md', ['\\[\\[#Escaped Links\\]\\]']);
    });
});
