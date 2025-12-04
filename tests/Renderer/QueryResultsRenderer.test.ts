/**
 * @jest-environment jsdom
 */
import moment from 'moment';
import type { Task } from 'Task/Task';
import { GlobalQuery } from '../../src/Config/GlobalQuery';
import { resetSettings, updateSettings } from '../../src/Config/Settings';
import { State } from '../../src/Obsidian/Cache';
import { QueryResultsRenderer } from '../../src/Renderer/QueryResultsRenderer';
import { TasksFile } from '../../src/Scripting/TasksFile';
import { mockApp } from '../__mocks__/obsidian';
import { verifyWithFileExtension } from '../TestingTools/ApprovalTestHelpers';
import { TaskBuilder } from '../TestingTools/TaskBuilder';
import {
    makeQueryRendererParameters,
    mockHTMLRenderer,
    tasksMarkdownAndPrettifiedHtml,
    verifyRenderedTasks,
} from './RenderingTestHelpers';

window.moment = moment;

beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2025-12-01'));
});

afterEach(() => {
    jest.useRealTimers();
    resetSettings();
    GlobalQuery.getInstance().reset();
});

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

async function verifyRenderedHtml(allTasks: Task[], source: string, state: State = State.Warm): Promise<void> {
    const renderer = makeQueryResultsRenderer(source, new TasksFile('file.md'), allTasks);
    const container = document.createElement('div');

    await renderer.render(state, allTasks, container);

    verifyRenderedTasks(container, allTasks);
}

describe('QueryResultsRenderer - accessing results', () => {
    const aTask = [new TaskBuilder().description('task').build()];
    const twoTasks = [...aTask, new TaskBuilder().description('another task').build()];

    it('should have empty results before rendering', () => {
        const renderer = makeQueryResultsRenderer('', new TasksFile('file.md'), aTask);

        expect(renderer.queryResult.totalTasksCount).toEqual(0);
        expect(renderer.filteredQueryResult.totalTasksCount).toEqual(0);
    });

    it('should have actual results after rendering', async () => {
        const renderer = makeQueryResultsRenderer('', new TasksFile('file.md'), aTask);

        await renderer.render(State.Warm, aTask, document.createElement('div'));

        expect(renderer.queryResult.totalTasksCount).toEqual(1);
        expect(renderer.filteredQueryResult.totalTasksCount).toEqual(1);
    });

    it('should have actual result after filtering results', async () => {
        const renderer = makeQueryResultsRenderer('', new TasksFile('file.md'), twoTasks);

        await renderer.render(State.Warm, twoTasks, document.createElement('div'));

        await renderer.applySearchBoxFilter('another', document.createElement('div'));

        expect(renderer.queryResult.totalTasksCount).toEqual(2);
        expect(renderer.filteredQueryResult.totalTasksCount).toEqual(1);
        expect(await renderer.resultsAsMarkdown()).toMatchInlineSnapshot(`
            "- [ ] another task
            "
        `);
    });
});

describe('QueryResultsRenderer - rendering queries', () => {
    beforeEach(() => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date('2023-07-05'));
    });

    it('should render the toolbar', async () => {
        const source = 'show toolbar';
        const noTasks: Task[] = [];
        await verifyRenderedHtml(noTasks, source);
    });

    it('should not render the toolbar', async () => {
        const source = 'hide toolbar';
        const noTasks: Task[] = [];
        await verifyRenderedHtml(noTasks, source);
    });

    it('fully populated task', async () => {
        // The approved file from this test is embedded in the user documentation,
        // so we ignore any GlobalQuery, to avoid accidental changes to the docs:
        GlobalQuery.getInstance().reset();

        const allTasks = [TaskBuilder.createFullyPopulatedTask()];
        await verifyRenderedHtml(allTasks, 'show urgency');
    });

    it('fully populated task - short mode', async () => {
        // The approved file from this test is embedded in the user documentation,
        // so we ignore any GlobalQuery, to avoid accidental changes to the docs:
        GlobalQuery.getInstance().reset();

        const allTasks = [TaskBuilder.createFullyPopulatedTask()];
        await verifyRenderedHtml(allTasks, 'show urgency\nshort mode');
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

/**
 * See https://github.com/approvals/ApprovalTests.Python/blob/main/docs/reference/storyboard.md
 */
class RendererStoryboard {
    private output: string = '';
    private readonly allTasks: Task[];
    readonly renderer: QueryResultsRenderer;

    constructor(source: string, allTasks: Task[]) {
        this.allTasks = allTasks;
        this.renderer = makeQueryResultsRenderer(source, new TasksFile('file.md'), allTasks);
    }

    /**
     * This simulates QueryRenderer.renderResults()
     * Returns the prettified rendered HTML, to allow 'expect' calls to be added.
     * @param description
     */
    public async renderAndAddFrame(description: string) {
        const container = document.createElement('div');
        await this.renderer.render(State.Warm, this.allTasks, container);

        return this.addFrame(description, container);
    }

    public addFrame(description: string, container: HTMLDivElement) {
        this.output += `<h2>${description}:</h2>\n\n`;
        this.output += `<p>Results filter: '${this.renderer.filterString}'</p>\n`;

        const { tasksAsMarkdown, prettyHTML } = tasksMarkdownAndPrettifiedHtml(container, this.allTasks);
        this.output += tasksAsMarkdown + prettyHTML;

        return { prettyHTML, container };
    }

    public verify() {
        verifyWithFileExtension(this.output, 'html');
    }
}

describe('QueryResultsRenderer - sequences', () => {
    const parent = new TaskBuilder().description('parent').dueDate('2025-12-01').build();
    const child = new TaskBuilder().description('child').indentation('  ').id('childID').parent(parent).build();
    const parentAndChild = [parent, child];

    it('global query change to task layout option', async () => {
        // see issue #3702
        const source = 'explain';
        const storyboard = new RendererStoryboard(source, parentAndChild);
        const dueDate = '📅 2025-12-01';

        {
            const { prettyHTML } = await storyboard.renderAndAddFrame('Initial results');
            expect(prettyHTML).toContain(dueDate);
        }

        GlobalQuery.getInstance().set('hide due date');
        storyboard.renderer.rereadQueryFromFile();

        {
            const { prettyHTML } = await storyboard.renderAndAddFrame('Check that due date is hidden by global query');
            expect(prettyHTML).not.toContain(dueDate);
        }

        storyboard.verify();
    });

    it('global query change to query layout option', async () => {
        const source = 'explain';
        const storyboard = new RendererStoryboard(source, parentAndChild);
        const urgency = '<span class="tasks-urgency">10.75</span>';

        {
            const { prettyHTML } = await storyboard.renderAndAddFrame('Initial results');
            expect(prettyHTML).not.toContain(urgency);
        }

        GlobalQuery.getInstance().set('show urgency');
        storyboard.renderer.rereadQueryFromFile();

        {
            const { prettyHTML } = await storyboard.renderAndAddFrame('Check that urgency is shown by global query');
            expect(prettyHTML).toContain(urgency);
        }

        storyboard.verify();
    });

    it('rerendered results retain the filter', async () => {
        const storyboard = new RendererStoryboard('', parentAndChild);

        const { container } = await storyboard.renderAndAddFrame('Initial results');

        await storyboard.renderer.applySearchBoxFilter('parent', container);
        storyboard.addFrame('Filtered results (parent)', container);

        GlobalQuery.getInstance().set('sort by function reverse task.description.length');
        storyboard.renderer.rereadQueryFromFile();

        // The following renders two tasks, not one because the filter is lost
        await storyboard.renderAndAddFrame('Filtered results after editing Global Query');

        storyboard.verify();
    });
});
