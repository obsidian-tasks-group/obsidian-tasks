/**
 * @jest-environment jsdom
 */
import moment from 'moment';
import type { Task } from 'Task/Task';
import { GlobalFilter } from '../../src/Config/GlobalFilter';
import { GlobalQuery } from '../../src/Config/GlobalQuery';
import { resetSettings, updateSettings } from '../../src/Config/Settings';
import { State } from '../../src/Obsidian/Cache';
import { Query } from '../../src/Query/Query';
import { HtmlQueryResultsRenderer } from '../../src/Renderer/HtmlQueryResultsRenderer';
import { type QueryRendererParameters, QueryResultsRenderer } from '../../src/Renderer/QueryResultsRenderer';
import { TasksFile } from '../../src/Scripting/TasksFile';
import { mockApp } from '../__mocks__/obsidian';
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
    GlobalQuery.getInstance().set('hide toolbar');
});

afterEach(() => {
    jest.useRealTimers();
    GlobalFilter.getInstance().reset();
    GlobalQuery.getInstance().reset();
    resetSettings();
});

function makeQueryRendererParameters(allTasks: Task[]): QueryRendererParameters {
    return {
        allTasks: () => allTasks,
        allMarkdownFiles: () => [],
        backlinksClickHandler: () => Promise.resolve(),
        backlinksMousedownHandler: () => Promise.resolve(),
        editTaskPencilClickHandler: () => {},
    };
}

function makeQueryResultsRenderer(source: string, tasksFile: TasksFile, allTasks: Task[]) {
    const queryRendererParameters = makeQueryRendererParameters(allTasks);
    return new QueryResultsRenderer(
        'block-language-tasks',
        source,
        tasksFile,
        () => Promise.resolve(),
        null,
        mockApp,
        mockHTMLRenderer,
        queryRendererParameters,
    );
}

async function renderTasks(state: State, renderer: QueryResultsRenderer, allTasks: Task[]): Promise<HTMLDivElement> {
    const container = document.createElement('div');

    await renderer.render(state, allTasks, container);
    return container;
}

function verifyRenderedTasks(container: HTMLDivElement, allTasks: Task[]): void {
    const taskAsMarkdown = `<!--
${toMarkdown(allTasks)}
-->\n\n`;

    const prettyHTML = prettifyHTML(container.outerHTML);
    verifyWithFileExtension(taskAsMarkdown + prettyHTML, 'html');
}

async function verifyRenderedHtml(allTasks: Task[], source: string) {
    const tasksFile = new TasksFile('query.md');
    const query = new Query(source, tasksFile);

    const renderer = new HtmlQueryResultsRenderer(
        () => Promise.resolve(),
        null,
        mockApp,
        mockHTMLRenderer,
        makeQueryRendererParameters(allTasks),
        {
            source: () => source,
            tasksFile: () => tasksFile,
            query: () => query,
        },
    );

    const container = document.createElement('div');
    renderer.content = container;
    await renderer.renderQuery(State.Initializing, query.applyQueryToTasks(allTasks));

    verifyRenderedTasks(container, allTasks);
}

describe('QueryResultsRenderer tests', () => {
    async function verifyRenderedTasksHTML(allTasks: Task[], source: string, state: State = State.Warm) {
        const renderer = makeQueryResultsRenderer(source, new TasksFile('query.md'), allTasks);
        const container = await renderTasks(state, renderer, allTasks);
        verifyRenderedTasks(container, allTasks);
    }

    it('loading message', async () => {
        const allTasks = [TaskBuilder.createFullyPopulatedTask()];
        const source = 'show urgency';
        await verifyRenderedHtml(allTasks, source);
    });

    it('error message', async () => {
        const allTasks = [TaskBuilder.createFullyPopulatedTask()];
        await verifyRenderedTasksHTML(allTasks, 'apple sauce');
    });

    it('explain', async () => {
        GlobalQuery.getInstance().set('hide toolbar');
        const allTasks = [TaskBuilder.createFullyPopulatedTask()];
        await verifyRenderedTasksHTML(allTasks, 'scheduled 1970-01-01\nexplain');
    });

    it('toolbar', async () => {
        const allTasks = [new TaskBuilder().path('sample.md').build()];
        await verifyRenderedTasksHTML(allTasks, 'show toolbar', State.Warm);
    });

    it('fully populated task', async () => {
        // The approved file from this test is embedded in the user documentation,
        // so we ignore any GlobalQuery, to avoid accidental changes to the docs:
        GlobalQuery.getInstance().reset();

        const allTasks = [TaskBuilder.createFullyPopulatedTask()];
        await verifyRenderedTasksHTML(allTasks, 'show urgency');
    });

    it('fully populated task - short mode', async () => {
        // The approved file from this test is embedded in the user documentation,
        // so we ignore any GlobalQuery, to avoid accidental changes to the docs:
        GlobalQuery.getInstance().reset();

        const allTasks = [TaskBuilder.createFullyPopulatedTask()];
        await verifyRenderedTasksHTML(allTasks, 'show urgency\nshort mode');
    });

    it('fully populated task - hidden fields', async () => {
        const allTasks = [TaskBuilder.createFullyPopulatedTask()];
        await verifyRenderedTasksHTML(allTasks, 'hide scheduled date\nhide priority');
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

    it('should render four group headings', async () => {
        const allTasks = readTasksFromSimulatedFile('inheritance_task_2listitem_3task');
        await verifyRenderedTasksHTML(
            allTasks,
            `
group by function task.description.length
group by function 'level2'
group by function 'level3'
group by function 'level4'
`,
        );
    });

    it('should allow a task to be in multiple groups', async () => {
        const allTasks = [TaskBuilder.createFullyPopulatedTask()];
        await verifyRenderedTasksHTML(allTasks, "group by function ['heading a', 'heading b']");
    });

    it('should indent nested tasks', async () => {
        const allTasks = readTasksFromSimulatedFile(
            'inheritance_1parent2children2grandchildren1sibling_start_with_heading',
        );
        await verifyRenderedTasksHTML(allTasks, 'show tree');
    });

    it('should render grandchildren once under the parent', async () => {
        const allTasks = readTasksFromSimulatedFile('inheritance_1parent2children2grandchildren1sibling');
        await verifyRenderedTasksHTML(
            allTasks,
            `
show tree
sort by function task.lineNumber
(description includes grandchild) OR (description includes parent)
        `,
        );
    });

    it('should render grandchildren once and on the same level as parent', async () => {
        const allTasks = readTasksFromSimulatedFile('inheritance_1parent2children2grandchildren1sibling');
        await verifyRenderedTasksHTML(
            allTasks,
            `
show tree
sort by function reverse task.lineNumber
(description includes grandchild) OR (description includes parent)
        `,
        );
    });
});

describe('QueryResultsRenderer - responding to file edits', () => {
    it('should update the query when its file path is changed', () => {
        // Arrange
        const source = 'path includes {{query.file.path}}';
        const renderer = makeQueryResultsRenderer(source, new TasksFile('oldPath.md'), []);
        expect(renderer.query.explainQuery()).toContain('path includes oldPath.md');

        // Act
        renderer.setTasksFile(new TasksFile('newPath.md'));

        // Assert
        expect(renderer.query.explainQuery()).toContain('path includes newPath.md');
    });

    it('should be able to reread the query when query settings are changed', () => {
        // Arrange
        updateSettings({ presets: { CurrentGrouping: 'group by PATH' } });
        const source = 'preset CurrentGrouping';
        const renderer = makeQueryResultsRenderer(source, new TasksFile('any file.md'), []);
        expect(renderer.query.explainQuery()).toContain('group by PATH');

        // Act
        updateSettings({ presets: { CurrentGrouping: 'group by DUE' } });
        renderer.rereadQueryFromFile();

        // Assert
        expect(renderer.query.explainQuery()).toContain('group by DUE');
    });
});

describe('Reusing QueryResultsRenderer', () => {
    it('should render the same thing twice - tree', async () => {
        const allTasks = readTasksFromSimulatedFile(
            'inheritance_1parent2children2grandchildren1sibling_start_with_heading',
        );
        const renderer = makeQueryResultsRenderer('show tree', new TasksFile('anywhere.md'), allTasks);
        const container = await renderTasks(State.Warm, renderer, allTasks);
        verifyRenderedTasks(container, allTasks);

        const rerenderedContainer = await renderTasks(State.Warm, renderer, allTasks);
        verifyRenderedTasks(rerenderedContainer, allTasks);
    });

    it('should render the same thing twice - flat', async () => {
        const allTasks = readTasksFromSimulatedFile(
            'inheritance_1parent2children2grandchildren1sibling_start_with_heading',
        );
        const renderer = makeQueryResultsRenderer('hide tree', new TasksFile('anywhere.md'), allTasks);
        const container = await renderTasks(State.Warm, renderer, allTasks);
        verifyRenderedTasks(container, allTasks);

        const rerenderedContainer = await renderTasks(State.Warm, renderer, allTasks);
        verifyRenderedTasks(rerenderedContainer, allTasks);
    });
});

describe('QueryResultsRenderer - internal heading links', () => {
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
        const allTasks = [task];
        const renderer = makeQueryResultsRenderer('', new TasksFile(queryFilePath), allTasks);
        const container = document.createElement('div');

        await renderer.render(State.Warm, allTasks, container);

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
