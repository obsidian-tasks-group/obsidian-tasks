/**
 * @jest-environment jsdom
 */
import moment from 'moment';
import type { Task } from 'Task/Task';
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

afterEach(() => {
    resetSettings();
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

describe('QueryResultsRenderer - sequences', () => {
    const parent = new TaskBuilder().description('parent').dueDate('2025-12-01').build();
    const child = new TaskBuilder().description('child').indentation('  ').id('childID').parent(parent).build();
    const parentAndChild: Task[] = [parent, child];

    it('should detect query file default changes', async () => {
        // render search result (parent + child)
        const source = '';
        const renderer = makeQueryResultsRenderer(source, new TasksFile('file.md'), parentAndChild);
        const container = document.createElement('div');

        await renderer.render(State.Warm, parentAndChild, container);

        const { tasksAsMarkdown, prettyHTML } = tasksMarkdownAndPrettifiedHtml(container, parentAndChild);
        const output = '<h2>Initial results:</h2>\n\n' + tasksAsMarkdown + prettyHTML;

        // add a frame
        // change a task layout option via query file default
        // manually trigger rerendering
        // add a frame

        verifyWithFileExtension(output, 'html');
    });
});
