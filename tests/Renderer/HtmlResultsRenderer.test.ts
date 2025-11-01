/**
 * @jest-environment jsdom
 */
import moment from 'moment';
import type { Task } from 'Task/Task';
import { GlobalFilter } from '../../src/Config/GlobalFilter';
import { State } from '../../src/Obsidian/Cache';
import { HtmlQueryResultsRenderer } from '../../src/Renderer/HtmlQueryResultsRenderer';
import { TasksFile } from '../../src/Scripting/TasksFile';
import { verifyWithFileExtension } from '../TestingTools/ApprovalTestHelpers';
import { prettifyHTML } from '../TestingTools/HTMLHelpers';
import { TaskBuilder } from '../TestingTools/TaskBuilder';
import { toMarkdown } from '../TestingTools/TestHelpers';
import { resetSettings } from '../../src/Config/Settings';
import { mockApp } from '../__mocks__/obsidian';
import { readTasksFromSimulatedFile } from '../Obsidian/SimulatedFile';
import { Query } from '../../src/Query/Query';
import { mockHTMLRenderer } from './RenderingTestHelpers';

window.moment = moment;

beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2023-07-05'));
});

afterEach(() => {
    jest.useRealTimers();
    GlobalFilter.getInstance().reset();
    resetSettings();
});

function makeHtmlResultsRenderer(source: string, tasksFile: TasksFile) {
    const query = new Query(source, tasksFile);
    return new HtmlQueryResultsRenderer(
        source,
        tasksFile,
        query,
        () => Promise.resolve(),
        null,
        mockApp,
        mockHTMLRenderer,
    );
}

describe('HtmlResultsRenderer tests', () => {
    async function verifyRenderedTasksHTML(allTasks: Task[], source: string = '') {
        const renderer = makeHtmlResultsRenderer(source, new TasksFile('query.md'));
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
        const allTasks = readTasksFromSimulatedFile('inheritance_rendering_sample');
        await verifyRenderedTasksHTML(allTasks, hideTree + 'sort by function task.lineNumber');
    });

    it('parent-child items', async () => {
        const allTasks = readTasksFromSimulatedFile('inheritance_rendering_sample');
        await verifyRenderedTasksHTML(allTasks, showTree + 'sort by function task.lineNumber');
    });

    it('parent-child items reverse sorted', async () => {
        const allTasks = readTasksFromSimulatedFile('inheritance_rendering_sample');
        await verifyRenderedTasksHTML(allTasks, showTree + 'sort by function reverse task.lineNumber');
    });

    it('should render tasks without their parents', async () => {
        // example chosen to match subtasks whose parents do not match the query
        const allTasks = readTasksFromSimulatedFile('inheritance_task_2listitem_3task');
        await verifyRenderedTasksHTML(allTasks, showTree + 'description includes grandchild');
    });

    it('should render non task check box when global filter is enabled', async () => {
        GlobalFilter.getInstance().set('#task');
        const allTasks = readTasksFromSimulatedFile('inheritance_non_task_child');
        await verifyRenderedTasksHTML(allTasks, showTree);
    });
});

describe('HtmlResultsRenderer - internal heading links', () => {
    let tasksByHeading: Record<string, Task>;

    beforeAll(() => {
        const allTasks = readTasksFromSimulatedFile('internal_heading_links');

        tasksByHeading = allTasks.reduce((acc, task) => {
            const heading = task.taskLocation.precedingHeader ?? '';

            // For now, the test design only supports one task per heading, so make it an error
            // if there are multiple tasks in this heading:
            if (acc[heading]) {
                throw new Error(`Multiple tasks found under the heading: "${heading}".
The test design only supports one task per heading currently, so this is an error.

Edit "${task.path}" to move one of these lines to a separate heading:
"${acc[heading].originalMarkdown}"
"${task.originalMarkdown}"

And then rerun the command "Templater: Insert _meta/templates/convert_test_data_markdown_to_js.md".

For more info: https://publish.obsidian.md/tasks-contributing/Testing/Using+Obsidian+API+in+tests
`);
            }

            acc[heading] = task;
            return acc;
        }, {} as Record<string, Task>);
    });

    async function renderTask(task: Task, queryFilePath: string = 'query.md') {
        const renderer = makeHtmlResultsRenderer('', new TasksFile(queryFilePath));
        const queryRendererParameters = {
            allTasks: [task],
            allMarkdownFiles: [],
            backlinksClickHandler: () => Promise.resolve(),
            backlinksMousedownHandler: () => Promise.resolve(),
            editTaskPencilClickHandler: () => Promise.resolve(),
        };
        const container = document.createElement('div');

        await renderer.render(State.Warm, [task], container, queryRendererParameters);

        return container.querySelector('.task-description')?.innerHTML ?? '';
    }

    it('should not modify description when rendering in same file', async () => {
        const description = await renderTask(
            tasksByHeading['Basic Internal Links'],
            'Test Data/internal_heading_links.md',
        );
        expect(description).toMatchInlineSnapshot('"<span>#task Task with<br>[[#Basic Internal Links]]</span>"');
    });

    it('should convert internal heading links when rendering in different file', async () => {
        const description = await renderTask(tasksByHeading['Basic Internal Links'], 'query.md');
        expect(description).toMatchInlineSnapshot(
            '"<span>#task Task with<br>[[Test Data/internal_heading_links.md#Basic Internal Links|Basic Internal Links]]</span>"',
        );
    });

    it('should handle multiple internal heading links in one description', async () => {
        const description = await renderTask(tasksByHeading['Multiple Links In One Task'], 'query.md');
        expect(description).toMatchInlineSnapshot(
            '"<span>#task Task with<br>[[Test Data/internal_heading_links.md#Multiple Links In One Task|Multiple Links In One Task]] and<br>[[Test Data/internal_heading_links.md#Simple Headers|Simple Headers]]</span>"',
        );
    });

    it('should not modify regular file links', async () => {
        const description = await renderTask(tasksByHeading['External File Links'], 'query.md');
        expect(description).toMatchInlineSnapshot('"<span>#task Task with<br>[[Other File]]</span>"');
    });

    it('should handle header links with mixed link types', async () => {
        const description = await renderTask(tasksByHeading['Mixed Link Types'], 'query.md');
        expect(description).toMatchInlineSnapshot(
            '"<span>#task Task with<br>[[Other File]] and<br>[[Test Data/internal_heading_links.md#Mixed Link Types|Mixed Link Types]]</span>"',
        );
    });

    it('should handle header links with file references', async () => {
        const description = await renderTask(tasksByHeading['Header Links With File Reference'], 'query.md');
        expect(description).toMatchInlineSnapshot(
            '"<span>#task<br>[[Test Data/internal_heading_links.md#Header Links With File Reference|Header Links With File Reference]] then<br>[[Other File#Some Header]] and<br>[[Test Data/internal_heading_links.md#Another Header|Another Header]]</span>"',
        );
    });

    it('should handle header links with special characters', async () => {
        const description = await renderTask(tasksByHeading['Headers-With_Special Characters'], 'query.md');
        expect(description).toMatchInlineSnapshot(
            '"<span>#task Task with<br>[[Test Data/internal_heading_links.md#Headers-With_Special Characters|Headers-With_Special Characters]]</span>"',
        );
    });

    it('should handle links with aliases', async () => {
        const description = await renderTask(tasksByHeading['Aliased Links'], 'query.md');
        expect(description).toMatchInlineSnapshot(
            '"<span>#task Task with<br>[[Test Data/internal_heading_links.md#Aliased Links|I am an alias]]</span>"',
        );
    });

    it('should not modify formatted text that looks like links in code blocks', async () => {
        const description = await renderTask(tasksByHeading['Links In Code Blocks'], 'query.md');
        expect(description).toMatchInlineSnapshot(
            '"<span>#task Task with `[[#Links In Code Blocks]]` code block</span>"',
        );
    });

    it('should not modify escaped links', async () => {
        const description = await renderTask(tasksByHeading['Escaped Links'], 'query.md');
        expect(description).toMatchInlineSnapshot(
            '"<span>#task Task with \\[\\[#Escaped Links\\]\\] escaped link</span>"',
        );
    });
});
