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
import internal_heading_links_test from '../Obsidian/__test_data__/internal_heading_links_test.json';
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
    /**
     * Create a mock element and check if it contains the expected text after rendering
     */
    async function testHeadingLinks(task: Task, queryFilePath: string, expectedLink: string) {
        // Arrange
        const source = '';
        const renderer = makeQueryResultsRenderer(source, new TasksFile(queryFilePath));
        const queryRendererParameters = {
            allTasks: [task],
            allMarkdownFiles: [],
            backlinksClickHandler: () => Promise.resolve(),
            backlinksMousedownHandler: () => Promise.resolve(),
            editTaskPencilClickHandler: () => Promise.resolve(),
        };
        const container = document.createElement('div');

        // Act
        await renderer.render(State.Warm, [task], container, queryRendererParameters);

        // Assert
        // Search for the rendered task description which should contain our link
        const renderedText = container.innerHTML;
        expect(renderedText).toContain(expectedLink);
    }

    it('should not modify internal heading links when rendering in same file', async () => {
        // Arrange
        const filePath = 'original.md';
        const task = new TaskBuilder()
            .mockData(internal_heading_links_test)
            .description('Task with [[#Internal Header]]')
            .path(filePath)
            .lineNumber(16)
            .build();

        // Assert
        await testHeadingLinks(task, filePath, '[[#Internal Header]]');
    });

    it('should convert internal heading links when rendering in different file', async () => {
        // Arrange
        const taskPath = 'original.md';
        const queryPath = 'query.md';
        const task = new TaskBuilder()
            .mockData(internal_heading_links_test)
            .description('Task with [[#Internal Header]]')
            .path(taskPath)
            .lineNumber(16)
            .build();

        // Assert
        await testHeadingLinks(task, queryPath, '[[original.md#Internal Header|Internal Header]]');
    });

    it('should handle multiple internal heading links in one description', async () => {
        // Arrange
        const taskPath = 'original.md';
        const queryPath = 'query.md';
        const task = new TaskBuilder()
            .mockData(internal_heading_links_test)
            .description('Task with [[#Header 1]] and [[#Header 2]]')
            .path(taskPath)
            .lineNumber(17)
            .build();

        // Assert
        await testHeadingLinks(task, queryPath, '[[original.md#Header 1|Header 1]]');
        await testHeadingLinks(task, queryPath, '[[original.md#Header 2|Header 2]]');
    });

    it('should not modify regular file links', async () => {
        // Arrange
        const taskPath = 'original.md';
        const queryPath = 'query.md';
        const task = new TaskBuilder()
            .mockData(internal_heading_links_test)
            .description('Task with [[Other File]] and [[#Header]]')
            .path(taskPath)
            .lineNumber(18)
            .build();

        // Assert
        await testHeadingLinks(task, queryPath, '[[Other File]]');
        await testHeadingLinks(task, queryPath, '[[original.md#Header|Header]]');
    });

    it('should handle mixed link types correctly', async () => {
        // Arrange
        const taskPath = 'original.md';
        const queryPath = 'query.md';
        const task = new TaskBuilder()
            .mockData(internal_heading_links_test)
            .description('[[#Header 1]] then [[Other File#Header 2]] and [[#Header 3]]')
            .path(taskPath)
            .lineNumber(19)
            .build();

        // Assert
        await testHeadingLinks(task, queryPath, '[[original.md#Header 1|Header 1]]');
        await testHeadingLinks(task, queryPath, '[[Other File#Header 2]]');
        await testHeadingLinks(task, queryPath, '[[original.md#Header 3|Header 3]]');
    });

    it('should handle links with spaces in headers', async () => {
        // Arrange
        const taskPath = 'original.md';
        const queryPath = 'query.md';
        const task = new TaskBuilder()
            .mockData(internal_heading_links_test)
            .description('Task with [[#Header with spaces]]')
            .path(taskPath)
            .lineNumber(20)
            .build();

        // Assert
        await testHeadingLinks(task, queryPath, '[[original.md#Header with spaces|Header with spaces]]');
    });

    it('should handle special characters in headers', async () => {
        // Arrange
        const taskPath = 'original.md';
        const queryPath = 'query.md';
        const task = new TaskBuilder()
            .mockData(internal_heading_links_test)
            .description('Task with [[#Header-with-dashes]] and [[#Header_with_underscores]]')
            .path(taskPath)
            .lineNumber(21)
            .build();

        // Assert
        await testHeadingLinks(task, queryPath, '[[original.md#Header-with-dashes|Header-with-dashes]]');
        await testHeadingLinks(task, queryPath, '[[original.md#Header_with_underscores|Header_with_underscores]]');
    });

    it('should handle links with aliases', async () => {
        // Arrange
        const taskPath = 'original.md';
        const queryPath = 'query.md';
        const task = new TaskBuilder()
            .mockData(internal_heading_links_test)
            .description('Task with [[#Header|I am an alias]]')
            .path(taskPath)
            .lineNumber(22)
            .build();

        // Assert
        await testHeadingLinks(task, queryPath, '[[original.md#Header|I am an alias]]');
    });

    it('should not modify formatted text that looks like links in code blocks', async () => {
        // Arrange
        const taskPath = 'original.md';
        const queryPath = 'query.md';
        const task = new TaskBuilder()
            .mockData(internal_heading_links_test)
            .description('Task with `[[#Header]]` code block')
            .path(taskPath)
            .lineNumber(23)
            .build();

        // Assert
        await testHeadingLinks(task, queryPath, '`[[#Header]]`');
    });

    it('should not modify escaped links', async () => {
        // Arrange
        const taskPath = 'original.md';
        const queryPath = 'query.md';
        const task = new TaskBuilder()
            .mockData(internal_heading_links_test)
            .description('Task with \\[\\[#Header\\]\\] escaped link')
            .path(taskPath)
            .lineNumber(24)
            .build();

        // Assert
        await testHeadingLinks(task, queryPath, '\\[\\[#Header\\]\\]');
    });
});
