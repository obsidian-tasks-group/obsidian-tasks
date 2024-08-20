/**
 * @jest-environment jsdom
 */
import moment from 'moment';
import { State } from '../../src/Obsidian/Cache';
import { QueryResultsRenderer } from '../../src/Renderer/QueryResultsRenderer';
import { TasksFile } from '../../src/Scripting/TasksFile';
import { verifyWithFileExtension } from '../TestingTools/ApprovalTestHelpers';
import { prettifyHTML } from '../TestingTools/HTMLHelpers';
import { TaskBuilder } from '../TestingTools/TaskBuilder';

window.moment = moment;

beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-08-19'));
});

afterEach(() => {
    jest.useRealTimers();
});

describe('QueryResultsRenderer tests', () => {
    it('fully populated task', async () => {
        const renderer = new QueryResultsRenderer(
            'block-language-tasks',
            '',
            new TasksFile('query.md'),
            () => Promise.resolve(),
            null,
        );
        const allTasks = [TaskBuilder.createFullyPopulatedTask()];
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
    });
});
