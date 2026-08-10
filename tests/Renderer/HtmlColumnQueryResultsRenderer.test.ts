import moment from 'moment';
import { GlobalQuery } from '../../src/Config/GlobalQuery';
import { State } from '../../src/Obsidian/Cache';
import { getQueryForQueryRenderer } from '../../src/Query/QueryRendererHelper';
import { HtmlColumnQueryResultsRenderer } from '../../src/Renderer/HtmlColumnQueryResultsRenderer';
import { Priority } from '../../src/Task/Priority';
import type { Task } from '../../src/Task/Task';
import { mockApp } from '../__mocks__/obsidian';
import { TaskBuilder } from '../TestingTools/TaskBuilder';
import { createTestTasksFile } from '../TestingTools/TasksFileHelpers';
import { makeHtmlQueryRendererParameters, mockHTMLRenderer, verifyHtmlFromRenderer } from './RenderingTestHelpers';

window.moment = moment;

beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-07-13'));
});

afterAll(() => {
    jest.useRealTimers();
});

function makeColumnRenderer(source: string, allTasks: Task[]) {
    const tasksFile = createTestTasksFile('query.md');
    const query = getQueryForQueryRenderer(source, GlobalQuery.getInstance(), tasksFile);

    const renderer = new HtmlColumnQueryResultsRenderer(
        () => Promise.resolve(),
        null,
        mockApp,
        mockHTMLRenderer,
        makeHtmlQueryRendererParameters(allTasks),
        source,
        tasksFile,
        query,
    );
    return { query, renderer };
}

async function verifyHtmlFromColumnRenderer(source: string, tasks: Task[]) {
    const { query, renderer } = makeColumnRenderer(source, tasks);
    await verifyHtmlFromRenderer(renderer, State.Warm, query, tasks);
}

describe('columns rendering', () => {
    const commonInstructions = '\nhide backlink\nhide edit button';
    const due_columns = 'view columns by due' + commonInstructions;
    const priority_columns = 'view columns by priority' + commonInstructions;

    const noTasks: Task[] = [];
    const emptyTask = [new TaskBuilder().build()];

    const withDue = [new TaskBuilder().dueDate('2026-07-13').build()];
    const withDueAndScheduled = [new TaskBuilder().dueDate('2026-06-23').scheduledDate('2025-12-01').build()];

    const twoPriorities = [
        new TaskBuilder().priority(Priority.Highest).build(),
        new TaskBuilder().priority(Priority.Low).build(),
    ];

    it('renders no search results', async () => {
        const tasks = noTasks;
        const source = due_columns;
        await verifyHtmlFromColumnRenderer(source, tasks);
    });

    it('renders no due date column', async () => {
        await verifyHtmlFromColumnRenderer(due_columns, emptyTask);
    });

    it('renders due date column', async () => {
        await verifyHtmlFromColumnRenderer(due_columns, withDue);
    });

    it('renders due date column and scheduled date groups', async () => {
        await verifyHtmlFromColumnRenderer(due_columns + '\ngroup by scheduled', withDueAndScheduled);
    });

    it('renders two priority columns', async () => {
        await verifyHtmlFromColumnRenderer(priority_columns, twoPriorities);
    });

    it('renders one column with two headings', async () => {
        await verifyHtmlFromColumnRenderer(due_columns + '\ngroup by priority', twoPriorities);
    });
});
