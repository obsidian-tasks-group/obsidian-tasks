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

describe('QueryResultsRenderer - rendering queries', () => {
    it('should render the toolbar', async () => {
        const source = 'show toolbar';
        const noTasks: Task[] = [];
        const renderer = makeQueryResultsRenderer(source, new TasksFile('file.md'), noTasks);
        const container = document.createElement('div');

        await renderer.render(State.Warm, noTasks, container);

        verifyRenderedTasks(container, noTasks);
    });

    it('should not render the toolbar', async () => {
        const source = 'hide toolbar';
        const noTasks: Task[] = [];
        const renderer = makeQueryResultsRenderer(source, new TasksFile('file.md'), noTasks);
        const container = document.createElement('div');

        await renderer.render(State.Warm, noTasks, container);

        verifyRenderedTasks(container, noTasks);
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
     * Returns the prettified rendered HTML, to allow 'expect' calls to be added.
     * @param description
     */
    public async addFrame(description: string): Promise<string> {
        this.output += `<h2>${description}:</h2>\n\n`;

        const container = document.createElement('div');
        await this.renderer.render(State.Warm, this.allTasks, container);

        const { tasksAsMarkdown, prettyHTML } = tasksMarkdownAndPrettifiedHtml(container, this.allTasks);
        this.output += tasksAsMarkdown + prettyHTML;

        return prettyHTML;
    }

    public verify() {
        verifyWithFileExtension(this.output, 'html');
    }
}

describe('QueryResultsRenderer - sequences', () => {
    const parent = new TaskBuilder().description('parent').dueDate('2025-12-01').build();
    const child = new TaskBuilder().description('child').indentation('  ').id('childID').parent(parent).build();
    const parentAndChild: Task[] = [parent, child];

    it('global query change to task layout option', async () => {
        // see issue #3702
        const source = 'explain';
        const storyboard = new RendererStoryboard(source, parentAndChild);
        const dueDate = '📅 2025-12-01';

        {
            const prettyHTML = await storyboard.addFrame('Initial results');
            expect(prettyHTML).toContain(dueDate);
        }

        GlobalQuery.getInstance().set('hide due date');
        storyboard.renderer.rereadQueryFromFile();

        {
            const prettyHTML = await storyboard.addFrame('Check that due date is hidden by global query');
            expect(prettyHTML).not.toContain(dueDate);
        }

        storyboard.verify();
    });

    it('global query change to query layout option', async () => {
        const source = 'explain';
        const storyboard = new RendererStoryboard(source, parentAndChild);
        const urgency = '<span class="tasks-urgency">10.75</span>';

        {
            const prettyHTML = await storyboard.addFrame('Initial results');
            expect(prettyHTML).not.toContain(urgency);
        }

        GlobalQuery.getInstance().set('show urgency');
        storyboard.renderer.rereadQueryFromFile();

        {
            const prettyHTML = await storyboard.addFrame('Check that urgency is shown by global query');
            expect(prettyHTML).toContain(urgency);
        }

        storyboard.verify();
    });
});
